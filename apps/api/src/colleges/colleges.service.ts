// src/colleges/colleges.service.ts
import { BadRequestException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { College, CollegeDocument } from "./college.schema";

// ============================================================
// Public-facing types
// ============================================================

export type CollegeSearchQuery = {
  course?: string;
  state?: string;
  city?: string;
  name?: string;
};

export type CollegeSuggestion = {
  id: string;
  name: string;
  slug: string;
  seriesId: number; // required by find-college-by-url alongside slug
  logo: string | null;
};

export type ScrapedCourse = {
  category: string;
  name: string;
  shortForm: string | null;
  branches: string[];
};

export type ScrapedCollegeReview = {
  rating: number; // college360 uses a 0–10 scale, not 0–5
  comment: string;
};

export type ScrapedCollegePhoto = {
  url: string;
  activity?: string;
};

/** Full detail payload — everything mapped from college360's response. */
export type ScrapedCollegeResult = {
  slug: string;
  seriesId: number;
  name: string;
  city: string | null;
  state: string | null;
  fullAddress: string | null;
  about: string | null;
  courses: ScrapedCourse[];
  coursesByCategory: Record<string, ScrapedCourse[]>;
  facilities: string[];
  reviews: ScrapedCollegeReview[]; // top 5 by rating
  image: string | null;
  backgroundImage: string | null;
  photos: ScrapedCollegePhoto[];
  averageFees: number | null; // TODO: fee[] shape still unconfirmed
  aggregateRating: number | null;
};

/** Trimmed view for the "user selected a college, show its detail page" screen. */
export type CollegeDetailView = {
  name: string;
  shortDescription: string | null;
  logo: string | null;
  backgroundImage: string | null;
  photos: ScrapedCollegePhoto[];
  address: {
    full: string | null;
    city: string | null;
    state: string | null;
  };
  coursesByCategory: Record<string, { name: string; shortForm: string | null }[]>;
  reviews: { rating: number; comment: string }[];
};

// ============================================================
// college360 raw response types
// ============================================================

type College360SearchResult = {
  _id: string;
  name: string;
  logo: string;
  type: string[];
  url: string;
  seriesId: number;
};

type College360DetailResponse = {
  status: number;
  data: {
    info: College360DetailInfo;
    existenceMap?: Record<string, unknown>;
  };
  message: string;
};

type College360Photo = {
  _id?: string;
  activity?: string;
  image?: string;
  status?: string;
};

type College360DetailInfo = {
  _id: string;
  name: string;
  logo: string;
  backgroundImg?: string;
  photos?: College360Photo[];
  sortDescription?: string;
  address?: College360Address;
  course?: College360Course[];
  review?: College360Review[];
  facilitites?: College360Facility[]; // API's own typo — not fixing it, just matching it
  fee?: College360Fee[]; // TODO: shape unconfirmed
  aggregateRatingValue?: string;
  seriesId: number;
  url: string;
};

type College360Course = {
  _id: string;
  category?: { _id: string; category: string };
  courseType?: {
    _id: string;
    course: string;
    sortForm?: string;
    branch?: { _id: string; branch: string }[];
    duration?: { duration: string };
  };
  description?: string;
};

type College360Review = {
  _id: string;
  review: string; // this is the comment text
  rating: number; // 0–10 scale, confirmed
};

type College360Facility = {
  _id: string;
  facility: string;
};

type College360Address = {
  _id: string;
  address: string;
  contact?: string;
  country?: { _id: string; name: string };
  state?: { _id: string; state: string };
  city?: { _id: string; state: string; city: string };
};

// TODO: unconfirmed — replace once a sample fee[0] entry is available.
type College360Fee = {
  amount?: number | string;
  [key: string]: unknown;
};

// ============================================================
// Config
// ============================================================

const COLLEGE360_API_BASE = "https://backend.college360.co.in/api/college360/v1";
const COLLEGE360_ASSET_BASE = "https://dfhe5ze0n4pxu.cloudfront.net";

// Confirmed: requires BOTH url (slug) and seriesId together.
const COLLEGE_DETAIL_ENDPOINT = (slug: string, seriesId: number) =>
  `${COLLEGE360_API_BASE}/client/find-college-by-url?url=${encodeURIComponent(slug)}&seriesId=${seriesId}`;

const FETCH_TIMEOUT_MS = 8_000;
const SUGGESTION_CACHE_TTL_MS = 10 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_SUGGESTIONS = 8;
const MAX_COURSE_FILTER_LOOKUPS = 15;
const COURSE_FILTER_CONCURRENCY = 4;
const TOP_REVIEWS_LIMIT = 5;

type CacheEntry<T> = { data: T; expiresAt: number };

// ============================================================
// Service
// ============================================================

@Injectable()
export class CollegesService implements OnModuleInit {
  private readonly logger = new Logger(CollegesService.name);

  private readonly suggestionCache = new Map<string, CacheEntry<CollegeSuggestion[]>>();
  // keyed by `${slug}:${seriesId}` since the detail endpoint requires both together.
  private readonly detailCache = new Map<string, CacheEntry<ScrapedCollegeResult>>();

  constructor(
    @InjectModel(College.name)
    private readonly colleges: Model<CollegeDocument>,
  ) {}

  async onModuleInit() {
    if (await this.colleges.countDocuments()) return;
    // await this.colleges.insertMany(seedData);
  }

  // ---- internal DB (your own colleges collection) ----

  findAll(query: CollegeSearchQuery & { page?: number; limit?: number }) {
    const filter: Record<string, unknown> = {};

    if (query.course) {
      filter.courses = { $regex: this.escapeRegExp(query.course), $options: "i" };
    }
    for (const field of ["state", "city", "name"] as const) {
      const value = query[field];
      if (value) {
        filter[field] = { $regex: this.escapeRegExp(value), $options: "i" };
      }
    }

    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
    const page = Math.max(Number(query.page) || 1, 1);

    return this.colleges
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  findOne(id: string) {
    return this.colleges.findById(id).lean();
  }

  // ---- college360 search (step 1: pick a college) ----

  /**
   * Search priority: college name if provided, else city. At least one is required —
   * course alone can't drive college360's search endpoint (it indexes names/locations,
   * not courses), so course is applied as a post-filter, not a primary search term.
   * All ownership types (government + private) are returned — no ownership filtering.
   */
  async suggest(query: CollegeSearchQuery): Promise<{
    searchTerm: string;
    source: "name" | "city";
    suggestions: CollegeSuggestion[];
  }> {
    const name = query.name?.trim();
    const city = query.city?.trim();

    if (!name && !city) {
      throw new BadRequestException("Provide at least a college name or a city to search.");
    }

    const searchTerm = name || city!;
    const source: "name" | "city" = name ? "name" : "city";

    let suggestions = await this.getOrFetchSuggestions(searchTerm);

    if (query.course) {
      suggestions = await this.filterByCourse(suggestions.slice(0, MAX_COURSE_FILTER_LOOKUPS), query.course.trim());
    }

    return { searchTerm, source, suggestions: suggestions.slice(0, MAX_SUGGESTIONS) };
  }

  // ---- college360 detail (step 2: user picked one) ----

  /** Full detail payload — courses with branches, all reviews mapped, etc. */
  async scrape(slug: string, seriesId: number): Promise<ScrapedCollegeResult | null> {
    return this.fetchDetail(slug, seriesId);
  }

  /** Trimmed view for the college detail screen: name, short desc, logo, bg image, address, courses by category, top reviews. */
  async getCollegeDetailView(slug: string, seriesId: number): Promise<CollegeDetailView | null> {
    const scraped = await this.fetchDetail(slug, seriesId);
    if (!scraped) return null;

    return {
      name: scraped.name,
      shortDescription: scraped.about,
      logo: scraped.image,
      backgroundImage: scraped.backgroundImage,
      photos: scraped.photos,
      address: {
        full: scraped.fullAddress,
        city: scraped.city,
        state: scraped.state,
      },
      coursesByCategory: this.simplifyCoursesByCategory(scraped.coursesByCategory),
      reviews: scraped.reviews,
    };
  }

  /** Persists a scraped result into your own `colleges` collection. */
  async scrapeAndSave(slug: string, seriesId: number) {
    const scraped = await this.fetchDetail(slug, seriesId);
    if (!scraped) return null;

    // Flatten "category — course name" to fit the schema's plain string[] `courses`.
    // Branches are intentionally dropped here to avoid bloating a single string field;
    // they remain available via scrape()/getCollegeDetailView() for anyone who needs them.
    const flattenedCourses = scraped.courses.map((c) => `${c.category} — ${c.name}`);

    // Your schema requires `name` on each review; college360 has no reviewer name field,
    // so a placeholder is used here only for the persisted copy — the live detail view
    // (getCollegeDetailView) intentionally omits this fabricated field.
    const reviewsForSchema = scraped.reviews.map((r) => ({
      name: "College360 Student",
      rating: r.rating,
      comment: r.comment,
    }));

    return this.colleges
      .findOneAndUpdate(
        { name: scraped.name },
        {
          $set: {
            name: scraped.name,
            city: scraped.city ?? "",
            state: scraped.state ?? "",
            about: scraped.about ?? "",
            courses: flattenedCourses,
            reviews: reviewsForSchema,
            image: scraped.image ?? undefined,
            averageFees: scraped.averageFees ?? undefined,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();
  }

  // ============================================================
  // Suggestion fetch + cache
  // ============================================================

  private async getOrFetchSuggestions(searchTerm: string): Promise<CollegeSuggestion[]> {
    const cached = this.getCached(this.suggestionCache, searchTerm);
    if (cached) return cached;

    const raw = await this.fetchJson<College360SearchResult[]>(
      `${COLLEGE360_API_BASE}/client/college/search/?search=${encodeURIComponent(searchTerm)}`,
    );

    const suggestions: CollegeSuggestion[] = (raw ?? []).map((item) => ({
      id: item._id,
      name: item.name.trim(),
      slug: item.url,
      seriesId: item.seriesId,
      logo: this.formatAssetUrl(item.logo),
    }));

    this.setCached(this.suggestionCache, searchTerm, suggestions, SUGGESTION_CACHE_TTL_MS);
    return suggestions;
  }

  // ============================================================
  // Course post-filter (fan-out capped + batched)
  // ============================================================

  private async filterByCourse(candidates: CollegeSuggestion[], course: string): Promise<CollegeSuggestion[]> {
    const courseLower = course.toLowerCase();
    const matched: CollegeSuggestion[] = [];

    for (let i = 0; i < candidates.length; i += COURSE_FILTER_CONCURRENCY) {
      const batch = candidates.slice(i, i + COURSE_FILTER_CONCURRENCY);
      const details = await Promise.all(batch.map((c) => this.fetchDetail(c.slug, c.seriesId)));

      batch.forEach((candidate, idx) => {
        const courseNames = details[idx]?.courses.map((c) => c.name.toLowerCase()) ?? [];
        if (courseNames.some((c) => c.includes(courseLower))) {
          matched.push(candidate);
        }
      });
    }

    return matched;
  }

  // ============================================================
  // Detail fetch + cache + mapping
  // ============================================================

  private async fetchDetail(slug: string, seriesId: number): Promise<ScrapedCollegeResult | null> {
    const cacheKey = `${slug}:${seriesId}`;
    const cached = this.getCached(this.detailCache, cacheKey);
    if (cached) return cached;

    const raw = await this.fetchJson<College360DetailResponse>(COLLEGE_DETAIL_ENDPOINT(slug, seriesId));
    if (!raw?.data?.info) return null;

    const info = raw.data.info;
    const courses = this.mapCourses(info.course);

    const result: ScrapedCollegeResult = {
      slug,
      seriesId,
      name: info.name?.trim() ?? slug,
      city: info.address?.city?.city ?? null,
      state: info.address?.state?.state ?? null,
      fullAddress: info.address?.address ?? null,
      about: this.stripHtml(info.sortDescription),
      courses,
      coursesByCategory: this.groupCoursesByCategory(courses),
      facilities: (info.facilitites ?? []).map((f) => f.facility).filter(Boolean),
      reviews: this.mapTopReviews(info.review, TOP_REVIEWS_LIMIT),
      image: this.formatAssetUrl(info.logo),
      backgroundImage: this.formatAssetUrl(info.backgroundImg),
      photos: this.mapPhotos(info.photos),
      averageFees: this.computeAverageFee(info.fee),
      aggregateRating: info.aggregateRatingValue ? Number(info.aggregateRatingValue) : null,
    };

    this.setCached(this.detailCache, cacheKey, result, DETAIL_CACHE_TTL_MS);
    return result;
  }

  private mapPhotos(rawPhotos?: College360Photo[]): ScrapedCollegePhoto[] {
    if (!rawPhotos?.length) return [];
    return rawPhotos
      .filter((p) => Boolean(p.image))
      .map((p) => ({
        url: this.formatAssetUrl(p.image)!,
        activity: p.activity?.trim() || undefined,
      }))
      .filter((p) => Boolean(p.url));
  }

  private mapCourses(rawCourses?: College360Course[]): ScrapedCourse[] {
    if (!rawCourses?.length) return [];

    return rawCourses
      .filter((c) => c.category?.category && c.courseType?.course)
      .map((c) => ({
        category: c.category!.category.trim(),
        name: c.courseType!.course.trim(),
        shortForm: c.courseType!.sortForm?.trim() || null,
        branches: (c.courseType!.branch ?? []).map((b) => b.branch.trim()),
      }));
  }

  private groupCoursesByCategory(courses: ScrapedCourse[]): Record<string, ScrapedCourse[]> {
    const grouped: Record<string, ScrapedCourse[]> = {};
    for (const course of courses) {
      (grouped[course.category] ??= []).push(course);
    }
    return grouped;
  }

  private simplifyCoursesByCategory(
    grouped: Record<string, ScrapedCourse[]>,
  ): Record<string, { name: string; shortForm: string | null }[]> {
    const simplified: Record<string, { name: string; shortForm: string | null }[]> = {};
    for (const [category, courses] of Object.entries(grouped)) {
      simplified[category] = courses.map((c) => ({ name: c.name, shortForm: c.shortForm }));
    }
    return simplified;
  }

  /**
   * college360 reviews have no reviewer name — only `review` (comment text) and
   * `rating` (0–10 scale, confirmed from sample data). Sorted by rating descending,
   * top N returned.
   */
  private mapTopReviews(rawReviews?: College360Review[], limit = TOP_REVIEWS_LIMIT): ScrapedCollegeReview[] {
    if (!rawReviews?.length) return [];

    return [...rawReviews]
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, limit)
      .map((r) => ({
        rating: Number(r.rating ?? 0),
        comment: r.review ?? "",
      }));
  }

  /**
   * fee[] shape is still unconfirmed — this is a best-effort placeholder that
   * averages any numeric `amount` field found. Revisit once a real fee[0] sample
   * is available; it may need per-course rather than blanket averaging.
   */
  private computeAverageFee(fees?: College360Fee[]): number | null {
    if (!fees?.length) return null;
    const amounts = fees.map((f) => Number(f.amount)).filter((n) => !Number.isNaN(n));
    if (!amounts.length) return null;
    return Math.round(amounts.reduce((sum, n) => sum + n, 0) / amounts.length);
  }

  private stripHtml(value?: string): string | null {
    if (!value) return null;
    return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  // ============================================================
  // Generic fetch/cache helpers
  // ============================================================

  private async fetchJson<T>(url: string): Promise<T | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        this.logger.warn(`Non-OK response (${response.status}) from ${url}`);
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      this.logger.warn(`Fetch failed for ${url}: ${(error as Error).message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCached<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttlMs: number) {
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  private formatAssetUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      if (path.includes("college360.co.in/")) {
        return path.replace("https://college360.co.in/", `${COLLEGE360_ASSET_BASE}/`).replace("http://college360.co.in/", `${COLLEGE360_ASSET_BASE}/`);
      }
      return path;
    }
    const cleanPath = path.replace(/^\/+/, "");
    return `${COLLEGE360_ASSET_BASE}/${cleanPath}`;
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}