import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Award, Sparkles, Filter, CheckCircle2, Search } from "lucide-react";
import { SeoHead } from "../components/SeoHead";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PILLAR_BLOGS, PillarBlog } from "../data/pillarBlogs";

export interface GuideArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  updatedAt: string;
}

// Backward compatible export for any existing imports
export const GUIDES_DATA: GuideArticle[] = PILLAR_BLOGS.map((b) => ({
  slug: b.slug,
  title: b.title,
  description: b.summary,
  category: b.category,
  readTime: b.readTime,
  updatedAt: b.updatedAt,
}));

export const GuidesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    return ["All", "Admission Guides", "College Discovery", "College Strategy", "Branch Selection"];
  }, []);

  const filteredBlogs = useMemo(() => {
    if (selectedCategory === "All") return PILLAR_BLOGS;
    return PILLAR_BLOGS.filter((blog) => blog.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#fbfcfa] text-slate-800">
      <SeoHead
        title="College & B.Tech Admission Guides 2026 | NextEduWise Pillar Articles"
        description="Comprehensive 2026 admission guides, engineering college rankings, branch comparisons, fee breakdowns, and ROI evaluation strategies."
        canonicalUrl="/guides"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "College & B.Tech Admission Guides 2026",
          "description": "High priority SEO pillar guides on B.Tech admission, engineering rankings, college selection, and course branches.",
          "url": "https://nexteduwise.com/guides",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={[{ label: "Pillar Guides & Resource Hub" }]} />

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-8 md:p-12 mb-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              SEO Priority Pillar Articles 2026
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              Higher Education & Admission Strategy Hub
            </h1>
            <p className="text-emerald-100 text-base md:text-lg leading-relaxed">
              In-depth research, eligibility guides, entrance cutoffs, and decision frameworks curated by NextEduWise academic counselors.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-2 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter size={14} /> Filter by Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Top Featured #1 Article Card */}
        {selectedCategory === "All" && PILLAR_BLOGS.length > 0 && (
          <div className="mb-10 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 p-6 md:p-8 shadow-md">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 mb-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white text-[11px] font-black">
                #1
              </span>
              <span>Highest SEO Priority • Immediate Opportunity</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 hover:text-emerald-700 transition">
              <Link to={`/guides/${PILLAR_BLOGS[0].slug}`}>
                {PILLAR_BLOGS[0].title}
              </Link>
            </h2>

            <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-600 max-w-4xl">
              {PILLAR_BLOGS[0].summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-emerald-100 pt-5">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-emerald-800 font-bold">
                  {PILLAR_BLOGS[0].category}
                </span>
                <span>{PILLAR_BLOGS[0].readTime}</span>
                <span>Updated {PILLAR_BLOGS[0].updatedAt}</span>
              </div>

              <Link
                to={`/guides/${PILLAR_BLOGS[0].slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                Read Comprehensive Guide
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filteredBlogs.map((article) => (
            <article
              key={article.slug}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold rounded-lg border border-emerald-100">
                    <Award size={13} className="text-emerald-600" />
                    Rank #{article.seoRank}
                  </span>
                  <span className="font-medium text-slate-400">{article.readTime}</span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors mb-3 leading-snug">
                  <Link to={`/guides/${article.slug}`}>{article.title}</Link>
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-3">
                  {article.summary}
                </p>

                {/* Key Takeaway Snippet */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 mb-4 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{article.keyTakeaways[0]}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Updated {article.updatedAt}</span>
                <Link
                  to={`/guides/${article.slug}`}
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-700 group-hover:translate-x-1 transition-transform"
                >
                  Read Pillar Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
