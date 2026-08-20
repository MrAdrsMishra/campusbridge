import React, { useEffect, useState, useCallback } from "react";
import { useHomeStore } from "../stores/homeStore";
import { ArrowLeft, Building2, GraduationCap, MapPin, RefreshCw, Star } from "lucide-react";
import { CollegeListItem } from "../types";
import { useApiStore } from "../stores/apiStore";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { formatImageUrl } from "../components/ui";
import { CollegeFaqSection } from "../components/CollegeFaqSection";
import { CollegeRelatedLinks } from "../components/CollegeRelatedLinks";
import { toCollegeSlug } from "../components/seoUtils";

const CollegeDetail = () => {
  const {
    selectedCollege,
    selectedSuggestion,
    setLoadingCollege,
    setSelectedCollege,
    loadingCollege,
    suggestions,
  } = useHomeStore();

  const { slug } = useParams<{ slug: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const request = useApiStore((state) => state.request);
  const [error, setError] = useState<string | null>(null);

  // Always scroll to top when mounting CollegeDetail
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const getTargetCollege = useCallback((): CollegeListItem | null => {
    if (state?.college) {
      try {
        sessionStorage.setItem("nexteduwise_last_college", JSON.stringify(state.college));
      } catch { }
      return state.college as CollegeListItem;
    }
    if (slug && suggestions.length > 0) {
      // Primary match: compare the URL slug against the generated slug for each suggestion.
      // Fallback: numeric instituteId or raw College360 slug (backward compat with old URLs).
      const match = suggestions.find((s) =>
        toCollegeSlug(s.name, s.city ?? null) === slug ||
        String(s.instituteId ?? "") === slug ||
        s.slug === slug
      );
      if (match) {
        try {
          sessionStorage.setItem("nexteduwise_last_college", JSON.stringify(match));
        } catch { }
        return match;
      }
    }
    if (selectedSuggestion) {
      try {
        sessionStorage.setItem("nexteduwise_last_college", JSON.stringify(selectedSuggestion));
      } catch { }
      return selectedSuggestion;
    }
    try {
      const saved = sessionStorage.getItem("nexteduwise_last_college");
      if (saved) return JSON.parse(saved) as CollegeListItem;
    } catch { }
    return null;
  }, [state?.college, slug, suggestions, selectedSuggestion]);

  const targetCollege = getTargetCollege();

  const fetchCollege = useCallback(async () => {
    if (!targetCollege) return;

    setLoadingCollege(true);
    setError(null);

    try {
      let response: Response;

      if (targetCollege.slug && targetCollege.seriesId) {
        // Fast path — the college was already resolved to a College360 slug + seriesId.
        const params = new URLSearchParams({
          slug: targetCollege.slug,
          seriesId: String(targetCollege.seriesId),
        });
        response = await request(`/colleges/details?${params.toString()}`);
      } else if (targetCollege.name) {
        // Resolve by name + city -> find canonical College360 url via DB/Fuse.js strategy -> fetch details.
        const params = new URLSearchParams({ name: targetCollege.name });
        const city =
          targetCollege.city ||
          useHomeStore.getState().filters.city ||
          undefined;
        if (city) params.set("city", city);
        if (targetCollege.instituteId) {
          params.set("shikshaInstituteId", String(targetCollege.instituteId));
        }
        response = await request(`/colleges/details?${params.toString()}`);
      } else {
        throw new Error("No way to resolve this college.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch college details (${response.status})`);
      }

      const data = await response.json();
      setSelectedCollege(data);
    } catch {
      setError("Something went wrong on our end. We couldn't fetch the college information just now.");
    } finally {
      setLoadingCollege(false);
    }
  }, [targetCollege, request, setLoadingCollege, setSelectedCollege]);

  useEffect(() => {
    if (targetCollege) {
      void fetchCollege();
    }
  }, [targetCollege, fetchCollege]);

  const isFetching = loadingCollege || (targetCollege !== null && selectedCollege === null && !error);

  return (
    <main className="min-h-screen bg-[#fbfcfa] text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-100 bg-white">
        <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-extrabold shrink-0">
          <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-ink text-lime">
            <GraduationCap size={20} />
          </span>
           <span className="text-emerald-600"> nexteduwise</span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/#colleges")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Back to colleges</span><span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-16 pt-5">
        {isFetching && (
  <div className="space-y-6">
    {/* College header skeleton */}
    <div className="animate-pulse rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-200" />

          <div className="flex-1 space-y-3">
            {/* College name */}
            <div className="h-7 w-64 rounded-lg bg-slate-200 sm:w-96" />

            {/* Location */}
            <div className="h-4 w-40 rounded-md bg-slate-100" />
          </div>
        </div>

        {/* Refresh button */}
        <div className="h-10 w-36 rounded-2xl bg-slate-100" />
      </div>

      {/* Background image */}
      <div className="mt-6 h-64 w-full rounded-2xl bg-slate-200 sm:h-80" />

      {/* Address / description */}
      <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-5">
        <div className="h-4 w-3/4 rounded-md bg-slate-200" />
        <div className="h-4 w-full rounded-md bg-slate-200" />
        <div className="h-4 w-5/6 rounded-md bg-slate-200" />
      </div>
    </div>

    {/* Courses skeleton */}
    <div className="animate-pulse rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="h-4 w-32 rounded-md bg-slate-200" />

      <div className="mt-6 space-y-6">
        <div>
          <div className="h-4 w-40 rounded-md bg-slate-200" />

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="h-8 w-28 rounded-full bg-slate-100" />
            <div className="h-8 w-36 rounded-full bg-slate-100" />
            <div className="h-8 w-24 rounded-full bg-slate-100" />
            <div className="h-8 w-32 rounded-full bg-slate-100" />
          </div>
        </div>

        <div>
          <div className="h-4 w-36 rounded-md bg-slate-200" />

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="h-8 w-32 rounded-full bg-slate-100" />
            <div className="h-8 w-24 rounded-full bg-slate-100" />
            <div className="h-8 w-40 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>
    </div>

    {/* Reviews skeleton */}
    <div className="animate-pulse rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="h-4 w-32 rounded-md bg-slate-200" />

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="h-4 w-20 rounded-md bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded-md bg-slate-100" />
          <div className="mt-2 h-4 w-4/5 rounded-md bg-slate-100" />
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <div className="h-4 w-20 rounded-md bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded-md bg-slate-100" />
          <div className="mt-2 h-4 w-3/4 rounded-md bg-slate-100" />
        </div>
      </div>
    </div>
  </div>
)}

      {error && !loadingCollege && !selectedCollege && (
  <div className="flex min-h-[420px] items-center justify-center">
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
      {/* Error icon */}
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 ring-8 ring-rose-50/50">
        <Building2 size={28} className="text-rose-500" />
      </div>

      {/* Message */}
      <div className="mt-6">
        <h2 className="text-xl font-extrabold text-slate-900">
          Unable to load college
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          OOps!! We are still gathering details of this college. Belive US.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void fetchCollege()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        >
          <RefreshCw size={15} />
          Try again
        </button>

        <button
          type="button"
          onClick={() => navigate("/#colleges")}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Back to colleges
        </button>
      </div>

      {/* Subtle status */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        Something went wrong while fetching the details
      </div>
    </div>
  </div>
)}

        {!targetCollege && !selectedCollege && !loadingCollege && !error && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Building2 className="mx-auto text-slate-300" size={48} />
            <h2 className="mt-4 text-xl font-bold">No college selected</h2>
            <p className="mt-2 text-sm text-slate-500">Select a college from the home page to view its full details.</p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-white"
            >
              Browse colleges
            </Link>
          </div>
        )}

        {selectedCollege && !isFetching && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  {selectedCollege.logo ? (
                    <img
                      src={formatImageUrl(selectedCollege.logo) ?? ""}
                      alt={selectedCollege.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mint text-emerald-800">
                      <Building2 size={28} />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                      {selectedCollege.name}
                    </h1>
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <MapPin size={16} className="text-emerald-600" />
                      {selectedCollege.address.city ?? "Unknown city"}
                      {selectedCollege.address.state ? `, ${selectedCollege.address.state}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void fetchCollege()}
                  disabled={loadingCollege}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mint px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
                >
                  <RefreshCw size={14} className={loadingCollege ? "animate-spin" : ""} />
                  {loadingCollege ? "Refreshing..." : "Refresh details"}
                </button>
              </div>

              {selectedCollege.backgroundImage && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                  <img
                    src={formatImageUrl(selectedCollege.backgroundImage) ?? ""}
                    alt={selectedCollege.name}
                    className="h-64 w-full object-cover sm:h-80"
                  />
                </div>
              )}

              <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
                <p>
                  <span className="font-bold text-ink">Full address:</span>{" "}
                  {selectedCollege.address.full ?? "Not available"}
                </p>
                <p>
                  <span className="font-bold text-ink">Short description:</span>{" "}
                  {selectedCollege.shortDescription ?? "Not available"}
                </p>
              </div>

              {selectedCollege.shortDescription && (
                <p className="mt-6 text-sm leading-7 text-slate-600">
                  {selectedCollege.shortDescription}
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                Courses Offered
              </h3>
              <div className="mt-6 space-y-6">
                {Object.entries(selectedCollege.coursesByCategory).length > 0 ? (
                  Object.entries(selectedCollege.coursesByCategory).map(([category, courses]) => (
                    <div key={category}>
                      <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">
                        {category}
                      </h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {courses.map((course) => (
                          <span
                            key={`${category}-${course.name}`}
                            className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-700"
                          >
                            {course.name}
                            {course.shortForm ? ` · ${course.shortForm}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No course details available for this college.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                Student Reviews
              </h3>
              <div className="mt-6 space-y-4">
                {selectedCollege.reviews.length > 0 ? (
                  selectedCollege.reviews.map((review, index) => (
                    <div
                      key={`${review.comment}-${index}`}
                      className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="text-amber-500 fill-amber-500" size={16} />
                        <span className="font-bold text-amber-600">{review.rating}/10</span>
                      </div>
                      <p className="mt-3 leading-6 text-slate-600">“{review.comment}”</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                    No reviews available for this college yet.
                  </div>
                )}
              </div>
            </div>

            {/* ── SEO: FAQ section ── */}
            {(() => {
              const currentCourse =
                Object.keys(selectedCollege.coursesByCategory)[0] ??
                useHomeStore.getState().filters.course ??
                "Engineering";
              return (
                <>
                  <CollegeFaqSection
                    college={selectedCollege}
                    currentCourse={currentCourse}
                  />
                  <CollegeRelatedLinks
                    college={selectedCollege}
                    currentCourse={currentCourse}
                  />
                </>
              );
            })()}
          </div>
        )}
      </section>
    </main>
  );
};

export default CollegeDetail;

