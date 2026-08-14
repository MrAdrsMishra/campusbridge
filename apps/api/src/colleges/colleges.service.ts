// src/colleges/colleges.service.ts
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
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
  coursesByCategory: Record<
    string,
    { name: string; shortForm: string | null }[]
  >;
  reviews: { rating: number; comment: string }[];
};

// Shiksha autocomplete result — the frontend uses `url` for the next request.
export type ShikshaCategoryResult = {
  name: string;
  url: string;
};

/** Clean internal type for a college discovered via Shiksha, resolved against College360. */
export type CollegeListItem = {
  instituteId: number | null;
  name: string;
  logo: string | null;
  headerImage: string | null;
  minFees: number | null;
  maxFees: number | null;
};

// ============================================================
// college360 raw response types

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
// Shiksha raw response types
// ============================================================

type ShikshaAutosuggestResponse = {
  status: string;
  data?: {
    searchKeyword?: string;
    solrResults?: ShikshaSolrResult[];
  };
};

type ShikshaSolrResult = {
  name: string;
  type?: string | null;
  url?: string | null;
};

type ShikshaCategoryResponse = {
  status: string;
  data?: {
    numberOfResultsFound?: number;
    instituteTuples?: ShikshaInstituteTuple[];
  };
};

type ShikshaInstituteTuple = {
  instituteId?: number;
  name?: string;
  minFees?: number | null;
  maxFees?: number | null;
  logoImageUrl?: string | null;
  instituteHeaderImageUrl?: string | null;
};

// ============================================================
// Config
// ============================================================

// const COLLEGE360_API_BASE = "https://backend.college360.co.in/api/college360/v1";
const COLLEGE360_API_BASE =
  "https://backend.college360.co.in/api/college360/v1";
const COLLEGE360_ASSET_BASE = "https://dfhe5ze0n4pxu.cloudfront.net";

// Confirmed: requires BOTH url (slug) and seriesId together.
const COLLEGE_DETAIL_ENDPOINT = (slug: string, seriesId: number) =>
  `${COLLEGE360_API_BASE}/client/find-college-by-url?url=${encodeURIComponent(slug)}&seriesId=${seriesId}`;

// College360 search — used to resolve a Shiksha college name into a slug + seriesId.
const COLLEGE360_SEARCH_ENDPOINT = (name: string) =>
  `${COLLEGE360_API_BASE}/client/college/search/?search=${encodeURIComponent(name)}`;

// Shiksha auto-suggest (pattern from the autosuggestorApi reference) and category page APIs.
const SHIKSHA_API_BASE = "https://apis.shiksha.com/apigateway";
const SHIKSHA_AUTOSUGGEST_ENDPOINT = `${SHIKSHA_API_BASE}/autosuggestorApi/v1/info/getAutosuggestorResults`;
// getCategoryPageFull (not getCategoryPageFullData) is the live category endpoint; data = base64({ url }).
const SHIKSHA_CATEGORY_ENDPOINT = `${SHIKSHA_API_BASE}/categorypageapi/v4/info/getCategoryPageFull`;

const FETCH_TIMEOUT_MS = 8_000;
const SUGGESTION_CACHE_TTL_MS = 10 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 60 * 60 * 1000;
const SHIKSHA_CATEGORY_CACHE_TTL_MS = 10 * 60 * 1000;
const COLLEGE360_NAME_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_SUGGESTIONS = 8;
const MAX_COURSE_FILTER_LOOKUPS = 15;
const COURSE_FILTER_CONCURRENCY = 4;
// const COLLEGE360_RESOLVE_CONCURRENCY = 4;
// Minimum token-overlap score (0..1) for the College360 name-resolution fallback.
const COLLEGE360_MATCH_THRESHOLD = 0.75;
const TOP_REVIEWS_LIMIT = 5;

type CacheEntry<T> = { data: T; expiresAt: number };

// ============================================================
// Service
// ============================================================

@Injectable()
export class CollegesService implements OnModuleInit {
  private readonly logger = new Logger(CollegesService.name);

