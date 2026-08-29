import React, { useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useCourseCategoryStore } from "../../stores/courseCategoryStore";
import { Link } from "react-router-dom";
import { normalizeCourseQuery, toCollegesUrl } from "../seoUtils";

export const coursesByCategory: Record<
  string,
  { name: string; shortForm: string | null }[]
> = {
  "Engineering & Technology": [
    { name: "Bachelor of Technology", shortForm: "B.Tech" },
    { name: "Master of Technology", shortForm: "M.Tech" },
    { name: "B.E.", shortForm: "B.E." },
    { name: "M.E.", shortForm: "M.E." },
    { name: "Computer Science Engineering", shortForm: "CSE" },
    { name: "Artificial Intelligence & Data Science", shortForm: "AI & DS" },
    { name: "Mechanical Engineering", shortForm: "Mechanical" },
    { name: "Civil Engineering", shortForm: "Civil" },
  ],

  "Management & Business": [
    { name: "Master of Business Administration", shortForm: "MBA" },
    { name: "Bachelor of Business Administration", shortForm: "BBA" },
    { name: "Bachelor of Hotel Management", shortForm: "BHM" },
    { name: "Business Analytics", shortForm: "Business Analytics" },
    { name: "Finance", shortForm: "Finance" },
    { name: "Marketing", shortForm: "Marketing" },
  ],

  "Medical & Healthcare": [
    { name: "Bachelor of Medicine & Bachelor of Surgery", shortForm: "MBBS" },
    { name: "Bachelor of Dental Surgery", shortForm: "BDS" },
    { name: "Bachelor of Ayurvedic Medicine & Surgery", shortForm: "BAMS" },
    { name: "Bachelor of Physiotherapy", shortForm: "BPT" },
    { name: "Nursing", shortForm: "B.Sc Nursing" },
    { name: "Allied Health Sciences", shortForm: "Allied Health" },
  ],

  "Computer Applications & IT": [
    { name: "Bachelor of Computer Applications", shortForm: "BCA" },
    { name: "Master of Computer Applications", shortForm: "MCA" },
    { name: "Computer Science", shortForm: "Computer Science" },
    { name: "Data Science", shortForm: "Data Science" },
    { name: "Artificial Intelligence", shortForm: "AI" },
    { name: "Cyber Security", shortForm: "Cyber Security" },
  ],

  Science: [
    { name: "Bachelor of Science", shortForm: "B.Sc" },
    { name: "Master of Science", shortForm: "M.Sc" },
    { name: "Biotechnology", shortForm: "Biotechnology" },
    { name: "Physics", shortForm: "Physics" },
    { name: "Chemistry", shortForm: "Chemistry" },
    { name: "Mathematics", shortForm: "Mathematics" },
  ],

  "Commerce & Finance": [
    { name: "Bachelor of Commerce", shortForm: "B.Com" },
    { name: "Master of Commerce", shortForm: "M.Com" },
    { name: "Accounting & Finance", shortForm: "Accounting" },
    { name: "Banking & Finance", shortForm: "Banking & Finance" },
    { name: "Economics", shortForm: "Economics" },
  ],

  "Law & Legal Studies": [
    { name: "Bachelor of Laws", shortForm: "LL.B" },
    { name: "Integrated Law", shortForm: "BA LL.B" },
    { name: "Integrated Law", shortForm: "BBA LL.B" },
    { name: "Master of Laws", shortForm: "LL.M" },
  ],

  "Architecture & Planning": [
    { name: "Bachelor of Architecture", shortForm: "B.Arch" },
    { name: "Master of Architecture", shortForm: "M.Arch" },
    { name: "Bachelor of Planning", shortForm: "B.Plan" },
    { name: "Master of Planning", shortForm: "M.Plan" },
  ],

  "Design & Fine Arts": [
    { name: "Bachelor of Design", shortForm: "B.Des" },
    { name: "Master of Design", shortForm: "M.Des" },
    { name: "Fine Arts", shortForm: "BFA" },
    { name: "Fashion Design", shortForm: "Fashion Design" },
    { name: "Graphic Design", shortForm: "Graphic Design" },
  ],

  "Arts, Humanities & Social Sciences": [
    { name: "Bachelor of Arts", shortForm: "BA" },
    { name: "Master of Arts", shortForm: "MA" },
    { name: "Psychology", shortForm: "Psychology" },
    { name: "English", shortForm: "English" },
    { name: "Political Science", shortForm: "Political Science" },
    { name: "Sociology", shortForm: "Sociology" },
  ],

  Pharmacy: [
    { name: "Diploma in Pharmacy", shortForm: "D.Pharm" },
    { name: "Bachelor of Pharmacy", shortForm: "B.Pharm" },
    { name: "Master of Pharmacy", shortForm: "M.Pharm" },
    { name: "Doctor of Pharmacy", shortForm: "Pharm.D" },
  ],

  "Paramedical & Allied Health": [
    { name: "Bachelor of Medical Laboratory Technology", shortForm: "BMLT" },
    { name: "Master of Medical Laboratory Technology", shortForm: "MMLT" },
    { name: "Diploma in Medical Laboratory Technology", shortForm: "DMLT" },
    { name: "Operation Theatre Technology", shortForm: "OTT" },
    { name: "Medical Imaging Technology", shortForm: "MIT" },
  ],

  "Education & Teaching": [
    { name: "Bachelor of Education", shortForm: "B.Ed" },
    { name: "Master of Education", shortForm: "M.Ed" },
    { name: "Diploma in Elementary Education", shortForm: "D.El.Ed" },
    { name: "Bachelor of Elementary Education", shortForm: "B.El.Ed" },
  ],

  "Hotel Management & Hospitality": [
    { name: "Bachelor of Hotel Management", shortForm: "BHM" },
    { name: "Hotel & Hospitality Management", shortForm: "Hospitality" },
    { name: "Culinary Arts", shortForm: "Culinary Arts" },
    { name: "Travel & Tourism", shortForm: "Travel & Tourism" },
  ],

  "Doctoral & Research": [
    { name: "Doctor of Philosophy", shortForm: "Ph.D" },
    { name: "Ph.D in Engineering", shortForm: "Ph.D Engineering" },
    { name: "Ph.D in Science", shortForm: "Ph.D Science" },
    { name: "Ph.D in Management", shortForm: "Ph.D Management" },
    { name: "Ph.D in Humanities", shortForm: "Ph.D Humanities" },
  ],

  "Vocational & Skill-Based": [
    { name: "Industrial Training", shortForm: "ITI" },
    { name: "Polytechnic", shortForm: "Diploma" },
    { name: "Skill Development Programs", shortForm: "Skills" },
    { name: "Professional Certifications", shortForm: "Certifications" },
  ],
};
const CATEGORY_DISPLAY: Record<
  string,
  {
    icon: string;
    color: string;
    count: string;
    tagline: string;
    counselling: string;
  }
