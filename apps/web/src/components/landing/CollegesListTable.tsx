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
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1).replace(/\.0$/, "")} Cr`;
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

export function CollegesListTable({ colleges, loading, activeCategory, onOpenCollege }: Props) {
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

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-3 sm:px-6 pb-10">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-12 text-center text-sm text-slate-500">
          Searching colleges{" "}
          <span className="inline-block animate-spin rounded-full border-2 border-emerald-600 border-t-transparent align-middle"></span>
        </div>
      </section>
    );
  }

  if (ranked.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-3 sm:px-6 pb-10">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-12 text-center text-sm text-slate-500">
          <Building2 size={44} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-base sm:text-lg font-extrabold text-ink">
            {activeCategory ? `No colleges found for "${activeCategory}"` : "Search to see top colleges"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-slate-500">
            {activeCategory
              ? "Try a different category, city or college name, or clear your filters to browse more colleges."
              : "Use the search controls above to filter by course, city or college name."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="top-10" className="mx-auto max-w-7xl px-3 sm:px-6 pb-8 sm:pb-12">
      {/* Header section */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <p className="eyebrow text-xs uppercase tracking-wider font-bold text-emerald-700">Top Colleges</p>
          <h2 className="section-title text-lg sm:text-2xl lg:text-3xl font-extrabold text-ink">
            {activeCategory ? `Top colleges for ${activeCategory}` : "Top colleges for you"}
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] sm:text-xs font-bold text-emerald-800">
          {ranked.length} colleges found
        </span>
      </div>

      {/* ==== Tablet & Desktop View (md: 768px and up) ==== */}
      <div className="hidden max-h-[580px] overflow-x-auto overflow-y-auto rounded-3xl border border-slate-100 bg-white shadow-xl shadow-emerald-950/5 md:block">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-4 lg:px-5 py-4">Rank &amp; Rating</th>
              <th className="px-4 lg:px-5 py-4">College</th>
              <th className="px-4 lg:px-5 py-4">Accepted Exams &amp; Cutoff</th>
              <th className="px-4 lg:px-5 py-4">Total Fees</th>
              <th className="px-4 lg:px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ranked.map(({ college, meta }) => (
              <tr key={collegeKey(college)} className="align-top transition hover:bg-emerald-50/40">
                <td className="px-4 lg:px-5 py-5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${rankBadgeClass(meta.rank)}`}>
                    #{meta.rank}
                  </span>
                  <p className="mt-2 flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-500">
                    <Star size={14} fill="currentColor" /> {meta.rating}
                    <span className="font-medium text-slate-400">({meta.reviewsCount})</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <TrendingUp size={13} /> {meta.placement} placements
                  </p>
                </td>
                <td className="px-4 lg:px-5 py-5">
                  <button onClick={() => onOpenCollege(college)} className="flex items-center gap-3 text-left">
                    <span className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mint text-emerald-800">
                      {college.logo ? (
                        <img src={formatImageUrl(college.logo) || ""} alt={college.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 size={22} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-[180px] lg:max-w-xs font-extrabold leading-snug text-ink text-xs sm:text-sm">
                        {college.name}
                      </span>
                    </span>
                  </button>
                </td>
                <td className="px-4 lg:px-5 py-5">
                  <div className="space-y-1.5">
                    {meta.exams.map((exam) => (
                      <p key={exam.name} className="text-xs text-slate-600">
                        <span className="font-bold text-ink">{exam.name}</span> Cutoff:{" "}
                        <span className="font-bold text-emerald-700">{exam.cutoff}</span>
                      </p>
                    ))}
                  </div>
                </td>
                <td className="px-4 lg:px-5 py-5">
                  <p className="text-sm sm:text-base font-extrabold text-ink">{feeLabel(college, meta.fee)}</p>
                  <p className="text-[11px] text-slate-400">total course fee</p>
                </td>
                <td className="px-4 lg:px-5 py-5">
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==== Mobile Cards View (< md: 768px) - College360 Inspired Card Layout ==== */}
      <div className="space-y-3.5 md:hidden">
        {ranked.map(({ college, meta }) => (
          <article
            key={collegeKey(college)}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-emerald-950/5 transition hover:border-emerald-300"
          >
            {/* Header: Rank + Logo + Title + Rating */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Logo with Rank overlay */}
                <div className="relative shrink-0">
                  <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl border border-slate-100 bg-mint text-emerald-800">
                    {college.logo ? (
                      <img src={formatImageUrl(college.logo) || ""} alt={college.name} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={22} />
                    )}
                  </span>
                  <span className={`absolute -top-1.5 -left-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold shadow-xs ${rankBadgeClass(meta.rank)}`}>
                    #{meta.rank}
                  </span>
                </div>

                {/* College Title */}
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => onOpenCollege(college)}
                    className="text-left font-extrabold text-ink text-sm leading-snug hover:text-emerald-700 transition line-clamp-2"
                  >
                    {college.name}
                  </button>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} className="shrink-0 text-emerald-600" />
                    <span className="truncate">India</span>
                  </p>
                </div>
              </div>

              {/* Rating pill */}
              <div className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 border border-amber-200/70">
                <Star size={12} fill="currentColor" className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700">{meta.rating}</span>
                <span className="text-[10px] text-slate-400">({meta.reviewsCount})</span>
              </div>
            </div>

            {/* Middle Details Grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-2.5 text-xs border border-slate-100">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Fees</span>
                <span className="font-extrabold text-ink text-xs sm:text-sm">{feeLabel(college, meta.fee)}</span>
              </div>

              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Placements</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 text-xs">
                  <TrendingUp size={12} /> {meta.placement} rate
                </span>
              </div>

              {meta.exams.length > 0 && (
                <div className="col-span-2 pt-1 border-t border-slate-200/50">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Accepted Exam &amp; Cutoff</span>
                  <span className="font-semibold text-slate-700 text-xs">
                    {meta.exams[0].name}: <span className="font-bold text-emerald-700">{meta.exams[0].cutoff}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-3.5 flex items-center gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => onOpenCollege(college)}
                className="flex-1 rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 text-xs font-extrabold text-emerald-700 transition active:scale-95 hover:bg-emerald-100 text-center"
              >
                View Details
              </button>
              <button
                onClick={() => useCounselorPopupStore.getState().open(college.name)}
                className="flex-1 rounded-xl bg-ink py-2.5 text-xs font-extrabold text-white transition active:scale-95 hover:bg-emerald-950 text-center shadow-xs"
              >
                Apply Now
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-2xl max-w-[90vw]">
          <span className="inline-flex items-center gap-2">
            <Check size={16} className="text-lime shrink-0" /> {toast}
          </span>
        </div>
      )}
    </section>
  );
}