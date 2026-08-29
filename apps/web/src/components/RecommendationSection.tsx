import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, MapPin, BookOpen, ArrowRight, Star, Building2, ExternalLink, ShieldCheck, IndianRupee } from "lucide-react";
import { useHomeStore } from "../stores/homeStore";
import { toCollegeSlug, toCollegesUrl } from "./seoUtils";

interface TabularRecommendationProps {
  title?: string;
  subtitle?: string;
  currentCourse?: string;
  currentCity?: string;
  course?: string;
  city?: string;
  state?: string;
  colleges?: unknown;
  maxItems?: number;
  excludeCollegeName?: string;
}

interface CityRow {
  name: string;
  state: string;
  popularStreams: string;
  avgFees: string;
  slug: string;
}

interface CollegeRow {
  name: string;
  city: string;
  state: string;
  type: string;
  rating: string;
  slug: string;
}

interface CourseRow {
  name: string;
  category: string;
  duration: string;
  branches: string;
  slug: string;
}

const CITY_DATA: CityRow[] = [
  { name: "Bhopal", state: "Madhya Pradesh", popularStreams: "B.Tech, MBA, Medical", avgFees: "₹45k - ₹1.8L", slug: "bhopal" },
  { name: "Pune", state: "Maharashtra", popularStreams: "Engineering, IT, Management", avgFees: "₹80k - ₹2.5L", slug: "pune" },
  { name: "Indore", state: "Madhya Pradesh", popularStreams: "B.Tech, BBA, Commerce", avgFees: "₹50k - ₹2.0L", slug: "indore" },
  { name: "Bangalore", state: "Karnataka", popularStreams: "Computer Science, AI, Biotech", avgFees: "₹1.2L - ₹3.5L", slug: "bangalore" },
  { name: "Delhi NCR", state: "Delhi", popularStreams: "Engineering, Law, Management", avgFees: "₹90k - ₹3.0L", slug: "delhi" },
  { name: "Hyderabad", state: "Telangana", popularStreams: "IT, Data Science, Pharma", avgFees: "₹75k - ₹2.8L", slug: "hyderabad" },
];

const COLLEGE_DATA: CollegeRow[] = [
  { name: "COEP Technological University", city: "Pune", state: "Maharashtra", type: "Government", rating: "9.2 / 10", slug: "coep-technological-university-pune" },
  { name: "LNCT Group of Institutes", city: "Bhopal", state: "Madhya Pradesh", type: "Private Approved", rating: "8.8 / 10", slug: "lnct-group-of-institutes-bhopal" },
  { name: "D.Y. Patil International University", city: "Pune", state: "Maharashtra", type: "Private University", rating: "8.6 / 10", slug: "dy-patil-international-university-dypiu-pune" },
  { name: "SGSITS Indore", city: "Indore", state: "Madhya Pradesh", type: "Govt-Aided", rating: "9.0 / 10", slug: "sgsits-indore" },
  { name: "RV College of Engineering", city: "Bangalore", state: "Karnataka", type: "Autonomous", rating: "9.3 / 10", slug: "rv-college-of-engineering-bangalore" },
];

const COURSE_DATA: CourseRow[] = [
  { name: "Engineering (B.Tech)", category: "UG Technical", duration: "4 Years", branches: "CSE, AI/ML, ECE, Mechanical, Civil", slug: "engineering" },
  { name: "Management (MBA / PGDM)", category: "PG Professional", duration: "2 Years", branches: "Finance, Marketing, HR, Business Analytics", slug: "mba" },
  { name: "Business Administration (BBA)", category: "UG Management", duration: "3 Years", branches: "General, Digital Marketing, International Business", slug: "bba" },
  { name: "Computer Applications (BCA)", category: "UG IT", duration: "3 Years", branches: "Web Dev, Cloud Computing, Cybersecurity", slug: "bca" },
  { name: "Medical (MBBS / BDS)", category: "UG Healthcare", duration: "5.5 Years", branches: "General Medicine, Dental, Surgery", slug: "medical" },
];