> = {
  "Engineering & Technology": {
    icon: "⚙️",
    color: "from-sky-100 to-sky-50",
    count: "2,800+ Colleges",
    tagline: "Engineering, technology and emerging specializations",
    counselling: "Find the right branch, college and admission path",
  },

  "Management & Business": {
    icon: "📈",
    color: "from-indigo-100 to-indigo-50",
    count: "1,400+ Colleges",
    tagline: "Management, business, finance and entrepreneurship",
    counselling: "Compare programs, colleges and career outcomes",
  },

  "Medical & Healthcare": {
    icon: "🩺",
    color: "from-red-100 to-red-50",
    count: "1,800+ Institutes",
    tagline: "Medicine, dentistry, nursing and healthcare programs",
    counselling: "Explore courses, eligibility and admission routes",
  },

  "Computer Applications & IT": {
    icon: "💻",
    color: "from-purple-100 to-purple-50",
    count: "1,200+ Colleges",
    tagline: "Computer applications, AI, data and software",
    counselling: "Choose the right technology path for your goals",
  },

  Science: {
    icon: "🔬",
    color: "from-cyan-100 to-cyan-50",
    count: "3,100+ Colleges",
    tagline: "Pure sciences, life sciences and applied sciences",
    counselling: "Discover courses, colleges and research opportunities",
  },

  "Commerce & Finance": {
    icon: "📊",
    color: "from-amber-100 to-amber-50",
    count: "2,500+ Colleges",
    tagline: "Commerce, accounting, economics and finance",
    counselling: "Plan your degree and professional career path",
  },

  "Law & Legal Studies": {
    icon: "⚖️",
    color: "from-slate-100 to-slate-50",
    count: "900+ Colleges",
    tagline: "Law, legal studies and integrated programs",
    counselling: "Explore colleges, entrance exams and career options",
  },

  "Architecture & Planning": {
    icon: "🏗️",
    color: "from-orange-100 to-orange-50",
    count: "800+ Institutes",
    tagline: "Architecture, planning and built-environment programs",
    counselling: "Find the right course and institute for your interests",
  },

  "Design & Fine Arts": {
    icon: "🎨",
    color: "from-rose-100 to-rose-50",
    count: "1,500+ Colleges",
    tagline: "Design, fashion, fine arts and creative programs",
    counselling: "Explore creative careers and suitable programs",
  },

  "Arts, Humanities & Social Sciences": {
    icon: "📚",
    color: "from-violet-100 to-violet-50",
    count: "2,000+ Colleges",
    tagline: "Humanities, psychology, languages and social sciences",
    counselling: "Discover degrees aligned with your interests and goals",
  },

  Pharmacy: {
    icon: "💊",
    color: "from-emerald-100 to-emerald-50",
    count: "1,000+ Institutes",
    tagline: "Pharmacy education from diploma to doctoral level",
    counselling: "Compare programs, colleges and career pathways",
  },

  "Paramedical & Allied Health": {
    icon: "🧪",
    color: "from-teal-100 to-teal-50",
    count: "1,200+ Institutes",
    tagline: "Laboratory, imaging, therapy and allied health programs",
    counselling: "Explore healthcare careers beyond traditional medicine",
  },

  "Education & Teaching": {
    icon: "👨‍🏫",
    color: "from-blue-100 to-blue-50",
    count: "1,000+ Institutes",
    tagline: "Teaching, education and academic programs",
    counselling: "Find the right path toward a career in education",
  },

  "Hotel Management & Hospitality": {
    icon: "🏨",
    color: "from-yellow-100 to-yellow-50",
    count: "700+ Institutes",
    tagline: "Hospitality, tourism, travel and culinary programs",
    counselling: "Explore careers in hospitality and travel",
  },

  "Doctoral & Research": {
    icon: "🎓",
    color: "from-emerald-100 to-emerald-50",
    count: "500+ Institutes",
    tagline: "Ph.D and advanced research programs across disciplines",
    counselling: "Explore research areas, institutes and academic pathways",
  },

  "Vocational & Skill-Based": {
    icon: "🛠️",
    color: "from-orange-100 to-orange-50",
    count: "1,500+ Institutes",
    tagline: "ITI, diploma, vocational and professional programs",
    counselling: "Find practical pathways into high-demand careers",
  },
};

