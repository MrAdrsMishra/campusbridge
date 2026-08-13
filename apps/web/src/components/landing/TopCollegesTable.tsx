import React, { useMemo, useState } from "react";
import {
  Building2,
  Check,
  Download,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import type { CollegeListItem } from "../../types";
import { enrichCollege } from "../../data/landingData";
import { useCounselorPopupStore } from "../../stores/counselorPopupStore";
import { formatImageUrl } from "../ui";

type Props = {
  colleges: CollegeListItem[];
  loading: boolean;
  activeCategory: string;
  onOpenCollege: (college: CollegeListItem) => void;
};

/** Stable key for a college — instituteId when present, otherwise its College360 slug. */
const collegeKey = (c: CollegeListItem): string => String(c.instituteId ?? c.slug ?? c.name);

function rankBadgeClass(rank: number) {
  if (rank === 1) return "bg-amber-400 text-amber-950";
  if (rank === 2) return "bg-slate-300 text-slate-800";
  if (rank === 3) return "bg-orange-300 text-orange-950";
  return "bg-emerald-700 text-white";
}

/** Indian (lakh/crore) concise currency formatter. */
function formatMoney(n: number): string {
  if (n >= 1_000_0000) return `₹${(n / 1_000_0000).toFixed(1).replace(/\.0$/, "")} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1).replace(/\.0$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Real fee range from College360 when available, otherwise the enriched estimate. */
function feeLabel(c: CollegeListItem, fallback: string): string {
  if (c.minFees == null && c.maxFees == null) return fallback;
  if (c.minFees == null) return formatMoney(c.maxFees as number);
  if (c.maxFees == null) return formatMoney(c.minFees);
  return c.minFees === c.maxFees
    ? formatMoney(c.minFees)
    : `${formatMoney(c.minFees)}–${formatMoney(c.maxFees)}`;
}

export function TopCollegesTable({ colleges, loading, activeCategory, onOpenCollege }: Props) {
  const [toast, setToast] = useState<string | null>(null);

  const ranked = useMemo(() => {
    return colleges.map((college) => ({
      college,
      meta: enrichCollege(college.name, college.name),
    }));
  }, [colleges]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const downloadBrochure = (name: string) => {
    const content = `nexteduwise — ${name}\nOfficial brochure (sample)\n\nFee, cutoff and placement details are available on the college detail page.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "-").toLowerCase()}-brochure.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Brochure download started");
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500">
          Searching colleges{" "}
          <span className="inline-block animate-spin rounded-full border-2 border-emerald-600 border-t-transparent align-middle"></span>
        </div>
      </section>
    );
  }

  if (ranked.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500">
          <Building2 size={48} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-extrabold text-ink">
            {activeCategory ? `No colleges found for "${activeCategory}"` : "Search to see top colleges"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {activeCategory
              ? "Try a different category, city or college name, or clear your filters to browse more colleges."
              : "Use the search controls above to filter by course, city or college name."}
          </p>
        </div>
      </section>)
    }

  return (
    <section id="top-10" className="mx-auto max-w-7xl px-6 pb-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Top Colleges</p>
          <h2 className="section-title">
            {activeCategory ? `Top colleges for ${activeCategory}` : "Top colleges for you"}
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800">
          {ranked.length} colleges found
        </span>
      </div>

      {/* ==== Desktop comparative table — inside a scroll-enabled section ==== */}
      <div className="hidden max-h-[560px] overflow-y-auto rounded-3xl border border-slate-100 bg-white shadow-xl shadow-emerald-950/5 lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Rank &amp; Rating</th>
              <th className="px-5 py-4">College</th>
              <th className="px-5 py-4">Accepted Exams &amp; Cutoff</th>
              <th className="px-5 py-4">Total Fees</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ranked.map(({ college, meta }) => (
              <tr key={collegeKey(college)} className="align-top transition hover:bg-emerald-50/40">
                <td className="px-5 py-5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${rankBadgeClass(meta.rank)}`}>
                    #{meta.rank}
                  </span>
                  <p className="mt-2 flex items-center gap-1 text-sm font-bold text-amber-500">
                    <Star size={14} fill="currentColor" /> {meta.rating}
                    <span className="font-medium text-slate-400">({meta.reviewsCount})</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <TrendingUp size={13} /> {meta.placement} placements
                  </p>
                </td>
                <td className="px-5 py-5">
                  <button onClick={() => onOpenCollege(college)} className="flex items-center gap-3 text-left">
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mint text-emerald-800">
                      {college.logo ? (
                        <img src={formatImageUrl(college.logo) || ""} alt={college.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 size={22} />
                      )}
                    </span>
                    <span>
                      <span className="block max-w-52 font-extrabold leading-snug text-ink">
                        {college.name}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} className="text-emerald-600" /> {meta.state}
                      </span>
                    </span>
                  </button>
                </td>
                <td className="px-5 py-5">
                  <div className="space-y-2">
                    {meta.exams.map((exam) => (
                      <p key={exam.name} className="text-xs text-slate-600">
                        <span className="font-bold text-ink">{exam.name}</span> Cutoff:{" "}
                        <span className="font-bold text-emerald-700">{exam.cutoff}</span>
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-5">
                  <p className="text-base font-extrabold text-ink">{feeLabel(college, meta.fee)}</p>
                  <p className="text-[11px] text-slate-400">total course fee</p>
                </td>
                <td className="px-5 py-5">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onOpenCollege(college)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => useCounselorPopupStore.getState().open(college.name)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                    >
                      Apply Now
                    </button>
                    <button
                      onClick={() => downloadBrochure(college.name)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-500 hover:text-emerald-700"
                    >
                      <Download size={14} /> Brochure
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==== Mobile card layout — inside a scroll-enabled section ==== */}
      <div className="max-h-[560px] space-y-5 overflow-y-auto pr-1 lg:hidden">
        {ranked.map(({ college, meta }) => (
          <article key={collegeKey(college)} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-emerald-950/5">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mint text-emerald-800">
                {college.logo ? (
                  <img src={formatImageUrl(college.logo) || ""} alt={college.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={22} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="block max-w-[230px] font-extrabold leading-snug text-ink truncate">
                  {college.name}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={13} className="text-emerald-600" /> {meta.state}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <p className="font-bold text-slate-500">Rating</p>
                <p className="mt-1 flex items-center gap-1 font-extrabold text-amber-500">
                  <Star size={14} fill="currentColor" /> {meta.rating}
                  <span className="font-medium text-slate-400">({meta.reviewsCount})</span>
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="font-bold text-slate-500">Fees</p>
                <p className="mt-1 font-extrabold text-ink">{feeLabel(college, meta.fee)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="font-bold text-slate-500">Exams &amp; Cutoff</p>
                <p className="mt-1 space-y-0.5 text-emerald-700">
                  {meta.exams.map((e) => (
                    <span key={e.name} className="block font-bold">
                      {e.name}: {e.cutoff}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onOpenCollege(college)}
                className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
              >
                View Details
              </button>
              <button
                onClick={() => useCounselorPopupStore.getState().open(college.name)}
                className="inline-flex items-center rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white"
              >
                Apply Now
              </button>
              <button onClick={() => downloadBrochure(college.name)} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1 text-xs font-bold text-slate-600">
                <Download size={14} /> Brochure
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-white shadow-2xl">
          <span className="inline-flex items-center gap-2">
            <Check size={16} className="text-lime" /> {toast}
          </span>
        </div>
      )}
    </section>
  );
}