export function RecommendationSection({
  title = "Explore Top Educational Hubs & Programs",
  currentCourse,
  currentCity,
  course,
  city,
}: TabularRecommendationProps) {
  const [activeTab, setActiveTab] = useState<"city" | "colleges" | "course">("city");
  const navigate = useNavigate();
  const setFilter = useHomeStore((state) => state.setFilter);

  const activeCourse = currentCourse || course || "Engineering";
  const activeCity = currentCity || city || "";

  const handleCitySelect = (cityName: string, slug: string) => {
    setFilter("city", cityName);
    try {
      sessionStorage.setItem(
        "nexteduwise_user_activity",
        JSON.stringify({
          course: currentCourse,
          city: cityName,
          searchedAt: new Date().toISOString(),
        })
      );
    } catch {}
    navigate(`/colleges/${slug}`);
  };

  const handleCourseSelect = (courseName: string, slug: string) => {
    setFilter("course", courseName);
    try {
      sessionStorage.setItem(
        "nexteduwise_user_activity",
        JSON.stringify({
          course: courseName,
          city: currentCity,
          searchedAt: new Date().toISOString(),
        })
      );
    } catch {}
    navigate(`/courses/${slug}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-3.5 sm:px-6 ">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          {title}
        </h2>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("city")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === "city"
                ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <MapPin size={16} />
            By City
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("colleges")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === "colleges"
                ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <GraduationCap size={16} />
            By Colleges
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("course")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === "course"
                ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <BookOpen size={16} />
            By Course
          </button>
        </div>
      </div>

      {/* Tab Content Tables */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab 1: BY CITY TABLE */}
        {activeTab === "city" && (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">City & Location</th>
                    <th className="py-4 px-6">State</th>
                    <th className="py-4 px-6">Popular Streams Offered</th>
                    <th className="py-4 px-6">Est. Annual Fee</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {CITY_DATA.map((row) => (
                    <tr key={row.slug} className="hover:bg-emerald-50/40 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={16} className="text-emerald-600 shrink-0" />
                        <span>{row.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{row.state}</td>
                      <td className="py-4 px-6 text-xs text-slate-600">{row.popularStreams}</td>
                      <td className="py-4 px-6 font-semibold text-emerald-800">{row.avgFees}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleCitySelect(row.name, row.slug)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all shadow-sm"
                        >
                          View Colleges
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {CITY_DATA.map((row) => (
                <div key={row.slug} className="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
                      <MapPin size={16} className="text-emerald-600" />
                      <span>{row.name}</span>
                      <span className="text-xs font-normal text-slate-500">({row.state})</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {row.avgFees}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Top Streams:</span> {row.popularStreams}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCitySelect(row.name, row.slug)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    Browse Colleges in {row.name}
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: BY COLLEGES TABLE */}
        {activeTab === "colleges" && (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">College Name</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Institution Type</th>
                    <th className="py-4 px-6">Rating / Score</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {COLLEGE_DATA.map((row) => (
                    <tr key={row.slug} className="hover:bg-emerald-50/40 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap size={16} className="text-emerald-600 shrink-0" />
                        <span>{row.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{row.city}, {row.state}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                          {row.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-amber-600 flex items-center gap-1">
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                        {row.rating}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/colleges/detail/${row.slug}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all shadow-sm"
                        >
                          View Details
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {COLLEGE_DATA.map((row) => (
                <div key={row.slug} className="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-extrabold text-slate-900 text-sm leading-snug">
                      {row.name}
                    </div>
                    <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      {row.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{row.city}, {row.state}</span>
                    <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {row.type}
                    </span>
                  </div>
                  <Link
                    to={`/colleges/detail/${row.slug}`}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    View College Overview
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: BY COURSE TABLE */}
        {activeTab === "course" && (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">Course Name</th>
                    <th className="py-4 px-6">Degree Level</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Popular Specializations</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {COURSE_DATA.map((row) => (
                    <tr key={row.slug} className="hover:bg-emerald-50/40 transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-600 shrink-0" />
                        <span>{row.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">{row.category}</td>
                      <td className="py-4 px-6 text-slate-600 font-semibold">{row.duration}</td>
                      <td className="py-4 px-6 text-xs text-slate-600">{row.branches}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleCourseSelect(row.name, row.slug)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all shadow-sm"
                        >
                          Explore Course
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {COURSE_DATA.map((row) => (
                <div key={row.slug} className="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
                      <BookOpen size={16} className="text-emerald-600" />
                      <span>{row.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {row.duration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Specializations:</span> {row.branches}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCourseSelect(row.name, row.slug)}
                    className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    View Colleges for {row.name}
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Backward compatibility alias for any existing HomepageRecommendations usage
export const HomepageRecommendations = RecommendationSection;