const DEFAULT_DISPLAY = {
  icon: "📚",
  color: "from-slate-100 to-slate-50",
  count: "",
  tagline: "Explore top degrees and specializations",
};

export const CATEGORY_SEARCH_MAP: Record<string, string> = {
  "Engineering & Technology": "Engineering",
  "Engineering and Technology": "Engineering",
  "Management & Business": "Management",
  "Management and Business": "Management",
  "Management and Business Administration": "Management",
  "Medical & Healthcare": "Medical",
  "Medical and Healthcare": "Medical",
  "Computer Applications & IT": "Computer Applications",
  "IT and Computer Applications": "Computer Applications",
  Science: "Science",
  "Commerce & Finance": "Commerce",
  Commerce: "Commerce",
  "Law & Legal Studies": "Law",
  "Architecture & Planning": "Architecture",
  "Architecture and Planning Course": "Architecture",
  "Design & Fine Arts": "Design",
  "Design and Fine Arts": "Design",
  "Arts, Humanities & Social Sciences": "Arts",
  Pharmacy: "Pharmacy",
  "Paramedical & Allied Health": "Paramedical",
  "Education & Teaching": "Education",
  "Hotel Management & Hospitality": "Hotel Management",
  "Doctoral & Research": "PhD",
  "Doctoral / Research Programs": "PhD",
  "Vocational & Skill-Based": "Vocational",
};

