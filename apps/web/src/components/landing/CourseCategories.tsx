import React, { useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { useCourseCategoryStore } from "../../stores/courseCategoryStore";
 
const coursesByCategory: Record<
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

  "Science": [
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

  "Pharmacy": [
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
    text: string;
    count: string;
    tagline: string;
    counselling: string;
  }
> = {
  "Engineering & Technology": {
    icon: "⚙️",
    color: "from-sky-100 to-sky-50",
    text: "text-sky-800",
    count: "2,800+ Colleges",
    tagline: "Engineering, technology and emerging specializations",
    counselling: "Find the right branch, college and admission path",
  },

  "Management & Business": {
    icon: "📈",
    color: "from-indigo-100 to-indigo-50",
    text: "text-indigo-800",
    count: "1,400+ Colleges",
    tagline: "Management, business, finance and entrepreneurship",
    counselling: "Compare programs, colleges and career outcomes",
  },

  "Medical & Healthcare": {
    icon: "🩺",
    color: "from-red-100 to-red-50",
    text: "text-red-800",
    count: "1,800+ Institutes",
    tagline: "Medicine, dentistry, nursing and healthcare programs",
    counselling: "Explore courses, eligibility and admission routes",
  },

  "Computer Applications & IT": {
    icon: "💻",
    color: "from-purple-100 to-purple-50",
    text: "text-purple-800",
    count: "1,200+ Colleges",
    tagline: "Computer applications, AI, data and software",
    counselling: "Choose the right technology path for your goals",
  },

  "Science": {
    icon: "🔬",
    color: "from-cyan-100 to-cyan-50",
    text: "text-cyan-800",
    count: "3,100+ Colleges",
    tagline: "Pure sciences, life sciences and applied sciences",
    counselling: "Discover courses, colleges and research opportunities",
  },

  "Commerce & Finance": {
    icon: "📊",
    color: "from-amber-100 to-amber-50",
    text: "text-amber-800",
    count: "2,500+ Colleges",
    tagline: "Commerce, accounting, economics and finance",
    counselling: "Plan your degree and professional career path",
  },

  "Law & Legal Studies": {
    icon: "⚖️",
    color: "from-slate-100 to-slate-50",
    text: "text-slate-800",
    count: "900+ Colleges",
    tagline: "Law, legal studies and integrated programs",
    counselling: "Explore colleges, entrance exams and career options",
  },

  "Architecture & Planning": {
    icon: "🏗️",
    color: "from-orange-100 to-orange-50",
    text: "text-orange-800",
    count: "800+ Institutes",
    tagline: "Architecture, planning and built-environment programs",
    counselling: "Find the right course and institute for your interests",
  },

  "Design & Fine Arts": {
    icon: "🎨",
    color: "from-rose-100 to-rose-50",
    text: "text-rose-800",
    count: "1,500+ Colleges",
    tagline: "Design, fashion, fine arts and creative programs",
    counselling: "Explore creative careers and suitable programs",
  },

  "Arts, Humanities & Social Sciences": {
    icon: "📚",
    color: "from-violet-100 to-violet-50",
    text: "text-violet-800",
    count: "2,000+ Colleges",
    tagline: "Humanities, psychology, languages and social sciences",
    counselling: "Discover degrees aligned with your interests and goals",
  },

  "Pharmacy": {
    icon: "💊",
    color: "from-emerald-100 to-emerald-50",
    text: "text-emerald-800",
    count: "1,000+ Institutes",
    tagline: "Pharmacy education from diploma to doctoral level",
    counselling: "Compare programs, colleges and career pathways",
  },

  "Paramedical & Allied Health": {
    icon: "🧪",
    color: "from-teal-100 to-teal-50",
    text: "text-teal-800",
    count: "1,200+ Institutes",
    tagline: "Laboratory, imaging, therapy and allied health programs",
    counselling: "Explore healthcare careers beyond traditional medicine",
  },

  "Education & Teaching": {
    icon: "👨‍🏫",
    color: "from-blue-100 to-blue-50",
    text: "text-blue-800",
    count: "1,000+ Institutes",
    tagline: "Teaching, education and academic programs",
    counselling: "Find the right path toward a career in education",
  },

  "Hotel Management & Hospitality": {
    icon: "🏨",
    color: "from-yellow-100 to-yellow-50",
    text: "text-yellow-800",
    count: "700+ Institutes",
    tagline: "Hospitality, tourism, travel and culinary programs",
    counselling: "Explore careers in hospitality and travel",
  },

  "Doctoral & Research": {
    icon: "🎓",
    color: "from-emerald-100 to-emerald-50",
    text: "text-emerald-800",
    count: "500+ Institutes",
    tagline: "Ph.D and advanced research programs across disciplines",
    counselling: "Explore research areas, institutes and academic pathways",
  },

  "Vocational & Skill-Based": {
    icon: "🛠️",
    color: "from-orange-100 to-orange-50",
    text: "text-orange-800",
    count: "1,500+ Institutes",
    tagline: "ITI, diploma, vocational and professional programs",
    counselling: "Find practical pathways into high-demand careers",
  },
};

const DEFAULT_DISPLAY = {
  icon: "📚",
  color: "from-slate-100 to-slate-50",
  text: "text-slate-800",
  count: "",
  tagline: "Explore top degrees and specializations",
};

 
export const CATEGORY_SEARCH_MAP: Record<string, string> = {
  "Engineering & Technology": "Engineering",
  "Management & Business": "Management",
  "Medical & Healthcare": "Medical",
  "Computer Applications & IT": "Computer Applications",
  "Science": "Science",
  "Commerce & Finance": "Commerce",
  "Law & Legal Studies": "Law",
  "Architecture & Planning": "Architecture",
  "Design & Fine Arts": "Design",
  "Arts, Humanities & Social Sciences": "Arts",
  "Pharmacy": "Pharmacy",
  "Paramedical & Allied Health": "Paramedical",
  "Education & Teaching": "Education",
  "Hotel Management & Hospitality": "Hotel Management",
  "Doctoral & Research": "PhD",
  "Vocational & Skill-Based": "Vocational",
};

export function CourseCategories({
  onSelect,
  onExplore,
}: {
  onSelect: (course: string) => void;
  onExplore: (course: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const { showAllCourses, handleExpandCourseView } =
    useCourseCategoryStore();

  const categories = Object.entries(coursesByCategory);
  const visibleCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <section id="courses" className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Explore by category</p>

          <h2 className="section-title">
            Find the right path for your future
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Explore courses, colleges and career paths across major fields of
            study. Compare your options and find the education path that fits
            your goals.
          </p>
        </div>
      </div>
      {/* this section shows the categorywise courses */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleCategories.map(([category, courses]) => {
          const display = CATEGORY_DISPLAY[category] ?? DEFAULT_DISPLAY;
          const expanded = showAllCourses[category];
          const visibleCourses = expanded ? courses : courses.slice(0, 4);
          return (
            <article
              key={category}
               
              className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br ${display.color} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{display.icon}</span>

                {display.count && (
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-700">
                    {display.count}
                  </span>
                )}
              </div>

              <h3 className={`mt-5 text-xl font-extrabold ${display.text}`}>
                {category}
              </h3>

              <p className="mt-2 min-h-[42px] text-sm leading-6 text-slate-600">
                {display.tagline}
              </p>

              <div className="mt-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Popular programs
                </p>

                <div className="space-y-2">
                  {visibleCourses.map((course, idx) => (
                    <button
                      key={`${course.name}-${idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(course.name);
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-white/70 bg-white/60 px-3 py-2 text-left transition hover:bg-white"
                    >
                      <span className="text-xs font-semibold leading-5 text-slate-700">
                        {course.name}
                      </span>

                      {course.shortForm && (
                        <span className="ml-3 shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-600">
                          {course.shortForm}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* MORE PROGRAMS → EXPLORE OPTIONS */}
                {courses.length > 4 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpandCourseView(category);
                    }}
                    className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    {expanded
                      ? "Show less"
                      : `+ ${courses.length - 4} more programs`}
                  </button>
                )}
              </div>

              <div className="mt-5 border-t border-white/60 pt-4">
                <p className="text-xs leading-5 text-slate-600">
                  {display.counselling}
                </p>

                {/* EXPLORE OPTIONS → EXPLORE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplore(category);
                  }}
                  className="mt-3 flex w-full items-center justify-between"
                >
                  <span className="text-sm font-extrabold text-emerald-700">
                    Explore Colleges
                  </span>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 transition group-hover:bg-emerald-600 group-hover:text-white">
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {categories.length > 6 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {showAll ? "Show less" : "View all categories"}

            {showAll ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
        </div>
      )}
    </section>
  );
}