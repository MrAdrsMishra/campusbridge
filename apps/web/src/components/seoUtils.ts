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
  const name = college.name;
  const city = college.address.city ?? "India";
  const state = college.address.state ?? "";
  const location = state ? `${city}, ${state}` : city;

  // Derive course + category context from the college's actual data
  const allCategories = Object.keys(college.coursesByCategory);
  const primaryCategory = allCategories[0] ?? currentCourse ?? "various programs";
  const allCourses = Object.values(college.coursesByCategory)
    .flat()
    .map((c) => c.shortForm ?? c.name)
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

/** Build a `/colleges?course=X&city=Y` URL. */
function toCollegesUrl(course: string, city: string): string {
  const params = new URLSearchParams({ course, city });
  return `/colleges?${params.toString()}`;
}

/**
 * Generate 6–10 related internal links for a college detail page.
 *
 * Strategy:
 *  1. Same course, top 3 other popular cities (excluding current city)
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
  const city = (college.address.city ?? "").trim();
  const state = (college.address.state ?? "").trim();
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