/** Build a clean, SEO-friendly internal URL that searches colleges for a course. */
function courseSearchUrl(
  course: { name: string; shortForm: string | null },
  city: string,
): string {
  // Punctuation (B.Tech, LL.B, D.Pharm, ...) mangles the URL slug, so prefer
  // the full degree name for those; clean abbreviations (MBA, BCA, CSE) map
  // to tidy SEO routes and resolve well on Shiksha.
  const short = course.shortForm?.trim() ?? "";
  const usableShort = short && !/[.&]/.test(short) ? short : "";
  const keyword = usableShort || course.name.trim();
  return toCollegesUrl(normalizeCourseQuery(keyword), city);
}

/** Descriptive, SEO-friendly link title, e.g. "Find B.Tech colleges in Bhopal". */
function courseLinkTitle(courseName: string, city: string): string {
  return city
    ? `Find ${courseName} colleges in ${city}`
    : `Find ${courseName} colleges in India`;
}

/** Read the user's saved preferred city so program links stay city-localized. */
function readPreferredCity(): string {
  try {
    const raw = sessionStorage.getItem("nexteduwise_preferred_location");
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { city?: string };
    return parsed.city?.trim() ?? "";
  } catch {
    return "";
  }
}

/** Hover opens panels only on devices that truly support hover (skip touch). */
const canHover =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(hover: hover)").matches;

