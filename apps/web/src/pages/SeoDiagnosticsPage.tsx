import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Search, ShieldCheck, RefreshCw } from "lucide-react";
import { SeoHead } from "../components/SeoHead";
import { Breadcrumbs } from "../components/Breadcrumbs";

interface AuditResult {
  url: string;
  title: string;
  titleLength: number;
  titleValid: boolean;
  description: string;
  descLength: number;
  descValid: boolean;
  canonical: string;
  canonicalValid: boolean;
  robots: string;
  h1Count: number;
  h1Text: string;
  schemaCount: number;
  imageAltCoverage: number;
  totalImages: number;
  imagesWithAlt: number;
  indexable: boolean;
}

export const SeoDiagnosticsPage: React.FC = () => {
  const [audit, setAudit] = useState<AuditResult | null>(null);

  const runAudit = () => {
    const titleEl = document.querySelector("title");
    const titleText = titleEl?.textContent || "";

    const descEl = document.querySelector('meta[name="description"]');
    const descText = descEl?.getAttribute("content") || "";

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonicalText = canonicalEl?.getAttribute("href") || "";

    const robotsEl = document.querySelector('meta[name="robots"]');
    const robotsText = robotsEl?.getAttribute("content") || "index, follow";

    const h1s = document.querySelectorAll("h1");
    const h1Text = h1s.length > 0 ? h1s[0].textContent || "" : "None";

    const schemas = document.querySelectorAll('script[type="application/ld+json"]');

    const images = Array.from(document.querySelectorAll("img"));
    const withAlt = images.filter((img) => img.hasAttribute("alt") && img.getAttribute("alt")?.trim() !== "");
    const altCoverage = images.length > 0 ? Math.round((withAlt.length / images.length) * 100) : 100;

    setAudit({
      url: window.location.href,
      title: titleText,
      titleLength: titleText.length,
      titleValid: titleText.length >= 30 && titleText.length <= 70,
      description: descText,
      descLength: descText.length,
      descValid: descText.length >= 70 && descText.length <= 160,
      canonical: canonicalText,
      canonicalValid: Boolean(canonicalText),
      robots: robotsText,
      h1Count: h1s.length,
      h1Text,
      schemaCount: schemas.length,
      imageAltCoverage: altCoverage,
      totalImages: images.length,
      imagesWithAlt: withAlt.length,
      indexable: !robotsText.includes("noindex"),
    });
  };

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <SeoHead
        title="SEO Quality Gate Diagnostics | NextEduWise"
        description="Internal development SEO quality gate for auditing meta tags, canonicals, H1 hierarchy, JSON-LD schema, and image alt text."
        robots="noindex, nofollow"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs items={[{ label: "SEO Diagnostics" }]} />

        <div className="flex items-center justify-between my-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              SEO Diagnostics & Quality Gate
            </h1>
            <p className="text-sm text-slate-500">Live DOM metadata and crawlability auditor</p>
          </div>
          <button
            onClick={runAudit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Re-run Diagnostic Audit
          </button>
        </div>

        {audit && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Title Check */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">Meta Title</span>
                {audit.titleValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-slate-600 break-words font-mono bg-slate-50 p-2 rounded-lg">
                "{audit.title}"
              </p>
              <div className="text-xs text-slate-400">
                Length: <strong className="text-slate-700">{audit.titleLength} chars</strong> (Target: 30-70)
              </div>
            </div>

            {/* Description Check */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">Meta Description</span>
                {audit.descValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-slate-600 break-words font-mono bg-slate-50 p-2 rounded-lg">
                "{audit.description || "None"}"
              </p>
              <div className="text-xs text-slate-400">
                Length: <strong className="text-slate-700">{audit.descLength} chars</strong> (Target: 70-160)
              </div>
            </div>

            {/* Canonical Check */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">Canonical URL</span>
                {audit.canonicalValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </div>
              <p className="text-xs text-slate-600 break-all font-mono bg-slate-50 p-2 rounded-lg">
                {audit.canonical || "Missing!"}
              </p>
              <div className="text-xs text-slate-400">
                Status: <strong className="text-slate-700">{audit.canonicalValid ? "Valid" : "Missing"}</strong>
              </div>
            </div>

            {/* H1 Count Check */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">H1 Heading</span>
                {audit.h1Count === 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <p className="text-xs text-slate-600 truncate font-mono bg-slate-50 p-2 rounded-lg">
                "{audit.h1Text}"
              </p>
              <div className="text-xs text-slate-400">
                H1 Count: <strong className="text-slate-700">{audit.h1Count}</strong> (Strict Target: 1)
              </div>
            </div>

            {/* Schema JSON-LD Check */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">JSON-LD Schemas</span>
                {audit.schemaCount > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-indigo-600">{audit.schemaCount} Active Schemas</div>
              <div className="text-xs text-slate-400">Structured Data present in head</div>
            </div>

            {/* Image Alt Coverage */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-sm">Image Alt Coverage</span>
                {audit.imageAltCoverage >= 90 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-indigo-600">{audit.imageAltCoverage}%</div>
              <div className="text-xs text-slate-400">
                {audit.imagesWithAlt} / {audit.totalImages} images have valid alt text
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
