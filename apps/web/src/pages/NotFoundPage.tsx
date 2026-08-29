import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Compass, GraduationCap, Home, Search, HelpCircle } from "lucide-react";
import { SeoHead } from "../components/SeoHead";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[85vh] flex-col items-center justify-center bg-[#fbfcfa] px-4 py-12 text-ink">
      <SeoHead
        title="404 Page Not Found | NextEduWise"
        description="The page you are looking for does not exist or has been moved. Explore top colleges, courses and admission guides on NextEduWise."
        robots="noindex, follow"
      />

      <div className="w-full max-w-2xl text-center">
        {/* Animated Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
          <Compass className="h-4 w-4 text-emerald-600 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Error 404 — Page Not Found</span>
        </div>

        {/* Big 404 Text */}
        <h1 className="text-6xl font-black tracking-tight text-slate-900 sm:text-8xl">
          4<span className="text-emerald-600">0</span>4
        </h1>

        <h2 className="mt-4 text-xl font-extrabold text-slate-800 sm:text-2xl">
          Oops! Looks like you've wandered off the campus
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          The page, college listing, or guide you are looking for might have been renamed, removed, or is temporarily unavailable.
        </p>

        {/* Quick Search CTA */}
        <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-md sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Where would you like to go next?
          </h3>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
            >
              <ArrowLeft size={16} />
              Go back
            </button>

            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 sm:w-auto"
            >
              <Home size={16} />
              Return to Homepage
            </Link>

            <Link
              to="/colleges"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 sm:w-auto"
            >
              <Building2 size={16} />
              Browse Colleges
            </Link>
          </div>

          {/* Popular SEO Destination Links */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Popular College Directories
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/engineering-colleges/bhopal"
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
              >
                Engineering Colleges in Bhopal
              </Link>
              <Link
                to="/mba-colleges/pune"
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
              >
                MBA Colleges in Pune
              </Link>
              <Link
                to="/engineering-colleges/indore"
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
              >
                BTech Colleges in Indore
              </Link>
              <Link
                to="/guides"
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
              >
                Admission Guides 2026
              </Link>
            </div>
          </div>
        </div>

        {/* Free Counselor Footer */}
        <p className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <HelpCircle size={14} className="text-emerald-600" />
          Need help finding a specific college?{" "}
          <a href="/#lead-capture" className="font-bold text-emerald-700 underline underline-offset-2">
            Talk to a free counselor
          </a>
        </p>
      </div>
    </main>
  );
}
