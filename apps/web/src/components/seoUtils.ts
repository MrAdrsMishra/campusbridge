/**
 * seoUtils.ts
 * -----------
 * Pure, side-effect-free helpers for generating SEO content on college detail pages.
 *
 * DESIGN PRINCIPLES
 * - All functions are deterministic: same inputs → same output (hash-based slot picking).
 * - No React, no store imports — safe to use anywhere.
 * - FAQ templates use real college data (name, city, courses, category) — never generic filler.
 * - Related links vary by course × city combinations to avoid doorway-page patterns.
 */

import type { CollegeDetailView } from "../types";

// ---------------------------------------------------------------------------
// College slug (SEO-friendly URL segment)
// ---------------------------------------------------------------------------

/**
 * Convert a college name + optional city into a URL-safe kebab-case slug.
 *
 * Examples:
 *   toCollegeSlug("IIT Bombay", "Mumbai")           → "iit-bombay-mumbai"
 *   toCollegeSlug("VIT Vellore", "Vellore")         → "vit-vellore"
 *   toCollegeSlug("BITS Pilani, Pilani Campus", "")  → "bits-pilani-pilani-campus"
 *
 * - City is appended only when it is non-empty AND not already a substring of the name slug.
 * - Special characters (brackets, commas, dots, etc.) are removed.
 * - Consecutive hyphens are collapsed.
 */
export function toCollegeSlug(name: string, city?: string | null): string {
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")                         // decompose accented chars
      .replace(/[\u0300-\u036f]/g, "")          // strip diacritics
      .replace(/[^\w\s-]/g, "")                 // remove non-word chars
      .trim()
      .replace(/\s+/g, "-")                     // spaces → hyphens
      .replace(/-+/g, "-")                      // collapse multiple hyphens
      .replace(/^-|-$/g, "");                   // trim edge hyphens

  const nameSlug = slugify(name);
  const citySlug = city ? slugify(city) : "";

  // Avoid redundancy — don't append city if it's already in the name slug
  if (!citySlug || nameSlug.includes(citySlug)) {
    return nameSlug;
  }

  return `${nameSlug}-${citySlug}`;
}



// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Fast, deterministic hash from a string (djb2 variant, unsigned 32-bit). */
function hash32(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Pick `count` unique items from `list` using a seed-based shuffled selection. */
function deterministicPick<T>(list: T[], count: number, seed: number): T[] {
  const arr = [...list];
  // Fisher-Yates with LCG seeded by `seed`
  let rng = seed >>> 0;
  for (let i = arr.length - 1; i > 0; i--) {
    rng = (rng * 1664525 + 1013904223) >>> 0;
    const j = rng % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

// ---------------------------------------------------------------------------
// FAQ generation
// ---------------------------------------------------------------------------

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Builds a pool of context-specific FAQ templates, then deterministically
 * picks 5–8 of them based on a hash of the college name. The pool relies on
 * real data (name, city, courses, category) so every college page has
 * naturally-worded, unique questions.
 */
export function generateFaqs(college: CollegeDetailView, currentCourse: string): FaqItem[] {
  if (!college || !college.name) return [];
  const name = college.name;
  const city = college.address?.city ?? "India";
  const state = college.address?.state ?? "";
  const location = state ? `${city}, ${state}` : city;

  // Derive course + category context from the college's actual data
  const coursesByCategory = college.coursesByCategory ?? {};
  const allCategories = Object.keys(coursesByCategory);
  const primaryCategory = allCategories[0] ?? currentCourse ?? "various programs";
  const allCourses = Object.values(coursesByCategory)
    .flat()
    .map((c) => c?.shortForm ?? c?.name)
    .filter((c): c is string => Boolean(c))
    .slice(0, 5);
  const courseList = allCourses.length > 0 ? allCourses.join(", ") : "B.Tech, MBA and more";
  const primaryCourse = allCourses[0] ?? currentCourse ?? "undergraduate programs";

  const seed = hash32(name + city);

  /** Full pool of template FAQs — we pick a subset per college. */
  const pool: FaqItem[] = [
    {
      question: `Is ${name} a good college?`,
      answer: `${name} is a recognised institution in ${location} offering ${primaryCategory} programs. It has received positive reviews from students for academics, campus facilities, and placement support. We recommend comparing rankings, fees, and placement records before making your decision.`,
    },
    {
      question: `What courses are offered at ${name}?`,
      answer: `${name} offers programs across ${primaryCategory}. Key courses include ${courseList}. Visit the college's official website or the nexteduwise college detail page for the latest list of approved programs.`,
    },
    {
      question: `How can I get admission to ${name}?`,
      answer: `Admissions to ${name} are typically based on entrance exam scores (such as JEE Main, CUET, CAT, or state-level exams depending on the course), followed by merit-based shortlisting or counselling. Contact nexteduwise for personalised admission guidance at zero cost.`,
    },
    {
      question: `What is the fee structure at ${name}?`,
      answer: `Fee structures at ${name} vary by program. Engineering and technology courses typically range from ₹50,000 to ₹2,50,000 per year, while management programs may differ. Contact the college directly or speak to a nexteduwise counsellor for the latest approved fee schedule.`,
    },
    {
      question: `Does ${name} provide hostel / accommodation facilities?`,
      answer: `Many colleges in ${city} including ${name} offer on-campus hostel facilities for both boys and girls. Availability and charges may vary. We recommend contacting the admissions office for current availability and fee details.`,
    },
    {
      question: `What is the placement record of ${name}?`,
      answer: `${name} has an active placement cell that connects students with leading companies across industries. Placement outcomes depend on the course and batch; students pursuing ${primaryCourse} often receive offers from relevant sector employers. Speak to a nexteduwise counsellor for verified placement data.`,
    },
    {
      question: `What entrance exams are accepted by ${name}?`,
      answer: `${name} typically accepts national and state entrance exams relevant to its programs — for example, JEE Main and state CETs for engineering, CUET for UG programs, and CAT/MAT/CMAT for MBA. Eligibility criteria can change annually; always confirm with the college directly.`,
    },
    {
      question: `Is ${name} affiliated with a recognised university?`,
      answer: `Yes, ${name} is affiliated with or recognised by a statutory university or regulatory body (UGC/AICTE/MCI as applicable). Its programs lead to formally recognised degrees. Always verify current affiliation status on the college's official website.`,
    },
    {
      question: `Are scholarships available at ${name}?`,
      answer: `Students at ${name} may be eligible for scholarships through government schemes (NSP, state merit scholarships), college-level merit awards, and corporate CSR initiatives. A nexteduwise counsellor can help you identify scholarship options you qualify for.`,
    },
    {
      question: `How is ${city} as a city for students pursuing ${primaryCourse}?`,
      answer: `${city} is one of the prominent education hubs${state ? ` in ${state}` : ""} with a growing ecosystem of colleges, coaching centres, and student communities. It offers reasonable living costs, good connectivity, and access to internship opportunities — making it a popular choice for students pursuing ${primaryCourse}.`,
    },
    {
      question: `Can I apply to ${name} through nexteduwise?`,
      answer: `Yes. nexteduwise offers free counselling to help you understand your eligibility, compare ${name} with similar colleges in ${city}, and guide you through the application process. Fill in your details to connect with a counsellor today.`,
    },
    {
      question: `What is the student-to-faculty ratio at ${name}?`,
      answer: `A healthy student-to-faculty ratio ensures quality education. For programs at ${name}, we recommend checking the NIRF ranking data or the official college disclosure report for the most accurate figures. Our counsellors can help you interpret what these numbers mean for your learning experience.`,
    },
  ];

  // Pick 6 questions deterministically (no two colleges get exactly the same set)
  const count = 6;
  return deterministicPick(pool, count, seed);
}

// ---------------------------------------------------------------------------
// Related links generation
// ---------------------------------------------------------------------------

export interface RelatedLink {
  /** Human-readable anchor text, e.g. "Top Engineering Colleges in Pune" */
  label: string;
  /** URL path + query, e.g. "/colleges?course=Engineering&city=Pune" */
  href: string;
}

/**
 * Popular cities for cross-location related links.
 * Ordered by rough search volume / student population.
 */
const POPULAR_CITIES = [
  "Bhopal",
  "Indore",
  "Delhi",
  "Pune",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Jaipur",
  "Lucknow",
];

/**
 * Normalizes any course/category search string into a clean keyword
 * that Shiksha's category search recognizes.
 * e.g., "Engineering and Technology" -> "Engineering"
 *       "Private Engineering" -> "Engineering"
 *       "Government B.Tech" -> "B.Tech"
 *       "Medicine & Health Sciences" -> "Medical"
 *       "Top MBA Colleges" -> "MBA"
 */
export function normalizeCourseQuery(input?: string | null): string {
  if (!input) return "Engineering";
  let cleaned = input.trim();

  // Strip common prefix qualifiers
  cleaned = cleaned.replace(/^(Private|Government|Govt|Top|Best|Popular)\s+/i, "");
  // Strip common suffix qualifiers
  cleaned = cleaned.replace(/\s+(Colleges|Institutes|Courses|Degrees|Course|Programs)(\s+in\s+.*)?$/i, "");
  cleaned = cleaned.trim();

  // Standardized ALIASES mapping
  const ALIASES: Record<string, string> = {
    // Engineering
    "Engineering": "Engineering",
    "Engineering & Technology": "Engineering",
    "Engineering and Technology": "Engineering",
    "B.Tech": "Engineering",
    "Bachelor of Technology": "Engineering",
    "M.Tech": "Engineering",
    "Master of Technology": "Engineering",

    // Management
    "Management": "Management",
    "Management & Business": "Management",
    "Management and Business": "Management",
    "Management & Business Administration": "Management",
    "Management and Business Administration": "Management",
    "MBA": "Management",
    "Master of Business Administration": "Management",
    "BBA": "Management",
    "Bachelor of Business Administration": "Management",

    // Medical
    "Medical": "Medical",
    "Medical & Healthcare": "Medical",
    "Medical and Healthcare": "Medical",
    "Medicine & Health Sciences": "Medical",
    "Medicine and Health Sciences": "Medical",
    "MBBS": "Medical",

    // Computer Applications
    "Computer Applications": "BCA",
    "Computer Applications & IT": "BCA",
    "Computer Applications and IT": "BCA",
    "IT and Computer Applications": "BCA",
    "IT & Computer Applications": "BCA",
    "BCA": "BCA",
    "MCA": "BCA",

    // Science
    "Science": "Science",
    "B.Sc": "Science",
    "M.Sc": "Science",

    // Commerce
    "Commerce": "Commerce",
    "Commerce & Finance": "Commerce",
    "Commerce and Finance": "Commerce",
    "B.Com": "Commerce",
    "M.Com": "Commerce",

    // Law
    "Law": "Law",
    "Law & Legal Studies": "Law",
    "Law and Legal Studies": "Law",
    "LL.B": "Law",

    // Architecture
    "Architecture": "Architecture",
    "Architecture & Planning": "Architecture",
    "Architecture and Planning": "Architecture",
    "Architecture and Planning Course": "Architecture",
    "B.Arch": "Architecture",

    // Design
    "Design": "Design",
    "Design & Fine Arts": "Design",
    "Design and Fine Arts": "Design",
    "B.Des": "Design",

    // Arts
    "Arts": "Arts",
    "Arts, Humanities & Social Sciences": "Arts",
    "Arts, Humanities and Social Sciences": "Arts",
    "Humanities & Social Sciences": "Arts",
    "Humanities and Social Sciences": "Arts",
    "BA": "Arts",
    "MA": "Arts",

    // Pharmacy
    "Pharmacy": "Pharmacy",
    "B.Pharm": "Pharmacy",

    // Paramedical
    "Paramedical": "Paramedical",
    "Paramedical & Allied Health": "Paramedical",
    "Paramedical and Allied Health": "Paramedical",

    // Education
    "Education": "Education",
    "Education & Teaching": "Education",
    "Education and Teaching": "Education",
    "Teaching & Education": "Education",
    "Teaching and Education": "Education",

    // Hotel Management
    "Hotel Management": "Hotel Management",
    "Hotel Management & Hospitality": "Hotel Management",
    "Hotel Management and Hospitality": "Hotel Management",
    "Hospitality & Travel": "Hotel Management",
    "Hospitality and Travel": "Hotel Management",

    // Doctoral / PhD
    "PhD": "PhD",
    "Doctoral & Research": "PhD",
    "Doctoral and Research": "PhD",
    "Doctoral / Research Programs": "PhD",

    // Vocational
    "Vocational": "Vocational",
    "Vocational & Skill-Based": "Vocational",
    "Vocational and Skill-Based": "Vocational",
  };

  if (ALIASES[cleaned]) return ALIASES[cleaned];

  const lower = cleaned.toLowerCase();
  for (const [key, val] of Object.entries(ALIASES)) {
    if (key.toLowerCase() === lower) return val;
  }

  // Regex fallback rules
  if (/political science|social science/i.test(cleaned)) return "Arts";
  if (/engineering/i.test(cleaned)) return "Engineering";
  if (/management|mba|bba/i.test(cleaned)) return "Management";
  if (/medical|medicine|mbbs/i.test(cleaned)) return "Medical";
  if (/computer|bca|mca/i.test(cleaned)) return "Computer Applications";
  if (/science/i.test(cleaned)) return "Science";
  if (/commerce/i.test(cleaned)) return "Commerce";
  if (/law/i.test(cleaned)) return "Law";
  if (/architecture/i.test(cleaned)) return "Architecture";
  if (/design/i.test(cleaned)) return "Design";
  if (/arts|humanities/i.test(cleaned)) return "Arts";
  if (/pharmacy/i.test(cleaned)) return "Pharmacy";
  if (/education|teaching/i.test(cleaned)) return "Education";
  if (/hotel|hospitality/i.test(cleaned)) return "Hotel Management";

  return cleaned || "Engineering";
}


/**
 * Courses adjacent to the primary course — used to suggest related programs
 * in the same city. Mapping: course keyword → list of related course keywords.
 */
const RELATED_COURSES: Record<string, string[]> = {
  Engineering: ["MBA", "Computer Applications", "Science"],
  Management: ["Engineering", "Commerce", "Hotel Management"],
  MBA: ["Engineering", "Management", "Commerce"],
  Medical: ["Pharmacy", "Paramedical", "Science"],
  Science: ["Engineering", "Pharmacy", "Medical"],
  Commerce: ["Management", "MBA", "Law"],
  Law: ["Commerce", "Arts", "Management"],
  Design: ["Architecture", "Arts", "Engineering"],
  Architecture: ["Design", "Engineering", "Arts"],
  Pharmacy: ["Medical", "Science", "Paramedical"],
  Nursing: ["Medical", "Pharmacy", "Paramedical"],
  Arts: ["Law", "Education", "Management"],
  Education: ["Arts", "Science", "Commerce"],
  "Computer Applications": ["Engineering", "Science", "Management"],
  MCA: ["Engineering", "Computer Applications", "Management"],
  BCA: ["Engineering", "Computer Applications", "Science"],
  Vocational: ["Engineering", "Management", "Computer Applications"],
  Paramedical: ["Medical", "Pharmacy", "Science"],
  PhD: ["Science", "Engineering", "Management"],
};

/** Fast, clean slugifier for URLs */
export function slugify(s: string): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Build clean human-readable SEO URLs for course & city combinations */
export function toCollegesUrl(course: string, city: string): string {
  const citySlug = slugify(city);
  const courseSlug = slugify(course);
  const normCategory = course.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!citySlug && !courseSlug) return "/colleges";
  if (!citySlug) return `/courses/${courseSlug}`;
  if (!courseSlug) return `/colleges/${citySlug}`;

  // Must precede the management check: "hotel management" contains "management".
  if (normCategory.includes("hotel") || normCategory.includes("hospitality")) {
    return `/hotel-management-colleges/${citySlug}`;
  }
  if (normCategory.includes("engineering") || normCategory.includes("btech")) {
    return `/engineering-colleges/${citySlug}`;
  }
  if (normCategory.includes("bca")) {
    return `/bca-colleges/${citySlug}`;
  }
  if (normCategory.includes("mca")) {
    return `/mca-colleges/${citySlug}`;
  }
  if (normCategory.includes("management") || normCategory.includes("mba")) {
    return `/mba-colleges/${citySlug}`;
  }
  if (normCategory.includes("bba")) {
    return `/bba-colleges/${citySlug}`;
  }
  if (normCategory.includes("medical") || normCategory.includes("mbbs")) {
    return `/medical-colleges/${citySlug}`;
  }
  if (normCategory.includes("pharmacy") || normCategory.includes("bpharma")) {
    return `/pharmacy-colleges/${citySlug}`;
  }
  if (normCategory.includes("nursing")) {
    return `/nursing-colleges/${citySlug}`;
  }
  if (normCategory.includes("law") || normCategory.includes("llb")) {
    return `/law-colleges/${citySlug}`;
  }
  if (normCategory.includes("design") || normCategory.includes("bdes")) {
    return `/design-colleges/${citySlug}`;
  }
  if (normCategory.includes("commerce") || normCategory.includes("bcom")) {
    return `/commerce-colleges/${citySlug}`;
  }
  if (normCategory.includes("architecture") || normCategory.includes("barch")) {
    return `/architecture-colleges/${citySlug}`;
  }
  if (normCategory.includes("agriculture")) {
    return `/agriculture-colleges/${citySlug}`;
  }
  if (normCategory.includes("bed")) {
    return `/bed-colleges/${citySlug}`;
  }

  // Clean fallback pattern matching the dynamic wildcard route in App.tsx
  return `/${courseSlug}-colleges/${citySlug}`;
}

/**
 * Generate 6–10 related internal links for a college detail page.
 *
 * Strategy:
 *  1. Same course, top 4 other popular cities (excluding current city)
 *  2. Same city, 2–3 related courses
 *  3. "Private" qualifier for current course + city
 *  4. "Government" qualifier for current course + current state city
 *
 * Self-links (same course + same city as current page) are filtered out.
 */
export function generateRelatedLinks(
  college: CollegeDetailView,
  currentCourse: string,
): RelatedLink[] {
  if (!college) return [];
  const city = (college.address?.city ?? "").trim();
  const state = (college.address?.state ?? "").trim();
  const rawCourse = currentCourse || "Engineering";
  const course = normalizeCourseQuery(rawCourse);

  // Normalise city for dedup comparison (lowercase)
  const currentCityLower = city.toLowerCase();

  const links: RelatedLink[] = [];
  const seen = new Set<string>();

  const add = (label: string, linkCourse: string, linkCity: string) => {
    const normCourse = normalizeCourseQuery(linkCourse);
    // Prevent self-link
    if (
      normCourse.toLowerCase() === course.toLowerCase() &&
      linkCity.toLowerCase() === currentCityLower
    ) return;
    const key = `${normCourse.toLowerCase()}::${linkCity.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ label, href: toCollegesUrl(normCourse, linkCity) });
  };

  // --- 1. Same course in other popular cities ---
  const otherCities = POPULAR_CITIES.filter(
    (c) => c.toLowerCase() !== currentCityLower,
  ).slice(0, 4);

  for (const otherCity of otherCities) {
    add(`Top ${course} Colleges in ${otherCity}`, course, otherCity);
  }

  // --- 2. Related courses in the current city ---
  if (city) {
    const related = RELATED_COURSES[course] ?? ["MBA", "Engineering", "Science"];
    for (const relCourse of related.slice(0, 3)) {
      add(`Top ${relCourse} Colleges in ${city}`, relCourse, city);
    }
  }

  // --- 3. Private / Government qualifier combos ---
  if (city) {
    add(`Private ${course} Colleges in ${city}`, course, city);
    add(`Government ${course} Colleges in ${city}`, course, city);
  }

  // --- 4. Same course in state capital / major state city (if state known) ---
  if (state) {
    const stateCapitals: Record<string, string> = {
      "Madhya Pradesh": "Bhopal",
      Maharashtra: "Mumbai",
      "Uttar Pradesh": "Lucknow",
      Rajasthan: "Jaipur",
      Karnataka: "Bangalore",
      "Tamil Nadu": "Chennai",
      Gujarat: "Ahmedabad",
      Delhi: "Delhi",
      Punjab: "Chandigarh",
      Haryana: "Chandigarh",
      "West Bengal": "Kolkata",
      Telangana: "Hyderabad",
      "Andhra Pradesh": "Hyderabad",
      Kerala: "Thiruvananthapuram",
    };
    const capital = stateCapitals[state];
    if (capital && capital.toLowerCase() !== currentCityLower) {
      add(`Top ${course} Colleges in ${capital}`, course, capital);
    }
  }

// Cap at 10 links
  return links.slice(0, 10);
}

// ===========================================================
// Recommendation Engine for Colleges, Courses & Cities
// ===========================================================

export interface RecommendationItem {
  label: string;
  href: string;
  type: "college" | "course" | "city";
  priority: number;
}

interface RecommendationOptions {
  course?: string;
  city?: string;
  state?: string;
  colleges?: Array<{ name: string; city?: string | null; coursesByCategory?: Record<string, { name: string }[]> }>;
  popularCities?: string[];
  maxItems?: number;
  /** College name to exclude from "similar colleges" (e.g. the college already being viewed). */
  excludeCollegeName?: string;
}

const DEFAULT_POPULAR_CITIES = [
  "Bhopal",
  "Indore",
  "Pune",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Jaipur",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Lucknow",
  "Chandigarh",
];

const COURSE_ALIASES: Record<string, string[]> = {
  Engineering: ["B.Tech", "M.Tech", "B.E", "M.E", "Computer Applications", "Science"],
  "Computer Applications": ["BCA", "MCA", "Engineering", "IT"],
  Management: ["MBA", "BBA", "PGDM", "Commerce"],
  Medical: ["MBBS", "Pharmacy", "Paramedical", "Nursing"],
  Science: ["B.Sc", "M.Sc", "Engineering", "Medical"],
  Commerce: ["B.Com", "M.Com", "Management", "MBA"],
  Law: ["LLB", "BA LLB", "BBA LLB", "Arts"],
  Design: ["B.Des", "M.Des", "Architecture", "Arts"],
  Architecture: ["B.Arch", "M.Arch", "Design", "Planning"],
  Arts: ["BA", "MA", "Law", "Education"],
  Education: ["B.Ed", "M.Ed", "Arts", "Science"],
  Pharmacy: ["B.Pharm", "M.Pharm", "Medical", "Paramedical"],
  Paramedical: ["BPT", "BMLT", "Nursing", "Pharmacy"],
};

const CITY_PROXIMITY: Record<string, string[]> = {
  Bhopal: ["Indore", "Jabalpur", "Gwalior"],
  Indore: ["Bhopal", "Ujjain", "Khandwa"],
  Pune: ["Mumbai", "Nashik", "Ahmednagar"],
  Mumbai: ["Pune", "Thane", "Navi Mumbai"],
  Delhi: ["Noida", "Gurgaon", "Faridabad", "Ghaziabad"],
  Bangalore: ["Mysore", "Hubli", "Mangalore"],
  Hyderabad: ["Secunderabad", "Warangal", "Nizamabad"],
  Chennai: ["Coimbatore", "Madurai", "Trichy"],
  Kolkata: ["Howrah", "Durgapur", "Siliguri"],
  Ahmedabad: ["Gandhinagar", "Surat", "Vadodara"],
  Lucknow: ["Kanpur", "Agra", "Varanasi"],
  Chandigarh: ["Mohali", "Panchkula", "Ludhiana"],
};

/** Canonical course categories used to compute "similar courses" recommendations. */
const ALL_COURSE_CATEGORIES = [
  "Engineering",
  "Management",
  "Medical",
  "Law",
  "Design",
  "Commerce",
  "Science",
  "Arts",
  "Education",
  "Pharmacy",
  "Paramedical",
  "Architecture",
  "Computer Applications",
];

/**
 * Suggest up to `count` genuinely different course categories for a given course.
 * `normalizeCourse` collapses aliases (B.Tech/M.E → Engineering), so we normalize
 * before comparing to avoid recommending the same category the user already picked.
 */
function relatedCourseCategories(course: string, count = 3): string[] {
  const normalized = normalizeCourse(course);
  const fromAliases = (COURSE_ALIASES[normalized] ?? [])
    .map((alias) => normalizeCourse(alias))
    .filter((aliasCat) => aliasCat !== normalized);
  const fromAll = ALL_COURSE_CATEGORIES.filter((cat) => cat !== normalized);
  const combined = [...new Set([...fromAliases, ...fromAll])];
  return combined.slice(0, count);
}

function normalizeCourse(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "Engineering";

  const lower = trimmed.toLowerCase();
  if (/engineering|b\.?tech|b\.?e|m\.?tech/i.test(lower)) return "Engineering";
  if (/management|mba|pgdm|bba/i.test(lower)) return "Management";
  if (/medical|mbbs|md|ms/i.test(lower)) return "Medical";
  if (/computer|bca|mca|it|information technology/i.test(lower)) return "Computer Applications";
  if (/science|b\.?sc|m\.?sc/i.test(lower)) return "Science";
  if (/commerce|b\.?com|m\.?com/i.test(lower)) return "Commerce";
  if (/law|llb|ba llb|bba llb/i.test(lower)) return "Law";
  if (/design|b\.?des|m\.?des/i.test(lower)) return "Design";
  if (/architecture|b\.?arch|m\.?arch|planning/i.test(lower)) return "Architecture";
  if (/arts|humanities|ba|ma/i.test(lower)) return "Arts";
  if (/education|b\.?ed|m\.?ed|teaching/i.test(lower)) return "Education";
  if (/pharmacy|b\.?pharm|m\.?pharm|d\.?pharm/i.test(lower)) return "Pharmacy";
  if (/paramedical|nursing|bpt|bmlt|physiotherapy/i.test(lower)) return "Paramedical";
  if (/vocational|skill|diploma/i.test(lower)) return "Vocational";

  if (COURSE_ALIASES[trimmed]) return trimmed;
  if (lower.includes("engineering")) return "Engineering";
  if (lower.includes("management") || lower.includes("mba")) return "Management";
  if (lower.includes("medical")) return "Medical";
  if (lower.includes("computer") || lower.includes("bca") || lower.includes("mca")) return "Computer Applications";
  if (lower.includes("science")) return "Science";
  if (lower.includes("commerce")) return "Commerce";
  if (lower.includes("law")) return "Law";
  if (lower.includes("design")) return "Design";
  if (lower.includes("arts") || lower.includes("humanities")) return "Arts";

  return trimmed || "Engineering";
}

function toCourseSlug(course: string): string {
  const normalized = normalizeCourse(course);
  const map: Record<string, string> = {
    Engineering: "engineering",
    Management: "mba",
    "Computer Applications": "bca",
    Medical: "medical",
    Science: "science",
    Commerce: "commerce",
    Law: "law",
    Design: "design",
    Architecture: "architecture",
    Arts: "arts",
    Education: "education",
    Pharmacy: "pharmacy",
    Paramedical: "paramedical",
    Vocational: "vocational",
  };
  return map[normalized] || slugify(normalized);
}

function pickUnique<T>(items: T[], max: number): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = typeof item === "string" ? item : JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
      if (result.length >= max) break;
    }
  }
  return result;
}

/**
 * Generate fallback recommendations when no specific college data is available.
 * These are generic but SEO-friendly links based on course/city patterns.
 */
function generateFallbackRecommendations(options: RecommendationOptions): RecommendationItem[] {
  const { course = "", city = "", maxItems = 12 } = options;
  const normalizedCourse = normalizeCourse(course);
  const recommendations: RecommendationItem[] = [];
  const seen = new Set<string>();

  const add = (label: string, href: string, type: RecommendationItem["type"], priority: number) => {
    const key = `${type}:${href}`;
    if (!seen.has(key) && href) {
      seen.add(key);
      recommendations.push({ label, href, type, priority });
    }
  };

  const courseCities = [
    ...DEFAULT_POPULAR_CITIES,
  ];

  const relatedCourses = relatedCourseCategories(normalizedCourse, 3);

  if (city) {
    const cityLower = city.toLowerCase();
    const nearbyCities =
      CITY_PROXIMITY[city]?.filter((c) => c.toLowerCase() !== cityLower) ?? [];

    for (const nearby of nearbyCities.slice(0, 3)) {
      add(
        `Top ${normalizedCourse} Colleges in ${nearby}`,
        toCollegesUrl(normalizedCourse, nearby),
        "city",
        2,
      );
    }

    for (const relCourse of relatedCourses) {
      add(
        `Top ${relCourse} Colleges in ${city}`,
        toCollegesUrl(relCourse, city),
        "course",
        3,
      );
    }
  }

  for (const popularCity of courseCities.slice(0, 4)) {
    if (city && popularCity.toLowerCase() === city.toLowerCase()) continue;
    add(
      `Top ${normalizedCourse} Colleges in ${popularCity}`,
      toCollegesUrl(normalizedCourse, popularCity),
      "city",
      4,
    );
  }

  for (const relCourse of relatedCourses) {
    add(`Top ${relCourse} Colleges in India`, `/courses/${toCourseSlug(relCourse)}`, "course", 5);
  }

  return recommendations.slice(0, maxItems);
}

/**
 * Generate recommendations from actual college data.
 * Extracts patterns from the college list to suggest similar colleges, nearby cities, and related courses.
 */
export function generateRecommendations(options: RecommendationOptions): RecommendationItem[] {
  const {
    course = "",
    city = "",
    state = "",
    excludeCollegeName = "",
    colleges = [],
    popularCities = DEFAULT_POPULAR_CITIES,
    maxItems = 12,
  } = options;

  const recommendations: RecommendationItem[] = [];
  const seen = new Set<string>();

  const add = (label: string, href: string, type: RecommendationItem["type"], priority: number) => {
    const key = `${type}:${href}`;
    if (!seen.has(key) && href) {
      seen.add(key);
      recommendations.push({ label, href, type, priority });
    }
  };

  const normalizedCourse = normalizeCourse(course);
  const cityLower = city.toLowerCase();
  const currentState = state.trim();

  // Extract data from available colleges
  const citiesFromColleges = new Set<string>();
  const coursesFromColleges = new Set<string>();
  const collegeNames = new Set<string>();

  for (const college of colleges) {
    if (college.name) collegeNames.add(college.name.trim());
    if (college.city) citiesFromColleges.add(college.city.trim());
    if (college.coursesByCategory) {
      for (const courses of Object.values(college.coursesByCategory)) {
        for (const c of courses) {
          if (c.name) coursesFromColleges.add(c.name.trim());
        }
      }
    }
  }

  // --- 0. Similar colleges → deep links to real college detail pages ---
  // The colleges found by the current search are turned into direct internal
  // links (`/college-detail/<name-city>`), so a click lands on a real college
  // page instead of a generic category listing. Same-city colleges rank first,
  // the currently-viewed college (excludeCollegeName) is skipped, and identical
  // slugs are de-duplicated so each unique college is suggested once.
  const excludeName = excludeCollegeName.trim().toLowerCase();
  const realCollegeSlugs = new Set<string>();
  let realCollegeCount = 0;

  for (const college of colleges) {
    const collegeName = (college.name ?? "").trim();
    if (!collegeName) continue;
    if (excludeName && collegeName.toLowerCase() === excludeName) continue;

    const collegeCity = (college.city ?? city ?? "").trim();
    const collegeUrlSlug = toCollegeSlug(collegeName, collegeCity || null);
    const slugKey = collegeUrlSlug.toLowerCase();
    if (!collegeUrlSlug || realCollegeSlugs.has(slugKey)) continue;
    realCollegeSlugs.add(slugKey);

    const sameCity =
      Boolean(collegeCity) && collegeCity.toLowerCase() === cityLower;
    add(collegeName, `/colleges/detail/${collegeUrlSlug}`, "college", sameCity ? 1 : 2);
    realCollegeCount += 1;
    if (realCollegeCount >= 6) break;
  }

  // --- 1. Similar colleges from the same course in nearby/popular cities ---
  const nearbyCities = new Set<string>();
  if (city) {
    const proximityList = CITY_PROXIMITY[city] ?? [];
    for (const nearby of proximityList) {
      if (nearby.toLowerCase() !== cityLower) nearbyCities.add(nearby);
    }
  }

  for (const popularCity of popularCities) {
    if (popularCity.toLowerCase() !== cityLower) nearbyCities.add(popularCity);
  }

  const uniqueNearbyCities = pickUnique([...nearbyCities], 5);
  for (const nearbyCity of uniqueNearbyCities) {
    add(
      `Top ${normalizedCourse} Colleges in ${nearbyCity}`,
      toCollegesUrl(normalizedCourse, nearbyCity),
      "city",
      1,
    );
  }

  // --- 2. Related courses in the same city ---
  if (city) {
    for (const relCourse of relatedCourseCategories(normalizedCourse)) {
      add(
        `Top ${relCourse} Colleges in ${city}`,
        toCollegesUrl(relCourse, city),
        "course",
        2,
      );
    }

    add(`Private ${normalizedCourse} Colleges in ${city}`, toCollegesUrl(normalizedCourse, city), "college", 3);
    add(`Government ${normalizedCourse} Colleges in ${city}`, toCollegesUrl(normalizedCourse, city), "college", 4);

    // Nearby cities from actual data
    const citiesFromData = pickUnique([...citiesFromColleges].filter((c) => c.toLowerCase() !== cityLower), 3);
    for (const nearbyCity of citiesFromData) {
      add(
        `Top ${normalizedCourse} Colleges in ${nearbyCity}`,
        toCollegesUrl(normalizedCourse, nearbyCity),
        "city",
        5,
      );
    }
  }

  // --- 3. State-level recommendations if state is known ---
  if (currentState) {
    const stateCapitals: Record<string, string> = {
      "Madhya Pradesh": "Bhopal",
      Maharashtra: "Mumbai",
      "Uttar Pradesh": "Lucknow",
      Rajasthan: "Jaipur",
      Karnataka: "Bangalore",
      "Tamil Nadu": "Chennai",
      Gujarat: "Ahmedabad",
      Delhi: "Delhi",
      Punjab: "Chandigarh",
      Haryana: "Chandigarh",
      "West Bengal": "Kolkata",
      Telangana: "Hyderabad",
      "Andhra Pradesh": "Hyderabad",
      Kerala: "Thiruvananthapuram",
    };

    const capital = stateCapitals[currentState];
    if (capital && capital.toLowerCase() !== cityLower) {
      add(
        `Top ${normalizedCourse} Colleges in ${capital}`,
        toCollegesUrl(normalizedCourse, capital),
        "city",
        6,
      );
    }
  }

  // --- 4. Course-only fallback recommendations ---
  for (const relCourse of relatedCourseCategories(normalizedCourse)) {
    add(`Top ${relCourse} Colleges in India`, `/courses/${toCourseSlug(relCourse)}`, "course", 7);
  }

  // --- 5. If no specific recommendations, use fallback ---
  if (recommendations.length === 0) {
    const fallback = generateFallbackRecommendations({ course: normalizedCourse, city, maxItems });
    return fallback;
  }

  const sorted = recommendations.sort((a, b) => a.priority - b.priority);
  return sorted.slice(0, maxItems);
}

/**
 * Generate simple fallback recommendations specifically for homepage/empty states.
 */
export function generateHomepageRecommendations(course: string = "Engineering", city: string = ""): RecommendationItem[] {
  const normalizedCourse = normalizeCourse(course);
  const recommendations: RecommendationItem[] = [];
  const seen = new Set<string>();

  const add = (label: string, href: string, type: RecommendationItem["type"], priority: number) => {
    const key = `${type}:${href}`;
    if (!seen.has(key) && href) {
      seen.add(key);
      recommendations.push({ label, href, type, priority });
    }
  };

  const popularCities = DEFAULT_POPULAR_CITIES.slice(0, 6);

  for (const popCity of popularCities) {
    add(
      `Top ${normalizedCourse} Colleges in ${popCity}`,
      toCollegesUrl(normalizedCourse, popCity),
      "city",
      1,
    );
  }

  const relatedCourses = relatedCourseCategories(normalizedCourse, 4);
  for (const relCourse of relatedCourses) {
    add(`Top ${relCourse} Colleges in India`, `/courses/${toCourseSlug(relCourse)}`, "course", 2);
  }

  if (city) {
    const nearbyCities = CITY_PROXIMITY[city]?.slice(0, 3) ?? [];
    for (const nearbyCity of nearbyCities) {
      add(
        `Top ${normalizedCourse} Colleges in ${nearbyCity}`,
        toCollegesUrl(normalizedCourse, nearbyCity),
        "city",
        3,
      );
    }
  }

  return recommendations.slice(0, 10);
}

// ---------------------------------------------------------------------------
// Schema.org JSON-LD Generators
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[], origin: string = "https://nexteduwise.com") {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${origin}${item.url.startsWith("/") ? "" : "/"}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

export function generateCollegeSchema(college: CollegeDetailView, origin: string = "https://nexteduwise.com") {
  if (!college) return {};
  const city = college.address?.city ?? "";
  const state = college.address?.state ?? "";
  const slug = toCollegeSlug(college.name || "", city);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": college.name || "College",
    "description": `Detailed admissions, courses, fee structure, eligibility, and facilities for ${college.name || "this college"}${city ? ` in ${city}` : ""}.`,
    "url": `${origin}/colleges/detail/${slug}`,
    "logo": college.logo ? (college.logo.startsWith("http") ? college.logo : `${origin}${college.logo}`) : undefined,
    "image": college.backgroundImage ? (college.backgroundImage.startsWith("http") ? college.backgroundImage : `${origin}${college.backgroundImage}`) : undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": college.address?.full || undefined,
      "addressLocality": city || undefined,
      "addressRegion": state || undefined,
      "addressCountry": "IN",
    },
  };

  if (college.aggregateRating || college.reviews?.length) {
    const ratingVal = college.aggregateRating ?? (college.reviews?.length ? (college.reviews.reduce((acc, r) => acc + r.rating, 0) / college.reviews.length) : null);
    if (ratingVal) {
      schema["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": ratingVal,
        "bestRating": 10,
        "worstRating": 1,
        "ratingCount": college.reviews?.length || 1,
      };
    }
  }

  if (college.averageFees) {
    schema["makesOffer"] = {
      "@type": "Offer",
      "price": college.averageFees,
      "priceCurrency": "INR",
      "description": `Average tuition fee for programs at ${college.name}`,
    };
  }

  if (college.facilities && college.facilities.length > 0) {
    schema["amenityFeature"] = college.facilities.map((facility) => ({
      "@type": "LocationFeatureSpecification",
      "name": facility,
      "value": true,
    }));
  }

  return schema;
}


export function generateWebSiteSchema(origin: string = "https://nexteduwise.com") {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NextEduWise",
    "url": origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${origin}/colleges?name={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema(origin: string = "https://nexteduwise.com") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NextEduWise",
    "url": origin,
    "logo": `${origin}/favicon.ico`,
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "admissions counseling",
      "availableLanguage": ["English", "Hindi"],
    },
  };
}

/** Faceted Search Robots Directive Guard */
export function getRobotsDirective(isFilteredOrPaginated: boolean = false): string {
  if (isFilteredOrPaginated) {
    return "noindex, follow";
  }
  return "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
}