export function CourseCategories({
  onExplore,
}: {
  onExplore: (category: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { showAllCourses, handleExpandCourseView } = useCourseCategoryStore();

  const categories = Object.entries(coursesByCategory);
  const searchCity = readPreferredCity();

  const toggleCategory = (category: string) =>
    setExpandedCategory((prev) => (prev === category ? null : category));

  return (
    <section
      id="courses"
      className="mx-auto max-w-7xl px-3.5 sm:px-6 py-8 sm:py-16"
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <p className="eyebrow text-xs font-bold uppercase tracking-wider text-emerald-700">
            Explore by category
          </p>
          <h2 className="section-title text-xl font-extrabold text-ink sm:text-3xl">
            Find the right path for your future
          </h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
            Hover over a category (tap on mobile) to see the programs it
            offers — each program links straight to its college search, so you
            can keep exploring.
          </p>
        </div>
      </div>

      {/* ==== Accordion list: hover (desktop) / tap (mobile) a category to
           reveal its courses. Every category and course link stays in the
           initial DOM — collapsed panels are only visually collapsed via CSS
           grid-template-rows, so crawlers discover all internal links with
           zero interaction. ==== */}
      <div className="mt-6 sm:mt-10 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-900/5">
        <div className="hidden border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,2.6fr)_90px]">
          <span>Category</span>
          <span>Colleges</span>
          <span className="text-right">Programs</span>
        </div>
        <div className="divide-y divide-slate-100">
            {categories.map(
              (
                [category, courses]: [
                  string,
                  { name: string; shortForm: string | null }[],
                ],
                idx: number,
              ) => {
                const display = CATEGORY_DISPLAY[category] ?? DEFAULT_DISPLAY;
                const isOpen = expandedCategory === category;
                const allOpen = showAllCourses[category];
                // SEO: every category and every course link renders in the initial
                // DOM. Collapsed / beyond-the-fold rows are only CSS-hidden
                // (display:none), so crawlers discover all internal links with
                // zero interaction — visibility is purely presentational.
                const beyondFold = !showAll && idx >= 6;

                return (
                  <div
                    key={category}
                    hidden={beyondFold}
                    className={`group
                    }`}
                    onMouseEnter={
                      canHover ? () => setHoveredCategory(category) : undefined
                    }
                    onMouseLeave={
                      canHover
                        ? () =>
                            setHoveredCategory((prev) =>
                              prev === category ? null : prev,
                            )
                        : undefined
                    }
                  >
                    {/* Category header — hover opens on desktop; click/tap
                        pins it open on every device */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isOpen}
                      aria-controls={`${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-courses`}
                      onClick={() => toggleCategory(category)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleCategory(category);
                        }
                      }}
                      className="grid cursor-pointer select-none grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,2.6fr)_90px]"
                    >
                      <div className="flex items-center gap-3">
                       
                        <div className="min-w-0">
                          <span className="block truncate text-sm sm:text-base font-extrabold text-slate-800">
                            {category}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500 sm:hidden">
                            {display.count || `${courses.length} programs`}
                          </span>
                        </div>
                      </div>
                      <div className="hidden flex-wrap items-center gap-1.5 md:flex">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                          {display.count || `${courses.length} programs`}
                        </span>
                        {courses
                          .slice(0, 3)
                          .map((c) => c.shortForm)
                          .filter((v): v is string => Boolean(v))
                          .map((sf) => (
                            <span
                              key={sf}
                              className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500"
                            >
                              {sf}
                            </span>
                          ))}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`hidden items-center gap-1 text-xs font-extrabold transition-colors md:inline-flex ${
                            isOpen || hoveredCategory === category
                              ? "text-emerald-700"
                              : "text-slate-600"
                          }`}
                        >
                          {isOpen || hoveredCategory === category
                            ? "Hide programs"
                            : "View programs"}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 transition-transform duration-300 ease-out ${
                            isOpen || hoveredCategory === category
                              ? "rotate-180 text-emerald-600"
                              : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Courses panel — always in the DOM (SEO). Collapsed is
                        just grid-template-rows: 0fr; hover (desktop) and/or
                        click animates it to 1fr. No conditional rendering. */}
                    <div
                      id={`${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-courses`}
                      className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out [@media(hover:hover)]:group-hover:grid-rows-[1fr] ${
                        isOpen ? "grid-rows-[1fr]" : ""
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div
                          className={`border-t border-slate-100 bg-slate-50/70 p-3 transition-opacity duration-300 sm:p-5 ${
                            isOpen || hoveredCategory === category
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                            Programs offered under {category}
                          </p>
                          <button
                            onClick={() => onExplore(category)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 transition hover:bg-emerald-50 sm:text-xs"
                          >
                            Explore all colleges
                            <ArrowUpRight size={13} />
                          </button>
                        </div>

                        {/* Desktop: real course table with internal links */}
                        <div className="mt-3 hidden overflow-hidden rounded-xl border border-slate-100 bg-white sm:block">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-2.5">Program</th>
                                <th className="px-4 py-2.5">Abbreviation</th>
                                <th className="px-4 py-2.5 text-right">
                                  Search Colleges
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {courses.map((course, i) => (
                                <tr
                                  key={course.name}
                                  hidden={!allOpen && i >= 4}
                                  className="transition hover:bg-emerald-50/40"
                                >
                                  <td className="px-4 py-2.5 text-xs font-bold text-slate-800 sm:text-sm">
                                    <Link
                                      to={courseSearchUrl(course, searchCity)}
                                      className="transition hover:text-emerald-700"
                                      title={courseLinkTitle(
                                        course.name,
                                        searchCity,
                                      )}
                                    >
                                      {course.name}
                                    </Link>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs font-semibold text-slate-500 sm:text-sm">
                                    {course.shortForm || "—"}
                                  </td>
                                  <td className="px-4 py-2.5 text-right">
                                    <Link
                                      to={courseSearchUrl(course, searchCity)}
                                      aria-label={courseLinkTitle(
                                        course.name,
                                        searchCity,
                                      )}
                                      className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 transition hover:text-emerald-900"
                                    >
                                      Find colleges
                                      <ArrowUpRight size={13} />
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile: stacked link rows */}
                        <ul className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-white sm:hidden">
                          {courses.map((course, i) => (
                            <li key={course.name} hidden={!allOpen && i >= 4}>
                              <Link
                                to={courseSearchUrl(course, searchCity)}
                                aria-label={courseLinkTitle(
                                  course.name,
                                  searchCity,
                                )}
                                className="flex items-center justify-between gap-2 px-3.5 py-3 transition hover:bg-emerald-50/40"
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-[13px] font-bold text-slate-800">
                                    {course.name}
                                  </span>
                                  {course.shortForm && (
                                    <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">
                                      {course.shortForm}
                                    </span>
                                  )}
                                </span>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-emerald-700">
                                  Find <ArrowUpRight size={12} />
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>

                        {courses.length > 4 && (
                          <button
                            onClick={() => handleExpandCourseView(category)}
                            className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:text-emerald-900"
                          >
                            {allOpen
                              ? "Show less"
                              : `+ ${courses.length - 4} more programs`}
                            {allOpen ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
        </div>
      </div>

      {categories.length > 6 && (
        <div className="mt-8 flex justify-center sm:mt-10">
          <button
            onClick={() => setShowAll((prev: boolean) => !prev)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 sm:px-6 sm:py-3 sm:text-sm"
          >
            {showAll ? "Show less" : "View all categories"}
            {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      )}
    </section>
  );
}
