import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, ArrowLeft, Building2, GraduationCap, ArrowRight, Award, HelpCircle, Share2, Compass } from "lucide-react";
import { SeoHead } from "../components/SeoHead";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { PILLAR_BLOGS, PillarBlog } from "../data/pillarBlogs";
import { generateFAQSchema } from "../components/seoUtils";

export const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Always scroll to top when mounting guide detail page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  const pillarBlog = PILLAR_BLOGS.find((g) => g.slug === slug);

  // Fallback if slug isn't found
  const blog: PillarBlog = pillarBlog || PILLAR_BLOGS[0];

  const faqSchema = generateFAQSchema(blog.faqs || []);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": blog.metaDescription || blog.summary,
    "author": {
      "@type": "Organization",
      "name": blog.author || "NextEduWise Academic Council",
    },
    "publisher": {
      "@type": "Organization",
      "name": "NextEduWise",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nexteduwise.com/og-default.jpg",
      },
    },
    "mainEntityOfPage": `https://nexteduwise.com/guides/${blog.slug}`,
  };

  return (
    <div className="min-h-screen bg-[#fbfcfa] text-slate-800">
      <SeoHead
        title={blog.metaTitle || `${blog.title} | NextEduWise`}
        description={blog.metaDescription || blog.summary}
        canonicalUrl={`/guides/${blog.slug}`}
        jsonLd={[articleSchema, faqSchema]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={[
            { label: "Guides", href: "/guides" },
            { label: blog.category, href: "/guides" },
            { label: blog.title.slice(0, 30) + "..." },
          ]}
        />

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content */}
          <article className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 space-y-8">
            {/* Header Header */}
            <div className="space-y-4 border-b border-slate-100 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold rounded-lg border border-emerald-100 text-xs">
                  <Award size={13} className="text-emerald-600" />
                  SEO Priority Rank #{blog.seoRank}
                </span>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs">
                  {blog.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">{blog.readTime}</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                {blog.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span>By {blog.author}</span>
                <span>•</span>
                <span>Updated {blog.updatedAt}</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-slate-800 text-sm md:text-base leading-relaxed">
              <p className="font-semibold text-emerald-950 mb-1">Executive Summary:</p>
              <p>{blog.summary}</p>
            </div>

            {/* Key Takeaways */}
            {blog.keyTakeaways && blog.keyTakeaways.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Key Takeaways
                </h2>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-sm text-slate-700">
                  {blog.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Article Content Sections */}
            {blog.sections && blog.sections.map((sec) => (
              <section key={sec.id} id={sec.id} className="space-y-4 pt-2">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                  {sec.heading}
                </h2>
                <div
                  className="prose prose-slate max-w-none text-sm md:text-base leading-relaxed text-slate-700 space-y-4"
                  dangerouslySetInnerHTML={{ __html: sec.content }}
                />
              </section>
            ))}

            {/* FAQ Section */}
            {blog.faqs && blog.faqs.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  Frequently Asked Questions
                </h2>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-4 bg-white">
                  {blog.faqs.map((faq, idx) => (
                    <details key={idx} className="group py-3 first:pt-0 last:pb-0">
                      <summary className="flex cursor-pointer items-center justify-between font-bold text-slate-900 hover:text-emerald-700 transition">
                        <span>{faq.question}</span>
                        <span className="ml-2 text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Links Block */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white space-y-4 shadow-lg">
              <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Explore Top Colleges by City & Course
              </h3>
              <p className="text-xs text-emerald-100">
                Browse verified institutes, cutoff trends, and placement metrics across popular college hubs in India.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <Link
                  to="/engineering-colleges/bhopal"
                  className="p-3 bg-white/10 rounded-xl text-white hover:bg-white hover:text-emerald-900 border border-white/20 flex items-center justify-between transition-all"
                >
                  <span>Engineering Colleges in Bhopal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/mba-colleges/pune"
                  className="p-3 bg-white/10 rounded-xl text-white hover:bg-white hover:text-emerald-900 border border-white/20 flex items-center justify-between transition-all"
                >
                  <span>MBA Colleges in Pune</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/bba-colleges/indore"
                  className="p-3 bg-white/10 rounded-xl text-white hover:bg-white hover:text-emerald-900 border border-white/20 flex items-center justify-between transition-all"
                >
                  <span>BBA Colleges in Indore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/colleges/bhopal"
                  className="p-3 bg-white/10 rounded-xl text-white hover:bg-white hover:text-emerald-900 border border-white/20 flex items-center justify-between transition-all"
                >
                  <span>All Colleges in Bhopal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            {blog.sections && blog.sections.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3 sticky top-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Compass size={14} className="text-emerald-600" />
                  In This Article
                </h3>
                <nav className="space-y-2 text-xs font-medium">
                  {blog.sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block text-slate-600 hover:text-emerald-700 hover:translate-x-0.5 transition-all py-1 border-b border-slate-50 last:border-0"
                    >
                      {sec.heading}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Free Counseling Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 shadow-md">
              <GraduationCap className="w-8 h-8 text-white mb-3" />
              <h3 className="text-lg font-extrabold mb-2">Need Guidance for Admission 2026?</h3>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Connect with our expert admission counselors for personalized college shortlisting, fee structure comparisons, and scholarship guidance.
              </p>
              <a
                href="/#lead-capture"
                className="block text-center py-3 px-4 bg-white text-emerald-800 font-extrabold rounded-2xl text-xs hover:bg-emerald-50 transition-colors shadow-sm"
              >
                Talk to Free Counselor
              </a>
            </div>

            {/* Related Pillar Blogs */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Other SEO Priority Guides</h3>
              <div className="space-y-3">
                {PILLAR_BLOGS.filter((b) => b.slug !== blog.slug).map((other) => (
                  <Link
                    key={other.slug}
                    to={`/guides/${other.slug}`}
                    className="block p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs"
                  >
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                      Rank #{other.seoRank} • {other.category}
                    </span>
                    <span className="font-bold text-slate-900 block line-clamp-2">
                      {other.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
