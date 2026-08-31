import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Building2, GraduationCap, MapPin, Award, CheckCircle2, BookOpen, DollarSign, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useHomeStore } from "../stores/homeStore";
import { useApiStore } from "../stores/apiStore";
import { CollegeListItem } from "../types";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SeoHead } from "../components/SeoHead";
import {
  generateFAQSchema,
  generateRelatedLinks,
  normalizeCourseQuery,
  slugify,
  toCollegeSlug,
  toCollegesUrl,
} from "../components/seoUtils";

interface CityCourseLandingPageProps {
  categoryOverride?: string;
}

export const CityCourseLandingPage: React.FC<CityCourseLandingPageProps> = ({ categoryOverride }) => {
  const { categorySlug, courseSlug, citySlug } = useParams<{
    categorySlug?: string;
    courseSlug?: string;
    citySlug?: string;
  }>();

  const [colleges, setColleges] = useState<CollegeListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const request = useApiStore((state) => state.request);

  // Unify parameters
  const rawCategory = categoryOverride || categorySlug || courseSlug || "Engineering";
  const rawCity = citySlug || "bhopal";

  // Formatted names
  const courseName = useMemo(() => {
    const cleaned = rawCategory.replace(/-colleges$/i, "").replace(/-/g, " ");
    return normalizeCourseQuery(cleaned);
  }, [rawCategory]);

  const cityName = useMemo(() => {
    return rawCity
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [rawCity]);

  // Page H1 and Meta Titles
  const pageTitle = `Best ${courseName} Colleges in ${cityName}`;
  const seoTitle = `Top ${courseName} Colleges in ${cityName} (2026): Fees, Admission & Placements`;
  const seoDescription = `Explore the list of top ${courseName} colleges in ${cityName}. Compare course fees, admission eligibility, cutoff marks, facilities, and placement packages.`;
  const canonicalPath = toCollegesUrl(courseName, cityName);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [rawCategory, rawCity]);

  useEffect(() => {
    let isMounted = true;
    const fetchLandingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const cityQuery = `&city=${encodeURIComponent(cityName)}`;
        let fetchedList: CollegeListItem[] = [];

        // 1. Try Shiksha category/autocomplete search for the keyword + city
        const searchResponse = await request(
          `/colleges/search?query=${encodeURIComponent(courseName)}${cityQuery}`,
        );

        if (searchResponse.ok) {
          const result = await searchResponse.json();

          if (Array.isArray(result)) {
            fetchedList = result;
          } else if (result && typeof result === "object" && "url" in result) {
            // Category hit -> fetch category list
            const categoryUrl = result.url || "";
            const listResponse = await request(
              `/colleges?url=${encodeURIComponent(categoryUrl)}${cityQuery}`,
            );
            if (listResponse.ok) {
              const listData = await listResponse.json();
              if (Array.isArray(listData)) fetchedList = listData;
            }
          }
        }

        // 2. Fallback to suggestions API mapped to CollegeListItem[] if empty
        if (fetchedList.length === 0) {
          const sugRes = await request(
            `/colleges/suggestions?city=${encodeURIComponent(cityName)}&course=${encodeURIComponent(courseName)}`,
          );
          if (sugRes.ok) {
            const sugData = await sugRes.json();
            const suggestions = sugData.suggestions || [];
            if (Array.isArray(suggestions) && suggestions.length > 0) {
              fetchedList = suggestions.map((s: { id: string; name: string; logo: string | null; slug: string; seriesId: number }) => ({
                instituteId: null,
                name: s.name,
                logo: s.logo,
                headerImage: null,
                minFees: null,
                maxFees: null,
                slug: s.slug,
                seriesId: s.seriesId,
                city: cityName,
              }));
            }
          }
        }

        // 3. Final fallback: general city suggestions
        if (fetchedList.length === 0) {
          const citySugRes = await request(
            `/colleges/suggestions?city=${encodeURIComponent(cityName)}`,
          );
          if (citySugRes.ok) {
            const sugData = await citySugRes.json();
            const suggestions = sugData.suggestions || [];
            if (Array.isArray(suggestions)) {
              fetchedList = suggestions.map((s: { id: string; name: string; logo: string | null; slug: string; seriesId: number }) => ({
                instituteId: null,
                name: s.name,
                logo: s.logo,
                headerImage: null,
                minFees: null,
                maxFees: null,
                slug: s.slug,
                seriesId: s.seriesId,
                city: cityName,
              }));
            }
          }
        }

        if (isMounted) {
          setColleges(fetchedList);
        }
      } catch (err) {
        if (isMounted) setError("Failed to connect to college directory service.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLandingData();
    return () => {
      isMounted = false;
    };
  }, [courseName, cityName, request]);

  // Programmatic FAQs for this city + course landing page
  const faqs = useMemo(() => {
    return [
      {
        question: `Which are the best ${courseName} colleges in ${cityName}?`,
        answer: `Top ${courseName} colleges in ${cityName} include both government institutes and reputed private universities offering accredited degree programs. Check out our curated table above for full details.`,
      },
      {
        question: `What is the average fee for ${courseName} courses in ${cityName}?`,
        answer: `Fees for ${courseName} in ${cityName} typically range from ₹40,000 per year in government institutions to ₹2,50,000+ per year in private universities depending on accreditation and campus infrastructure.`,
      },
      {
        question: `What entrance exams are accepted for ${courseName} admission in ${cityName}?`,
        answer: `Most ${courseName} colleges in ${cityName} accept national entrance exams (such as JEE Main, CUET, CAT, MAT) alongside state CET counseling scores and merit-based direct admission.`,
      },
      {
        question: `Are there good placement opportunities for ${courseName} graduates in ${cityName}?`,
        answer: `Yes, ${cityName} hosts active placement drives with recruiting partners across technology, management, healthcare, and industrial sectors offering average salary packages from ₹3.5 LPA to ₹12+ LPA.`,
      },
    ];
  }, [courseName, cityName]);

  const faqSchema = useMemo(() => generateFAQSchema(faqs), [faqs]);

  // Related Cities for internal linking
  const relatedCities = useMemo(() => {
    const popular = ["Bhopal", "Indore", "Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Jaipur"];
    return popular
      .filter((c) => c.toLowerCase() !== cityName.toLowerCase())
      .slice(0, 6)
      .map((c) => ({
        label: `Top ${courseName} Colleges in ${c}`,
        href: toCollegesUrl(courseName, c),
      }));
  }, [courseName, cityName]);

  // Related Courses in this city
  const relatedCoursesInCity = useMemo(() => {
    const courses = ["Engineering", "MBA", "BBA", "Medical", "Law", "Commerce", "Computer Applications"];
    return courses
      .filter((c) => c.toLowerCase() !== courseName.toLowerCase())
      .slice(0, 4)
      .map((c) => ({
        label: `Top ${c} Colleges in ${cityName}`,
        href: toCollegesUrl(c, cityName),
      }));
  }, [courseName, cityName]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalPath}
        jsonLd={[
          faqSchema,
          {
            "@context": "https://schema.org",
            "@type": "ItemPage",
            "name": pageTitle,
            "description": seoDescription,
            "url": `https://nexteduwise.com${canonicalPath}`,
          },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: `${courseName} Colleges`, href: `/courses/${slugify(courseName)}` },
            { label: cityName },
          ]}
        />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-900 to-emerald-900 text-white rounded-2xl p-6 md:p-10 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Verified College Directory 2026
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              {pageTitle}
            </h1>

            <p className="text-emerald-100 text-base md:text-lg leading-relaxed mb-6">
              Compare accredited {courseName} institutes in {cityName}. Detailed breakdowns of course fees, admission criteria, cutoffs, campus facilities, and placement statistics to help you choose the best college.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-emerald-800/60">
              <div>
                <span className="text-xs text-emerald-300 uppercase tracking-wider block">Total Colleges</span>
                <span className="text-2xl font-bold text-white">{colleges.length > 0 ? colleges.length : "15+"}</span>
              </div>
              <div>
                <span className="text-xs text-emerald-300 uppercase tracking-wider block">Avg Fee</span>
                <span className="text-2xl font-bold text-white">₹45k - ₹2.2L</span>
              </div>
              <div>
                <span className="text-xs text-emerald-300 uppercase tracking-wider block">Exams</span>
                <span className="text-2xl font-bold text-white">JEE / CAT / CET</span>
              </div>
              <div>
                <span className="text-xs text-emerald-300 uppercase tracking-wider block">Counseling</span>
                <span className="text-2xl font-bold text-emerald-400">100% Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content & Table Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Colleges Listing Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    List of Top {courseName} Colleges in {cityName}
                  </h2>
                  <p className="text-sm text-slate-500">Showing verified institutes with approved courses</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                  {colleges.length} Colleges Found
                </span>
              </div>

              {loading ? (
                <div className="space-y-4 py-8">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-24 bg-slate-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : colleges.length > 0 ? (
                <div className="space-y-4">
                  {colleges.map((college, idx) => {
                    const collegeSlug = toCollegeSlug(college.name, college.city);
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all bg-white group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {college.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
                              <Link to={`/colleges/detail/${collegeSlug}`} state={{ college }}>
                                {college.name}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {college.city || cityName}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Approved
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/colleges/detail/${collegeSlug}`}
                          state={{ college }}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-all w-full sm:w-auto"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700">Explore Institutions in {cityName}</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Get in touch with our counselors for personalized recommendations on top {courseName} programs in {cityName}.
                  </p>
                  <Link
                    to="/colleges"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Browse All Colleges
                  </Link>
                </div>
              )}
            </div>

            {/* Overview & Admission Guide Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                {courseName} Education in {cityName}: Overview & Guide
              </h2>

              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                Selecting the right {courseName} institution in {cityName} is a critical decision that lays the foundation for your academic and professional future. {cityName} offers a vibrant academic hub with a mix of top government-funded institutes and prestigious private universities providing industry-aligned curriculum and modern campus amenities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-base mb-2">
                    <GraduationCap className="w-5 h-5" />
                    Government Colleges
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    State and central government institutes in {cityName} feature subsidized fee structures, competitive entrance merit cutoffs, and highly qualified academic faculty.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-base mb-2">
                    <Building2 className="w-5 h-5" />
                    Private Universities
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Private institutions offer state-of-the-art laboratory infrastructure, specialized branch options, corporate mentorship programs, and strong career placement support.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
                Frequently Asked Questions ({courseName} in {cityName})
              </div>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Free Counseling Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Need Admission Counseling?</h3>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Get expert guidance on eligibility, fee structures, and application procedures for top {courseName} colleges in {cityName}.
              </p>
              <Link
                to="/colleges"
                className="block text-center py-2.5 px-4 bg-white text-emerald-600 font-bold rounded-xl text-sm hover:bg-emerald-50 transition-colors"
              >
                Connect with Counselor
              </Link>
            </div>

            {/* Related Cities Links */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-3 pb-2 border-b border-slate-100">
                {courseName} Colleges by City
              </h3>
              <ul className="space-y-2 text-xs">
                {relatedCities.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.href}
                      className="text-slate-600 hover:text-emerald-600 font-medium flex items-center justify-between py-1 border-b border-slate-50"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Courses Links */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base mb-3 pb-2 border-b border-slate-100">
                Other Popular Courses in {cityName}
              </h3>
              <ul className="space-y-2 text-xs">
                {relatedCoursesInCity.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.href}
                      className="text-slate-600 hover:text-emerald-600 font-medium flex items-center justify-between py-1 border-b border-slate-50"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
