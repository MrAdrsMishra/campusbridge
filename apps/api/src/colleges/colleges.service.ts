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
import Fuse from "fuse.js";
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
  // Populated by the College360 detail resolution; null for Shiksha-sourced items.
  slug: string | null;
  seriesId: number | null;
  // City for this college, always stored on every search type (category list and
  // institute name search). Used for canonical College360 name resolution later.
  city: string | null;
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
  id?: number | string;
  instituteId?: number | string;
  
};

type ShikshaFeeTuple = {
  minFees?: number | null;
  maxFees?: number | null;
};

/** Shiksha getInstituteData response — only the fields we map into a CollegeListItem. */
type ShikshaInstituteResponse = {
  status?: string | number;
  data?: {
    listingId?: number | string;
    listingName?: string;
    instituteTopCardData?: {
      instituteName?: string;
      logoImageUrl?: string | null;
      headerImageDesktop?: string | null;
      headerImageDesktopView?: string | null;
      headerImageDesktopNew?: string | null;
      headerImageMobile?: string | null;
      headerImageMobileView?: string | null;
      headerImageMobileNew?: string | null;
    };
    compareRecommendedTuples?:
      | Record<string, ShikshaFeeTuple[]>
      | ShikshaFeeTuple[];
  };
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

const COLLEGE360_READ_CITY_ENDPOINT = (city: string) =>
  `${COLLEGE360_API_BASE}/client/read-city?city=${encodeURIComponent(city)}`;

const COLLEGE360_FIND_CITY_COLLEGES_ENDPOINT = (cityId: string, page = 1, limit = 100) =>
  `${COLLEGE360_API_BASE}/client/find-city-colleges?id=${encodeURIComponent(cityId)}&page=${page}&limit=${limit}`;

// Shiksha auto-suggest (pattern from the autosuggestorApi reference) and category page APIs.
const SHIKSHA_API_BASE = "https://apis.shiksha.com/apigateway";
const SHIKSHA_AUTOSUGGEST_ENDPOINT = `${SHIKSHA_API_BASE}/autosuggestorApi/v1/info/getAutosuggestorResults`;
// getCategoryPageFull (not getCategoryPageFullData) is the live category endpoint; data = base64({ url }).
const SHIKSHA_CATEGORY_ENDPOINT = `${SHIKSHA_API_BASE}/categorypageapi/v4/info/getCategoryPageFull`;

// College-name search flow — direct institute detail API.
// data = base64({ instituteId, url, datesFilterData:{ bc:[] }, isBot:false }).
const SHIKSHA_INSTITUTE_ENDPOINT = `${SHIKSHA_API_BASE}/instituteapi/v5/info/getInstituteData`;

const FETCH_TIMEOUT_MS = 8_000;
const FETCH_MAX_RETRIES = 2;
const FETCH_RETRY_BASE_DELAY_MS = 800;
// find-city-colleges in the hot resolveCanonicalCollege path: moderate page + timeout.
const CITY_COLLEGES_PAGE_SIZE = 50;
const CITY_COLLEGES_FETCH_TIMEOUT_MS = 20_000;
// Background bulk-cache fetch: larger timeout because it's fire-and-forget.
const BACKGROUND_FETCH_TIMEOUT_MS = 30_000;
const SUGGESTION_CACHE_TTL_MS = 10 * 60 * 1000;
const DETAIL_CACHE_TTL_MS = 60 * 60 * 1000;
const SHIKSHA_CATEGORY_CACHE_TTL_MS = 10 * 60 * 1000;
const COLLEGE360_NAME_CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_SUGGESTIONS = 8;
const MAX_COURSE_FILTER_LOOKUPS = 15;
const COURSE_FILTER_CONCURRENCY = 4;
// The autosuggestor API reports college-category results under these `type`
// values (rather than `institute`). We accept all of them as a Step-2 category
// URL, provided the URL also looks like a category page.
const SHIKSHA_CATEGORY_RESULT_TYPES = new Set([
  "stream",
  "stream_city",
  "substream",
  "substream_city",
  "base_course",
  "base_course_city",
  "base_course_state",
  "course",
  "course_city",
  "popular_course",
  "degree",
  "category",
]);
// const COLLEGE360_RESOLVE_CONCURRENCY = 4;
// Minimum token-overlap score (0..1) for the College360 name-resolution fallback.
const COLLEGE360_MATCH_THRESHOLD = 0.75;
const TOP_REVIEWS_LIMIT = 5;

// ============================================================
// Browser headers for third-party API requests
// ============================================================
//
// The Shiksha and College360 API gateways are fronted by a WAF
// (e.g. Cloudflare) that rejects requests that don't carry a
// browser-like User-Agent — returning HTTP 403. Node's native
// fetch sends a minimal/default UA ("node"/"undici") which
// trips that bot-detection. Without a real-browser UA,
// Accept-Language, Referer, Origin, and sec-fetch-* headers the
// gateway treats the request as a bot and blocks it.
//
// The User-Agent can be overridden via the BROWSER_USER_AGENT
// environment variable for debugging or if it stops working.
const BROWSER_USER_AGENT =
  process.env.BROWSER_USER_AGENT ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const DEFAULT_FETCH_HEADERS: Record<string, string> = {
  accept: "application/json, text/plain, */*",
  "User-Agent": BROWSER_USER_AGENT,
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.shiksha.com",
  Referer: "https://www.shiksha.com/",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
};

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
  // Shiksha institute detail responses, keyed by the Shiksha instituteId.
  private readonly shikshaInstituteCache = new Map<
    string,
    CacheEntry<CollegeListItem | null>
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
    // Seed only when the collection is completely empty.
    if ((await this.colleges.countDocuments()) === 0) {
      // await this.colleges.insertMany(seedData);
    }
    // Bring existing documents in line with the current schema (new defaulted
    // fields, plus indexes for the resolution/search lookups).
    await this.runSchemaMigration();
  }

  /**
   * Idempotent schema backfill. Mongoose only applies `default` values to NEW
   * documents, so rows created before the schema gained these fields won't have
   * them. This updates every pre-existing document that's missing a field, so the
   * collection reflects the current College schema. Safe to run on every startup.
   */
  private async runSchemaMigration(): Promise<void> {
    const updateMissingField = async (
      field: string,
      value: unknown,
    ): Promise<void> => {
      const result = await this.colleges.updateMany(
        { [field]: { $exists: false } },
        { $set: { [field]: value } },
      );
      if (result.modifiedCount > 0) {
        this.logger.log(
          `[colleges:migration] Backfilled "${field}" on ${result.modifiedCount} document(s).`,
        );
      }
    };

    // New defaulted fields on the College schema.
    await updateMissingField("state", "");
    await updateMissingField("about", "");
    await updateMissingField("courses", []);
    await updateMissingField("reviews", []);

    // Canonical-resolution fields — expose as null until populated.
    await updateMissingField("url", null);
    await updateMissingField("seriesId", null);
    await updateMissingField("shiksha_instituteId", null);

    // Indexes used by the canonical resolution & search flows.
    try {
      await Promise.all([
        this.colleges.collection.createIndex({ city: 1 }),
        this.colleges.collection.createIndex({ name: 1 }),
        this.colleges.collection.createIndex({ shiksha_instituteId: 1 }),
        this.colleges.collection.createIndex({ url: 1 }),
      ]);
      this.logger.log("[colleges:migration] College indexes are in place.");
    } catch (error) {
      this.logger.warn(
        `[colleges:migration] Failed to create indexes: ${(error as Error).message}`,
      );
    }
  }



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
   * Step 1 — Shiksha search, two modes:
   *   - college name  → every `results.type === "institute"` hit is resolved via
   *     getInstituteData and returned as the final CollegeListItem[].
   *   - course/category → returns the single { name, url } category entry so the
   *     frontend can pass its `url` to the college-list endpoint.
   */
  async searchShiksha(
    query: string,
    city?: string,
    state?: string,
  ): Promise<ShikshaCategoryResult | CollegeListItem[]> {
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

    // College-name search: Shiksha leads with an exact `institute` hit. When that
    // happens, resolve every institute directly via getInstituteData into the final
    // CollegeListItem[] — no category-url hop needed.
    const institutes = results.filter((r) => r.type === "institute" && r.url);

    if (results[0]?.type === "institute" && institutes.length > 0) {
      return this.getCollegesByInstituteNames(institutes, city);
    }
    const relevant =
      results.find(
        (r) =>
          r.url &&
          SHIKSHA_CATEGORY_RESULT_TYPES.has(r.type ?? "") &&
          this.isShikshaCategoryUrl(r.url),
      ) ??
      results.find((r) => r.url && this.isShikshaCategoryUrl(r.url));
    if (!relevant?.url) {
      const candidates = [
        this.normalizeCategoryKeyword(keyword),
        "BCA",
        "Engineering",
      ].filter((k, idx, arr) => Boolean(k) && k !== keyword && arr.indexOf(k) === idx);

      for (const alt of candidates) {
        try {
          const fallback = await this.searchShiksha(alt, city, state);
          if (fallback) return fallback;
        } catch {
          /* try next candidate */
        }
      }

      throw new NotFoundException(
        `No matching category found for "${keyword}".`,
      );
    }

    return { name: relevant.name, url: relevant.url };
  }

  private normalizeCategoryKeyword(query: string): string {
    if (!query) return "Engineering";
    let cleaned = query.trim();

    // Strip common prefix qualifiers
    cleaned = cleaned.replace(/^(Private|Government|Govt|Top|Best|Popular)\s+/i, "");
    // Strip common suffix qualifiers
    cleaned = cleaned.replace(/\s+(Colleges|Institutes|Courses|Degrees|Course|Programs)(\s+in\s+.*)?$/i, "");
    cleaned = cleaned.trim();

    // Standardized category alias mapping
    const ALIASES: Record<string, string> = {
      // Computer Applications / IT
      "Computer Applications": "BCA",
      "Computer Applications & IT": "BCA",
      "Computer Applications and IT": "BCA",
      "IT and Computer Applications": "BCA",
      "IT & Computer Applications": "BCA",
      "Computer": "BCA",
      "IT": "BCA",
      "BCA": "BCA",
      "MCA": "BCA",

      // Engineering & Technology
      "Engineering": "Engineering",
      "Engineering & Technology": "Engineering",
      "Engineering and Technology": "Engineering",
      "B.Tech": "Engineering",
      "Bachelor of Technology": "Engineering",
      "M.Tech": "Engineering",
      "Master of Technology": "Engineering",

      // Management & Business
      "Management": "Management",
      "Management & Business": "Management",
      "Management and Business": "Management",
      "Management & Business Administration": "Management",
      "Management and Business Administration": "Management",
      "MBA": "Management",
      "Master of Business Administration": "Management",
      "BBA": "Management",
      "Bachelor of Business Administration": "Management",

      // Medical & Healthcare
      "Medical": "Medical",
      "Medical & Healthcare": "Medical",
      "Medical and Healthcare": "Medical",
      "Medicine & Health Sciences": "Medical",
      "Medicine and Health Sciences": "Medical",
      "MBBS": "Medical",
      "Nursing": "Medical",

      // Science
      "Science": "Science",
      "B.Sc": "Science",
      "M.Sc": "Science",

      // Commerce & Finance
      "Commerce": "Commerce",
      "Commerce & Finance": "Commerce",
      "Commerce and Finance": "Commerce",
      "B.Com": "Commerce",
      "M.Com": "Commerce",

      // Law & Legal Studies
      "Law": "Law",
      "Law & Legal Studies": "Law",
      "Law and Legal Studies": "Law",
      "LL.B": "Law",
      "LL.M": "Law",

      // Architecture & Planning
      "Architecture": "Architecture",
      "Architecture & Planning": "Architecture",
      "Architecture and Planning": "Architecture",
      "Architecture and Planning Course": "Architecture",
      "B.Arch": "Architecture",

      // Design & Fine Arts
      "Design": "Design",
      "Design & Fine Arts": "Design",
      "Design and Fine Arts": "Design",
      "B.Des": "Design",
      "Animation & Design": "Design",

      // Arts, Humanities & Social Sciences
      "Arts": "Arts",
      "Arts, Humanities & Social Sciences": "Arts",
      "Arts, Humanities and Social Sciences": "Arts",
      "Humanities & Social Sciences": "Arts",
      "Humanities and Social Sciences": "Arts",
      "BA": "Arts",
      "MA": "Arts",
      "Mass Communication & Media": "Arts",
      "Mass Communication and Media": "Arts",

      // Pharmacy
      "Pharmacy": "Pharmacy",
      "B.Pharm": "Pharmacy",
      "D.Pharm": "Pharmacy",

      // Paramedical & Allied Health
      "Paramedical": "Paramedical",
      "Paramedical & Allied Health": "Paramedical",
      "Paramedical and Allied Health": "Paramedical",

      // Education & Teaching
      "Education": "Education",
      "Education & Teaching": "Education",
      "Education and Teaching": "Education",
      "Teaching & Education": "Education",
      "Teaching and Education": "Education",
      "B.Ed": "Education",

      // Hotel Management & Hospitality
      "Hotel Management": "Hotel Management",
      "Hotel Management & Hospitality": "Hotel Management",
      "Hotel Management and Hospitality": "Hotel Management",
      "Hospitality & Travel": "Hotel Management",
      "Hospitality and Travel": "Hotel Management",
      "BHM": "Hotel Management",

      // Doctoral / PhD
      "PhD": "PhD",
      "Doctoral & Research": "PhD",
      "Doctoral and Research": "PhD",
      "Doctoral / Research Programs": "PhD",

      // Vocational & Skill-Based
      "Vocational": "Vocational",
      "Vocational & Skill-Based": "Vocational",
      "Vocational and Skill-Based": "Vocational",
    };

    if (ALIASES[cleaned]) return ALIASES[cleaned];

    const lower = cleaned.toLowerCase();
    for (const [key, val] of Object.entries(ALIASES)) {
      if (key.toLowerCase() === lower) return val;
    }

    // Regex fallback mapping
    if (/computer|bca|mca|it/i.test(cleaned)) return "BCA";
    if (/engineering|b\.tech|m\.tech/i.test(cleaned)) return "Engineering";
    if (/management|mba|bba/i.test(cleaned)) return "Management";
    if (/medical|medicine|mbbs|nursing/i.test(cleaned)) return "Medical";
    if (/science|b\.sc|m\.sc/i.test(cleaned)) return "Science";
    if (/commerce|b\.com|m\.com|finance/i.test(cleaned)) return "Commerce";
    if (/law|ll\.b|legal/i.test(cleaned)) return "Law";
    if (/architecture|b\.arch/i.test(cleaned)) return "Architecture";
    if (/design|b\.des|animation/i.test(cleaned)) return "Design";
    if (/arts|humanities|media|journalism/i.test(cleaned)) return "Arts";
    if (/pharmacy|b\.pharm/i.test(cleaned)) return "Pharmacy";
    if (/paramedical/i.test(cleaned)) return "Paramedical";
    if (/education|teaching|b\.ed/i.test(cleaned)) return "Education";
    if (/hotel|hospitality|bhm/i.test(cleaned)) return "Hotel Management";
    if (/phd|doctoral|research/i.test(cleaned)) return "PhD";
    if (/vocational|skill/i.test(cleaned)) return "Vocational";

    return cleaned;
  }


  /**
   * Step 2 — Fetch a Shiksha category page and resolve every college against College360.
   * instituteTuples[] are mapped into clean CollegeListItem[] entries; each Shiksha college
   * name is resolved to a College360 slug + seriesId with controlled concurrency. Unmatched
   * colleges are returned with null slug/seriesId instead of failing the whole request.
   */
  async getCollegesFromShiksha(
    url: string,
    city?: string,
    state?: string,
  ): Promise<CollegeListItem[]> {
    const categoryUrl = this.normalizeShikshaCategoryUrl(url);
    const resolvedCity = this.resolveCategoryCity(categoryUrl, city);

    const cached = this.getCached(this.shikshaCategoryCache, categoryUrl);

    if (cached) return cached;

    // Shiksha doesn't publish a learned category page for every (course, city)
    // pairing — a missing localized page returns 404. Fall back through the most
    // specific candidates we can derive so the search still returns colleges:
    //   passed city URL → state page → national page.
    const candidateUrls = this.buildShikshaCategoryCandidates(
      categoryUrl,
      city,
      state,
    );

    let instituteTuples: ShikshaInstituteTuple[] | null = null;

    for (const candidate of candidateUrls) {
      const requestUrl = `${SHIKSHA_CATEGORY_ENDPOINT}?data=${encodeURIComponent(
        Buffer.from(JSON.stringify({ url: candidate })).toString("base64"),
      )}`;
      const attempt = await this.fetchJson<ShikshaCategoryResponse>(requestUrl);
      if (
        attempt &&
        attempt.status === "success" &&
        Array.isArray(attempt.data?.instituteTuples)
      ) {
        instituteTuples = attempt.data.instituteTuples;
        break;
      }
    }

    if (!instituteTuples) {
      throw new BadGatewayException(
        "Shiksha category data is temporarily unavailable.",
      );
    }

    const list: CollegeListItem[] = instituteTuples.map((tuple) => ({
      instituteId: tuple.instituteId ?? null,
      name: tuple.name?.trim() ?? "",
      logo: this.formatAssetUrl(tuple.logoImageUrl),
      headerImage: this.formatAssetUrl(tuple.instituteHeaderImageUrl),
      minFees: tuple.minFees ?? null,
      maxFees: tuple.maxFees ?? null,
      slug: null,
      seriesId: null,
      city: resolvedCity,
    }));

    // Cache the raw list immediately so the response is returned without waiting.
    this.setCached(
      this.shikshaCategoryCache,
      categoryUrl,
      list,
      SHIKSHA_CATEGORY_CACHE_TTL_MS,
    );

    // Fire-and-forget: pre-compute canonical slug/seriesId in the background.
    // Once resolved, we mutate the cached list items in-place so the next
    // request for the same URL gets fully enriched results from cache.
    if (resolvedCity) {
      void this.preComputeCanonicals(list, resolvedCity, categoryUrl);
    }

    return list;
  }

  /**
   * Ordered category URLs to try for a Shiksha category request: the exact URL
   * first, then a state-scoped page (if a state was provided), then the national
   * "colleges-india" page. "colleges-" is the region token the category API uses.
   */
  private buildShikshaCategoryCandidates(
    categoryUrl: string,
    city?: string,
    state?: string,
  ): string[] {
    const marker = "colleges-";
    const idx = categoryUrl.lastIndexOf(marker);
    const candidates: string[] = [];

    const push = (url: string) => {
      if (url && !candidates.includes(url)) candidates.push(url);
    };

    push(categoryUrl);

    if (idx >= 0) {
      const prefix = categoryUrl.slice(0, idx + marker.length);
      const stateSlug = state?.trim().toLowerCase().replace(/\s+/g, "-");
      if (stateSlug) push(`${prefix}${stateSlug}`);
      const citySlug = city?.trim().toLowerCase().replace(/\s+/g, "-");
      if (citySlug) push(`${prefix}${citySlug}`);
      push(`${prefix}india`);
    }

    return candidates;
  }

  /**
   * Background pre-computation: caches city colleges in DB, then resolves
   * canonical slug + seriesId for every item. Mutates the list in-place so the
   * shared in-memory cache is updated without a re-fetch.
   */
  private async preComputeCanonicals(
    list: CollegeListItem[],
    city: string,
    categoryUrl: string,
  ): Promise<void> {
    try {
      await this.ensureCityCollegesInDb(city);

      const CONCURRENCY = 4;
      for (let i = 0; i < list.length; i += CONCURRENCY) {
        const batch = list.slice(i, i + CONCURRENCY);
        await Promise.all(
          batch.map(async (item) => {
            if (!item.name || (item.slug && item.seriesId)) return;
            try {
              const canonical = await this.resolveCanonicalCollege(
                item.name,
                city,
                item.instituteId ?? undefined,
              );
              item.slug = canonical.slug;
              item.seriesId = canonical.seriesId;
            } catch {
              // Unresolvable college — leave null, will retry on next cache miss
            }
          }),
        );
      }

      this.logger.debug(
        `[preComputeCanonicals] Finished background resolution for ${categoryUrl} (${list.filter((i) => i.slug).length}/${list.length} resolved)`,
      );
    } catch (err) {
      this.logger.warn(
        `[preComputeCanonicals] Background pre-compute failed for ${categoryUrl}: ${String(err)}`,
      );
    }
  }
  /**
   * College-name search (Step 1 alternative).
   * Shiksha autosuggest led with `type:"institute"` hits, so each one is fetched via
   * getInstituteData and mapped into a final CollegeListItem[] here. View-details
   * from CollegesListTable keeps working unchanged — every item still carries a
   * resolvable college `name` (slug/seriesId stay null, so the name path is used).
   */
  private async getCollegesByInstituteNames(
    institutes: ShikshaSolrResult[],
    city?: string,
  ): Promise<CollegeListItem[]> {
    const seen = new Set<string>();
    const unique = institutes
      .filter((result) => {
        const key = String(
          this.instituteIdFromResult(result) ?? result.url ?? result.name,
        );
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_SUGGESTIONS);

    const items: (CollegeListItem | null)[] = [];

    for (let i = 0; i < unique.length; i += COURSE_FILTER_CONCURRENCY) {
      const batch = unique.slice(i, i + COURSE_FILTER_CONCURRENCY);
      const resolved = await Promise.all(
        batch.map((result) => this.fetchShikshaInstituteItem(result, city)),
      );
      items.push(...resolved);
    }

    return items.filter((item): item is CollegeListItem => Boolean(item));
  }

  /** Map getInstituteData into the shared CollegeListItem shape. */
  private mapShikshaInstituteItem(
    solr: ShikshaSolrResult,
    data: NonNullable<ShikshaInstituteResponse["data"]>,
    city?: string | null,
  ): CollegeListItem {
    const card = data.instituteTopCardData;
    const fee = this.findFirstShikshaFeeTuple(data);
    const rawId = data.listingId ?? this.instituteIdFromResult(solr);
    const idNumber = Number(rawId);

    return {
      instituteId: Number.isFinite(idNumber) ? idNumber : null,
      name:
        data.listingName?.trim() ||
        card?.instituteName?.trim() ||
        solr.name.trim(),
      logo: this.formatAssetUrl(card?.logoImageUrl),
      headerImage: this.formatAssetUrl(
        card?.headerImageDesktopNew ??
          card?.headerImageDesktopView ??
          card?.headerImageDesktop ??
          card?.headerImageMobileNew ??
          card?.headerImageMobileView ??
          card?.headerImageMobile,
      ),
      minFees: fee?.minFees ?? null,
      maxFees: fee?.maxFees ?? null,
      slug: null,
      seriesId: null,
      city: city?.trim() || null,
    };
  }

  /**
   * Fees live under compareRecommendedTuples keyed by course bucket
   * (e.g. `"10"`); pick that bucket's first tuple, else the first bucket.
   */
  private findFirstShikshaFeeTuple(
    data: ShikshaInstituteResponse["data"],
  ): ShikshaFeeTuple | null {
    const tuples = data?.compareRecommendedTuples;
    if (Array.isArray(tuples)) return tuples[0] ?? null;

    if (tuples && typeof tuples === "object") {
      const keys = Object.keys(tuples);
      const preferred = keys.includes("10") ? "10" : keys[0];
      const bucket = preferred ? tuples[preferred] : undefined;
      return Array.isArray(bucket) ? bucket[0] ?? null : null;
    }

    return null;
  }

  /**
   * Numeric Shiksha instituteId from a solr result: `id`/`instituteId` field,
   * else trailing digits in the url (e.g. /university/ies-university-bhopal-146121).
   */
  private instituteIdFromResult(result: ShikshaSolrResult): number | null {
    const raw = result.instituteId ?? result.id;
    const parsed =
      typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;

    const match = result.url?.match(/(\d+)\/?$/);
    return match ? Number.parseInt(match[1], 10) : null;
  }

  /** Fetch + cache a single Shiksha institute via getInstituteData. */
  private async fetchShikshaInstituteItem(
    solr: ShikshaSolrResult,
    city?: string,
  ): Promise<CollegeListItem | null> {
    const instituteId = this.instituteIdFromResult(solr);
    const instituteUrl = this.normalizeShikshaCategoryUrl(solr.url ?? "");
    if (!instituteId || !instituteUrl) return null;

    const resolvedCity = city?.trim() || null;
    const cacheKey = `${instituteId}:${resolvedCity ?? ""}`;
    const cached = this.getCached(this.shikshaInstituteCache, cacheKey);
    if (cached) return cached;

    const payload = {
      instituteId,
      url: instituteUrl,
      datesFilterData: { bc: [] },
      isBot: false,
    };

    const requestUrl =
      `${SHIKSHA_INSTITUTE_ENDPOINT}?data=${encodeURIComponent(
        Buffer.from(JSON.stringify(payload)).toString("base64"),
      )}`;

    const raw = await this.fetchJson<ShikshaInstituteResponse>(requestUrl);
    if (!raw?.data) return null;

    const item = this.mapShikshaInstituteItem(solr, raw.data, resolvedCity);
    if (!item.name) return null;

    this.setCached(
      this.shikshaInstituteCache,
      cacheKey,
      item,
      SHIKSHA_CATEGORY_CACHE_TTL_MS,
    );
    return item;
  }

  /**
   * Strategy for finding canonical names in College360 with Shiksha college name & city:
   * 1. Check DB for colleges in the city:
   *    - try to match shiksha_instituteId.
   *    - if not available/matched, use hybrid matching (exact -> token overlap &
   *      acronym -> Fuse.js) against the DB colleges for this city.
   *    - when matched update shiksha_instituteId in DB and return { slug, seriesId }.
   * 2. If the college isn't matched from the DB (empty/partial/stale city snapshot),
   *    fall through to College360:
   *    - hit read-city endpoint to get cityId, find all colleges in that city, then
   *      hybrid-match the name. Store ALL those colleges in the DB.
   * 3. If the city list still can't match (e.g. the college isn't in the first page),
   *    fall back to a direct College360 name search via resolveCollegeOnCollege360.
   * 4. Only throw "Not able to load" (NotFoundException) if every strategy failed.
   */
  async resolveCanonicalCollege(
    shikshaCollegeName: string,
    city: string,
    shikshaInstituteId?: number,
  ): Promise<{ slug: string; seriesId: number }> {
    const nameTrimmed = shikshaCollegeName.trim();
    const cityTrimmed = city.trim();

    if (!nameTrimmed || !cityTrimmed) {
      throw new BadRequestException(
        "Both college name and city are required for canonical resolution.",
      );
    }

    // 1. Check DB for colleges in city if city exists
    const collegesInCity = await this.colleges
      .find({
        city: { $regex: new RegExp(`^${this.escapeRegExp(cityTrimmed)}$`, "i") },
      })
      .lean();

    if (collegesInCity.length > 0) {
      // Stage 1a: Try to match shiksha_instituteId if provided
      if (shikshaInstituteId) {
        const matchedById = collegesInCity.find(
          (c) => c.shiksha_instituteId === shikshaInstituteId,
        );
        if (matchedById?.url && matchedById?.seriesId) {
          return { slug: matchedById.url, seriesId: matchedById.seriesId };
        }
      }

      // Stage 1b: Use hybrid matching (exact -> token overlap & acronym -> Fuse.js)
      const matchedDoc = this.findBestCollegeMatch(nameTrimmed, collegesInCity);

      if (matchedDoc) {
        if (matchedDoc.url && matchedDoc.seriesId) {
          // Update instituteId for this matched college in DB if missing or updated
          if (
            shikshaInstituteId &&
            matchedDoc.shiksha_instituteId !== shikshaInstituteId
          ) {
            await this.colleges.updateOne(
              { _id: matchedDoc._id },
              { $set: { shiksha_instituteId: shikshaInstituteId } },
            );
          }
          return { slug: matchedDoc.url, seriesId: matchedDoc.seriesId };
        }
      }

      // City may exist in DB but the college still wasn't matched (or its entry
      // has no url/seriesId yet). Fall through to the College360 flow below so a
      // stale/partial city snapshot doesn't turn into a dead-end 404.
    }

    // 2. Best-effort College360 city flow. read-city / find-city-colleges can be
    //    slow or time out — a failure here must NOT fail the whole request, so we
    //    fall through to the direct name search in step 3.
    type CityResponse = {
      status: number;
      data?: Array<{ _id: string; city: string }>;
    };
    const cityData = await this.fetchJson<CityResponse>(
      COLLEGE360_READ_CITY_ENDPOINT(cityTrimmed),
    );

    const cityCandidates = cityData?.data;
    const matchedCity =
      cityCandidates && cityCandidates.length > 0
        ? cityCandidates.find(
            (c) => c.city.toLowerCase() === cityTrimmed.toLowerCase(),
          ) ?? cityCandidates[0]
        : undefined;

    if (matchedCity?._id) {
      // Keep the page small + a shorter timeout so this block responds quickly;
      // anything missed here is covered by step 3.
      type CityCollegesResponse =
        | College360SearchResult[]
        | { status?: number; data?: College360SearchResult[] };

      const rawCityColleges = await this.fetchJson<CityCollegesResponse>(
        COLLEGE360_FIND_CITY_COLLEGES_ENDPOINT(
          matchedCity._id,
          1,
          CITY_COLLEGES_PAGE_SIZE,
        ),
        CITY_COLLEGES_FETCH_TIMEOUT_MS,
      );

      const cityCollegesList: College360SearchResult[] = Array.isArray(
        rawCityColleges,
      )
        ? rawCityColleges
        : rawCityColleges && Array.isArray(rawCityColleges.data)
          ? rawCityColleges.data
          : [];

      if (cityCollegesList.length > 0) {
        // Use hybrid matching (exact -> token overlap & acronym -> Fuse.js)
        const matchedCollege = this.findBestCollegeMatch(
          nameTrimmed,
          cityCollegesList,
        );

        // Store all these colleges within the city into DB
        const bulkOps = cityCollegesList.map((item) => {
          const isMatched =
            matchedCollege &&
            (item.url === matchedCollege.url ||
              item.name === matchedCollege.name);
          const instId =
            isMatched && shikshaInstituteId
              ? shikshaInstituteId
              : undefined;

          return {
            updateOne: {
              filter: { name: item.name, city: matchedCity.city },
              update: {
                $set: {
                  name: item.name,
                  city: matchedCity.city,
                  url: item.url,
                  seriesId: item.seriesId,
                  shiksha_instituteId: instId,
                },
              },
              upsert: true,
            },
          };
        });

        if (bulkOps.length > 0) {
          await this.colleges.bulkWrite(bulkOps);
        }

        if (matchedCollege?.url && matchedCollege?.seriesId) {
          return { slug: matchedCollege.url, seriesId: matchedCollege.seriesId };
        }
      }
    }

    // 3. Last resort: direct College360 name search. This covers colleges that
    //    didn't surface in the (paginated) city list — the name search queries
    //    College360 directly with several name variants and hybrid matching.
    const direct = await this.resolveCollegeOnCollege360(nameTrimmed);
    if (direct.slug && direct.seriesId !== null) {
      return { slug: direct.slug, seriesId: direct.seriesId };
    }

    throw new NotFoundException("Not able to load");
  }

  /**
   * Pre-fetches all colleges for a city from College360 if not already cached in MongoDB,
   * bulk-upserting them into DB for instant in-memory matching.
   */
  private async ensureCityCollegesInDb(city: string): Promise<void> {
    const cityTrimmed = city.trim();
    if (!cityTrimmed) return;

    const count = await this.colleges.countDocuments({
      city: { $regex: new RegExp(`^${this.escapeRegExp(cityTrimmed)}$`, "i") },
    });

    if (count > 0) return; // Already cached in MongoDB!

    type CityResponse = {
      status: number;
      data?: Array<{ _id: string; city: string }>;
    };
    const cityData = await this.fetchJson<CityResponse>(
      COLLEGE360_READ_CITY_ENDPOINT(cityTrimmed),
    );

    if (!cityData || !Array.isArray(cityData.data) || cityData.data.length === 0) {
      return;
    }

    const matchedCity =
      cityData.data.find(
        (c) => c.city.toLowerCase() === cityTrimmed.toLowerCase(),
      ) ?? cityData.data[0];

    if (!matchedCity?._id) return;

    type CityCollegesResponse =
      | College360SearchResult[]
      | { status?: number; data?: College360SearchResult[] };

    const rawCityColleges = await this.fetchJson<CityCollegesResponse>(
      COLLEGE360_FIND_CITY_COLLEGES_ENDPOINT(matchedCity._id, 1, 100),
      BACKGROUND_FETCH_TIMEOUT_MS,
    );

    const cityCollegesList: College360SearchResult[] = Array.isArray(
      rawCityColleges,
    )
      ? rawCityColleges
      : rawCityColleges && Array.isArray(rawCityColleges.data)
        ? rawCityColleges.data
        : [];

    if (!cityCollegesList.length) return;

    const bulkOps = cityCollegesList.map((item) => ({
      updateOne: {
        filter: { name: item.name, city: matchedCity.city },
        update: {
          $set: {
            name: item.name,
            city: matchedCity.city,
            url: item.url,
            seriesId: item.seriesId,
          },
        },
        upsert: true,
      },
    }));

    await this.colleges.bulkWrite(bulkOps);
  }

  /**
   * Hybrid matcher:
   * 1. Exact normalized match.
   * 2. Token overlap ratio + acronym bonus (e.g., query "SAGE University, Bhopal" vs "Sanjeev Agrawal Global Educational University [SAGE] Bhopal").
   * 3. Fuse.js fallback with relaxed threshold.
   */
  private findBestCollegeMatch<
    T extends { name: string; url?: string; seriesId?: number },
  >(queryName: string, candidates: T[]): T | null {
    if (!candidates.length) return null;

    const normQuery = this.normalizeCollegeName(queryName);

    // 1. Exact normalized name match
    const exact = candidates.find(
      (c) => this.normalizeCollegeName(c.name) === normQuery,
    );
    if (exact) return exact;

    // 2. Token Overlap & Acronym Score
    const qTokens = normQuery.split(" ").filter((t) => t.length > 1);
    if (qTokens.length > 0) {
      let bestCandidate: T | null = null;
      let maxScore = 0;

      for (const candidate of candidates) {
        const normCand = this.normalizeCollegeName(candidate.name);
        const cTokens = normCand.split(" ").filter((t) => t.length > 1);
        if (!cTokens.length) continue;

        const cSet = new Set(cTokens);
        const overlaps = qTokens.filter((t) => cSet.has(t)).length;
        const tokenOverlapScore = overlaps / qTokens.length;

        // Check acronym match (e.g. "SAGE" in query matching [SAGE] in candidate)
        const matches = candidate.name.match(
          /\[([A-Za-z0-9]+)\]|\(([A-Za-z0-9]+)\)/g,
        );
        const acronyms = matches
          ? matches.map((m) => m.replace(/[[\]()]/g, "").toLowerCase())
          : [];

        let acronymBonus = 0;
        for (const qToken of qTokens) {
          if (acronyms.includes(qToken)) {
            acronymBonus = 0.3;
            break;
          }
        }

        const totalScore = tokenOverlapScore + acronymBonus;
        if (totalScore > maxScore && totalScore >= 0.7) {
          maxScore = totalScore;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate) return bestCandidate;
    }

    // 3. Fuse.js fallback with relaxed threshold
    const fuse = new Fuse(candidates, {
      keys: ["name"],
      threshold: 0.5,
      ignoreLocation: true,
    });
    const fuseResults = fuse.search(queryName);
    return fuseResults.length > 0 ? fuseResults[0].item : null;
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

    const bestMatch = this.findBestCollegeMatch(name, candidates);

    if (bestMatch?.url && bestMatch.seriesId != null) {
      resolved = {
        slug: bestMatch.url,
        seriesId: bestMatch.seriesId,
      };
      this.logger.debug(
        `College360 match for "${name}" -> "${bestMatch.name}"`,
      );
    } else {
      this.logger.debug(`No confident College360 match for "${name}".`);
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
        const words = segment.split(/\s+/).filter((w) => w.length > 2);
        const nonGeneric = words.filter(
          (w) =>
            ![
              "university",
              "college",
              "institute",
              "technology",
              "management",
              "science",
              "engineering",
            ].includes(w.toLowerCase()),
        );
        if (nonGeneric.length > 0) {
          queries.add(nonGeneric[0]);
        }
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
    if (!url || typeof url !== "string") return false;
    // Category pages follow e.g. "/it-software/colleges/bca-colleges-india", "/bca-colleges-india", or "/colleges-bhopal".
    return url.includes("colleges-") || /\/colleges\//i.test(url);
  }

  /** City slug embedded in a Shiksha category URL, e.g. "colleges-bhopal" -> "Bhopal". */
  private cityFromShikshaCategoryUrl(url: string): string | null {
    const marker = "colleges-";
    const idx = url.lastIndexOf(marker);
    if (idx < 0) return null;
    const raw = url
      .slice(idx + marker.length)
      .split(/[/?#]/)[0]
      .trim();
    if (!raw || /^(india|national|all)$/i.test(raw)) return null;
    return raw
      .split("-")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  }

  /** Prefer the explicitly-passed city; fall back to the one in the category URL. */
  private resolveCategoryCity(
    categoryUrl: string,
    explicitCity?: string,
  ): string | null {
    return explicitCity?.trim() || this.cityFromShikshaCategoryUrl(categoryUrl);
  }

  // ---- college360 detail (step 2: user picked one) ----

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

  private async fetchJson<T>(
    url: string,
    timeoutMs: number = FETCH_TIMEOUT_MS,
  ): Promise<T | null> {
    for (let attempt = 0; attempt <= FETCH_MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: DEFAULT_FETCH_HEADERS,
        });

        if (response.ok) {
          return (await response.json()) as T;
        }

        const body = await response.text().catch(() => "<unreadable>");
        // Retry on bot-detection (403) and transient server errors
        // (429, 5xx); other non-OK codes fail immediately.
        const retryable =
          response.status === 403 ||
          response.status === 429 ||
          response.status >= 500;

        if (!retryable || attempt === FETCH_MAX_RETRIES) {
          this.logger.warn(
            `Non-OK response (${response.status}) from ${url}` +
              ` — body: ${body.slice(0, 500)}`,
          );
          return null;
        }

        this.logger.warn(
          `Non-OK response (${response.status}) from ${url},` +
            ` retrying (${attempt + 1}/${FETCH_MAX_RETRIES})...` +
            ` — body: ${body.slice(0, 200)}`,
        );

        const delay =
          FETCH_RETRY_BASE_DELAY_MS * 2 ** attempt;
        await new Promise((r) => setTimeout(r, delay));
      } catch (error) {
        if (attempt === FETCH_MAX_RETRIES) {
          this.logger.warn(
            `Fetch failed for ${url}: ${(error as Error).message}`,
          );
          return null;
        }
        this.logger.warn(
          `Fetch failed for ${url} on attempt ${attempt + 1}:` +
            ` ${(error as Error).message}`,
        );
        const delay = FETCH_RETRY_BASE_DELAY_MS * 2 ** attempt;
        await new Promise((r) => setTimeout(r, delay));
      } finally {
        clearTimeout(timeout);
      }
    }

    return null;
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

  /**
   * Proxy a hotlink-protected college image so the browser can render it (Shiksha's S3
   * bucket returns 403 to direct <img> requests). We fetch it server-side with the same
   * browser-like headers the scrapers use, then hand the bytes (allowed image content
   * only) back. The host whitelist doubles as an SSRF guard.
   */
  async proxyImage(
    imageUrl: string,
  ): Promise<{ data: Buffer; contentType: string } | null> {
    let parsed: URL;
    try {
      parsed = new URL(imageUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return null;
      }
    } catch {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    const allowed =
      host === "images.shiksha.com" ||
      host === "newassets.shiksha.com" ||
      host.endsWith(".shiksha.com") ||
      host.endsWith(".cloudfront.net") ||
      host.endsWith("college360.co.in");
    if (!allowed) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(imageUrl, {
        headers: DEFAULT_FETCH_HEADERS,
        signal: controller.signal,
        redirect: "follow",
      });
      if (!response.ok) return null;

      const contentType = response.headers.get("content-type") ?? "image/jpeg";
      if (!contentType.toLowerCase().startsWith("image/")) return null;

      const data = Buffer.from(await response.arrayBuffer());
      if (data.byteLength === 0) return null;
      return { data, contentType };
    } finally {
      clearTimeout(timeout);
    }
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
