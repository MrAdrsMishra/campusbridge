import React, { useEffect, useState, useCallback } from "react";
import { useHomeStore } from "../stores/homeStore";
import { ArrowLeft, Building2, GraduationCap, MapPin, RefreshCw, Star } from "lucide-react";
import { CollegeListItem } from "../types";
import { useApiStore } from "../stores/apiStore";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

const CollegeDetail = () => {
  const {
    selectedCollege,
    selectedSuggestion,
    setLoadingCollege,
    setSelectedCollege,
    loadingCollege,
    suggestions,
  } = useHomeStore();

  const { id } = useParams<{ id: string }>();
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
    if (id && suggestions.length > 0) {
      const match = suggestions.find((s) => String(s.instituteId ?? "") === id || s.slug === id);
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
  }, [state?.college, id, suggestions, selectedSuggestion]);

  const targetCollege = getTargetCollege();

  const fetchCollege = useCallback(async () => {
    if (!targetCollege?.slug || !targetCollege?.seriesId) {
      return;
    }

    setLoadingCollege(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        slug: targetCollege.slug,
        seriesId: String(targetCollege.seriesId),
      });

      const response = await request(`/colleges/details?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch college details (${response.status})`);
      }

      const data = await response.json();
      setSelectedCollege(data);
    } catch {
      setError("Unable to load college details. Please try again later.");
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
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime">
            <GraduationCap size={21} />
          </span>
           <span className="text-emerald-600"> nexteduwise</span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/#colleges")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft size={16} /> Back to colleges
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-6">
        {isFetching && (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm font-medium text-slate-500">Loading college details...</p>
          </div>
        )}

        {error && !loadingCollege && !selectedCollege && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50/50 p-8 text-center">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void fetchCollege()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white"
            >
              <RefreshCw size={14} /> Try again
            </button>
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
                      src={selectedCollege.logo}
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
                    src={selectedCollege.backgroundImage}
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
          </div>
        )}
      </section>
    </main>
  );
};

export default CollegeDetail;