  private readonly suggestionCache = new Map<
    string,
    CacheEntry<CollegeSuggestion[]>
  >();
  // keyed by `${slug}:${seriesId}` since the detail endpoint requires both together.
  private readonly detailCache = new Map<
    string,
    CacheEntry<ScrapedCollegeResult>
  >();
  // Shiksha category responses, keyed by the category URL.
  private readonly shikshaCategoryCache = new Map<
    string,
    CacheEntry<CollegeListItem[]>
  >();
  // College360 name resolution results, keyed by normalized college name.
  private readonly college360SearchCache = new Map<
    string,
    CacheEntry<{ slug: string | null; seriesId: number | null }>
  >();

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
      filter.courses = {
        $regex: this.escapeRegExp(query.course),
        $options: "i",
      };
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
    suggestions: CollegeSuggestion[];
  }> {
    const name = query.name?.trim();
    const city = query.city?.trim();
    const state = query.state?.trim();
    const course = query.course?.trim();

    if (!name && !city) {
      throw new BadRequestException(
        "Provide at least a college name or a city to search.",
      );
    }

    const searchTerm = name || city!;
    const source: "name" | "city" = name ? "name" : "city";

    let suggestions = await this.getOrFetchSuggestions(searchTerm);

    if (query.course) {
      suggestions = await this.filterByCourse(
        suggestions.slice(0, MAX_COURSE_FILTER_LOOKUPS),
        query.course.trim(),
      );
    }

    return { searchTerm, suggestions: suggestions.slice(0, MAX_SUGGESTIONS) };
  }

  // ============================================================
  // Shiksha → College360 search flow
  // ============================================================

  /**
   * Step 1 — Shiksha auto-suggest.
   * Calls the Shiksha autosuggestor endpoint with a base64-encoded JSON payload
   * ({ domain, experiment, keyword }) and returns the relevant category entry so the
   * frontend can pass its `url` to the college-list endpoint.
   */
  async searchShiksha(query: string): Promise<ShikshaCategoryResult> {
    const keyword = query.trim();
    if (!keyword) {
      throw new BadRequestException("A search query is required.");
    }

    const payload = { domain: "national", experiment: "", keyword };
    const url = `${SHIKSHA_AUTOSUGGEST_ENDPOINT}?data=${encodeURIComponent(
      Buffer.from(JSON.stringify(payload)).toString("base64"),
    )}`;

    const raw = await this.fetchJson<ShikshaAutosuggestResponse>(url);
    if (!raw || raw.status !== "success" || !raw.data?.solrResults?.length) {
      throw new BadGatewayException(
        "Shiksha search is temporarily unavailable.",
      );
    }

    const results = raw.data.solrResults;
    const relevant =
      results.find((r) => r.type === "stream" && r.url) ??
      results.find((r) => r.url && this.isShikshaCategoryUrl(r.url));

    if (!relevant?.url) {
      throw new NotFoundException(
        `No matching category found for "${keyword}".`,
      );
    }

    return { name: relevant.name, url: relevant.url };
  }

  /**
   * Step 2 — Fetch a Shiksha category page and resolve every college against College360.
   * instituteTuples[] are mapped into clean CollegeListItem[] entries; each Shiksha college
   * name is resolved to a College360 slug + seriesId with controlled concurrency. Unmatched
   * colleges are returned with null slug/seriesId instead of failing the whole request.
   */
  async getCollegesFromShiksha(url: string): Promise<CollegeListItem[]> {
    const categoryUrl = this.normalizeShikshaCategoryUrl(url);

    const cached = this.getCached(this.shikshaCategoryCache, categoryUrl);

    if (cached) return cached;

    const requestUrl = `${SHIKSHA_CATEGORY_ENDPOINT}?data=${encodeURIComponent(
      Buffer.from(JSON.stringify({ url: categoryUrl })).toString("base64"),
    )}`;

    const raw = await this.fetchJson<ShikshaCategoryResponse>(requestUrl);

    if (
      !raw ||
      raw.status !== "success" ||
      !Array.isArray(raw.data?.instituteTuples)
    ) {
      throw new BadGatewayException(
        "Shiksha category data is temporarily unavailable.",
      );
    }

    const list: CollegeListItem[] = raw.data.instituteTuples.map((tuple) => ({
      instituteId: tuple.instituteId ?? null,
      name: tuple.name?.trim() ?? "",
      logo: this.formatAssetUrl(tuple.logoImageUrl),
      headerImage: this.formatAssetUrl(tuple.instituteHeaderImageUrl),
      minFees: tuple.minFees ?? null,
      maxFees: tuple.maxFees ?? null,
    }));

    this.setCached(
      this.shikshaCategoryCache,
      categoryUrl,
      list,
      SHIKSHA_CATEGORY_CACHE_TTL_MS,
    );

    return list;
  }
  async getCollegeDetailsByName(
    name: string,
  ): Promise<CollegeDetailView | null> {
    const collegeName = name.trim();

    if (!collegeName) {
      throw new BadRequestException("College name is required.");
    }

    const resolved = await this.resolveCollegeOnCollege360(collegeName);

    if (!resolved.slug || resolved.seriesId === null) {
      throw new NotFoundException(
        `College "${collegeName}" could not be found.`,
      );
    }

    return this.getCollegeDetailView(resolved.slug, resolved.seriesId);
  }
  /**
   * Resolve a single Shiksha college name against College360.
   * Searches by the exact name, then matches in two tiers:
   *   1. normalized exact-name match (never blind results[0]),
   *   2. best token-overlap score across the returned results, accepted only above a
   *      threshold — so a college with no plausible College360 entry still gets null/null.
   * Caches the outcome per normalized name for 10 minutes.
   */
  COLLEGE360_NAME_ALIASES: Record<string, string> = {
    "sushila devi bansal college of technology bansal group of institutes":
      "sushila devi bansal college indore",

    "shri vaishnav institute of technology and science":
      "shri vaishnav institute of management svim indore",
  };

  // ============================================================
  // College360 name resolution
  // ============================================================

  private async resolveCollegeOnCollege360(
    name: string,
  ): Promise<{ slug: string | null; seriesId: number | null }> {
    if (!name?.trim()) {
      return { slug: null, seriesId: null };
    }

    const key = this.normalizeCollegeName(name);

    const cached = this.getCached(this.college360SearchCache, key);

    if (cached) return cached;

    const alias = this.COLLEGE360_NAME_ALIASES[key];
    const aliasKey = alias ? this.normalizeCollegeName(alias) : null;

    const candidates = await this.collectCollege360Candidates(name);

    let resolved: {
      slug: string | null;
      seriesId: number | null;
    } = {
      slug: null,
      seriesId: null,
    };

    // ==========================================================
    // Tier 1 — explicit alias match
    // ==========================================================

    if (aliasKey) {
      const aliasMatch = candidates.find(
        (candidate) => this.normalizeCollegeName(candidate.name) === aliasKey,
      );

      if (aliasMatch) {
        this.logger.debug(
          `Alias College360 match: "${name}" -> "${aliasMatch.name}"`,
        );

        resolved = {
          slug: aliasMatch.url,
          seriesId: aliasMatch.seriesId,
        };

        this.setCached(
          this.college360SearchCache,
          key,
          resolved,
          COLLEGE360_NAME_CACHE_TTL_MS,
        );

        return resolved;
      }
    }

    // ==========================================================
    // Tier 2 — normalized exact-name match
    // ==========================================================

    const exact = candidates.filter(
      (candidate) => this.normalizeCollegeName(candidate.name) === key,
    );

    if (exact.length > 0) {
      if (exact.length > 1) {
        this.logger.debug(
          `Ambiguous exact College360 match for "${name}" — using first.`,
        );
      }

      resolved = {
        slug: exact[0].url,
        seriesId: exact[0].seriesId,
      };
    } else {
      // ========================================================
      // Tier 3 — fuzzy token-overlap match
      // ========================================================

      const scored = candidates
        .map((candidate) => ({
          result: candidate,
          score: this.collegeNameSimilarity(
            key,
            this.normalizeCollegeName(candidate.name),
          ),
        }))
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0 && scored[0].score >= COLLEGE360_MATCH_THRESHOLD) {
        resolved = {
          slug: scored[0].result.url,
          seriesId: scored[0].result.seriesId,
        };

        this.logger.debug(
          `Fuzzy College360 match for "${name}" -> "${scored[0].result.name}" ` +
            `(score ${scored[0].score.toFixed(2)}).`,
        );
      } else {
        this.logger.debug(`No confident College360 match for "${name}".`);
      }
    }

    this.setCached(
      this.college360SearchCache,
      key,
      resolved,
      COLLEGE360_NAME_CACHE_TTL_MS,
    );

    return resolved;
  }
  /**
   * Jaccard-style token coverage: |query ∩ candidate| / min(|query|, |candidate|).
   * Rewards candidates that contain the query's significant words (handles College360's
   * acronym/branch/suffix variations like "[LNCT], Bhopal" or "Bhopal - National Institute…").
   */
  private collegeNameSimilarity(a: string, b: string): number {
    const aTokens = a.split(" ").filter(Boolean);
    const bTokens = b.split(" ").filter(Boolean);
    if (!aTokens.length || !bTokens.length) return 0;
    const bSet = new Set(bTokens);
    const overlaps = aTokens.filter((token) => bSet.has(token)).length;
    return overlaps / Math.min(aTokens.length, bTokens.length);
  }

  /**
   * Safe query variants for a College360 name lookup.
   *
   * Includes:
   * - original Shiksha name
   * - explicit College360 alias
   * - text before " - "
   * - text before the first comma
   */
  private buildCollege360Queries(name: string): string[] {
    const queries = new Set<string>();
    const trimmed = name.trim();

    if (!trimmed) return [];

    // Original name
    queries.add(trimmed);

    // Explicit alias
    const normalized = this.normalizeCollegeName(trimmed);
    const alias = this.COLLEGE360_NAME_ALIASES[normalized];

    if (alias) {
      queries.add(alias);
    }

    // Existing safe variants
    const dashIndex = trimmed.indexOf(" - ");

    if (dashIndex > 0) {
      const segment = trimmed.slice(0, dashIndex).trim();

      if (segment) {
        queries.add(segment);
      }
    }

    const commaIndex = trimmed.indexOf(", ");

    if (commaIndex > 0) {
      const segment = trimmed.slice(0, commaIndex).trim();

      if (segment) {
        queries.add(segment);
      }
    }

    return [...queries];
  }

  /** Gather deduplicated College360 search candidates across the safe query variants. */
  private async collectCollege360Candidates(
    name: string,
  ): Promise<College360SearchResult[]> {
    const queries = this.buildCollege360Queries(name);
    const seen = new Set<string>();
    const merged: College360SearchResult[] = [];

    for (const query of queries) {
      const results =
        (await this.fetchJson<College360SearchResult[]>(
          COLLEGE360_SEARCH_ENDPOINT(query),
        )) ?? [];
      for (const result of results) {
        if (result.url && !seen.has(result.url)) {
          seen.add(result.url);
          merged.push(result);
        }
      }
    }
    return merged.filter((r) => r.name);
  }

  /** Normalize for exact-name comparison: trim, lowercase, collapse spaces and punctuation gaps. */
  private normalizeCollegeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[()[\]{},.\-_*&]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Accept a relative category path or an absolute shiksha URL; always return a clean path.
   *  The category API rejects URLs that carry the searchWidget query string, so it's stripped. */
  private normalizeShikshaCategoryUrl(url: string): string {
    let normalized = url.trim();
    const queryIndex = normalized.indexOf("?");
    if (queryIndex >= 0) normalized = normalized.slice(0, queryIndex);
    const hostIndex = normalized.indexOf("shiksha.com");
    if (hostIndex >= 0) {
      normalized = normalized.slice(hostIndex + "shiksha.com".length);
    }
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }

  private isShikshaCategoryUrl(url: string): boolean {
    return /\/colleges\/colleges-/.test(url);
  }

  // ---- college360 detail (step 2: user picked one) ----

  /** Full detail payload — courses with branches, all reviews mapped, etc. */
  async scrape(
    slug: string,
    seriesId: number,
  ): Promise<ScrapedCollegeResult | null> {
    return this.fetchDetail(slug, seriesId);
  }

  /** Trimmed view for the college detail screen: name, short desc, logo, bg image, address, courses by category, top reviews. */
  async getCollegeDetailView(
    slug: string,
    seriesId: number,
  ): Promise<CollegeDetailView | null> {
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
      coursesByCategory: this.simplifyCoursesByCategory(
        scraped.coursesByCategory,
      ),
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
    const flattenedCourses = scraped.courses.map(
      (c) => `${c.category} — ${c.name}`,
    );

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

  private async getOrFetchSuggestions(
    searchTerm: string,
  ): Promise<CollegeSuggestion[]> {
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

    this.setCached(
      this.suggestionCache,
      searchTerm,
      suggestions,
      SUGGESTION_CACHE_TTL_MS,
    );
    return suggestions;
  }

  // ============================================================
  // Course post-filter (fan-out capped + batched)
  // ============================================================

  private async filterByCourse(
    candidates: CollegeSuggestion[],
    course: string,
  ): Promise<CollegeSuggestion[]> {
    const courseLower = course.toLowerCase();
    const matched: CollegeSuggestion[] = [];

    for (let i = 0; i < candidates.length; i += COURSE_FILTER_CONCURRENCY) {
      const batch = candidates.slice(i, i + COURSE_FILTER_CONCURRENCY);
      const details = await Promise.all(
        batch.map((c) => this.fetchDetail(c.slug, c.seriesId)),
      );

      batch.forEach((candidate, idx) => {
        const courseNames =
          details[idx]?.courses.map((c) => c.name.toLowerCase()) ?? [];
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

  private async fetchDetail(
    slug: string,
    seriesId: number,
  ): Promise<ScrapedCollegeResult | null> {
    const cacheKey = `${slug}:${seriesId}`;
    const cached = this.getCached(this.detailCache, cacheKey);
    if (cached) return cached;

    const raw = await this.fetchJson<College360DetailResponse>(
      COLLEGE_DETAIL_ENDPOINT(slug, seriesId),
    );
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
      facilities: (info.facilitites ?? [])
        .map((f) => f.facility)
        .filter(Boolean),
      reviews: this.mapTopReviews(info.review, TOP_REVIEWS_LIMIT),
      image: this.formatAssetUrl(info.logo),
      backgroundImage: this.formatAssetUrl(info.backgroundImg),
      photos: this.mapPhotos(info.photos),
      averageFees: this.computeAverageFee(info.fee),
      aggregateRating: info.aggregateRatingValue
        ? Number(info.aggregateRatingValue)
        : null,
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

  private groupCoursesByCategory(
    courses: ScrapedCourse[],
  ): Record<string, ScrapedCourse[]> {
    const grouped: Record<string, ScrapedCourse[]> = {};
    for (const course of courses) {
      (grouped[course.category] ??= []).push(course);
    }
    return grouped;
  }

  private simplifyCoursesByCategory(
    grouped: Record<string, ScrapedCourse[]>,
  ): Record<string, { name: string; shortForm: string | null }[]> {
    const simplified: Record<
      string,
      { name: string; shortForm: string | null }[]
    > = {};
    for (const [category, courses] of Object.entries(grouped)) {
      simplified[category] = courses.map((c) => ({
        name: c.name,
        shortForm: c.shortForm,
      }));
    }
    return simplified;
  }

  /**
   * college360 reviews have no reviewer name — only `review` (comment text) and
   * `rating` (0–10 scale, confirmed from sample data). Sorted by rating descending,
   * top N returned.
   */
  private mapTopReviews(
    rawReviews?: College360Review[],
    limit = TOP_REVIEWS_LIMIT,
  ): ScrapedCollegeReview[] {
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
    const amounts = fees
      .map((f) => Number(f.amount))
      .filter((n) => !Number.isNaN(n));
    if (!amounts.length) return null;
    return Math.round(amounts.reduce((sum, n) => sum + n, 0) / amounts.length);
  }

  private stripHtml(value?: string): string | null {
    if (!value) return null;
    return value
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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

  private getCached<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
  ): T | null {
    const entry = cache.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCached<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
    data: T,
    ttlMs: number,
  ) {
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  private formatAssetUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
      if (path.includes("college360.co.in/")) {
        return path
          .replace("https://college360.co.in/", `${COLLEGE360_ASSET_BASE}/`)
          .replace("http://college360.co.in/", `${COLLEGE360_ASSET_BASE}/`);
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
