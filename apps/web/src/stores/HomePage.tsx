import React, { useEffect } from "react";
import { GraduationCap, Star } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import type {
  CitySuggestion,
  CollegeListItem,
  Filters,
  ShikshaCategoryResult,
  Testimonial,
} from "../types";
import { useApiStore } from "./apiStore";
import { useHomeStore } from "./homeStore";
import { useLocationPopupStore } from "./locationPopupStore";
import { HeroSection } from "../components/landing/HeroSection";
import { SearchSection } from "../components/landing/SearchSection";
import { TopCollegesTable } from "../components/landing/TopCollegesTable";
import {
  CATEGORY_SEARCH_MAP,
  CourseCategories,
} from "../components/landing/CourseCategories";
import { HowItWorks } from "../components/landing/HowItWorks";
import { LeadCapture } from "../components/landing/LeadCapture";
import { Testimonials } from "../components/landing/Testimonials";

export default function HomePage() {
  const {
    filters,
    setFilter,
    suggestions,
    setSelectedSuggestion,
    loadingSuggestions,
    setSuggestions,
    setSelectedCollege,
    setLoadingSuggestions,
    sent,
    setSent,
    feedbackSent,
    setFeedbackSent,
    rating,
    setRating,
    testimonials,
    setTestimonials,
    prependTestimonial,
    citySuggestions,
    setCitySuggestions,
  } = useHomeStore();
  const request = useApiStore((state) => state.request);
  const openLocationPopup = useLocationPopupStore((state) => state.open);
  const location = useLocation();
  const navigate = useNavigate();
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
    | string
    | undefined;

  const updateFilterAndActivity = (key: keyof Filters, value: string) => {
    setFilter(key, value);
    const updated = { ...filters, [key]: value };
    try {
      sessionStorage.setItem(
        "nexteduwise_user_activity",
        JSON.stringify({
          course: updated.course,
          city: updated.city,
          state: updated.state,
          name: updated.name,
          searchedAt: new Date().toISOString(),
        }),
      );
    } catch {}
  };

  /**
   * Localize the Shiksha category URL to a given city. The autosuggest API returns a stream
   * URL like ".../b-tech-colleges-india" — swap the trailing region token with the city slug
   * (e.g. ".../b-tech-colleges-bhopal"). Falls back to the raw URL when it can't be localized.
   */
  const toShikshaCityUrl = (categoryUrl: string, city: string): string => {
    const marker = "colleges-";
    const idx = categoryUrl.indexOf(marker);
    const citySlug = city.trim().toLowerCase().replace(/\s+/g, "-");
    if (idx < 0 || !citySlug) return categoryUrl;
    return `${categoryUrl.slice(0, idx + marker.length)}${citySlug}`;
  };

  /**
   * Read the user's saved preferred location (city/state) from sessionStorage.
   * The DesiredLocationPopup persists this when the user picks a city.
   */
  const readPreferredLocation = (): { city: string; state: string } => {
    try {
      const raw = sessionStorage.getItem("nexteduwise_preferred_location");
      if (!raw) return { city: "", state: "" };
      const parsed = JSON.parse(raw) as { city?: string; state?: string };
      return {
        city: parsed.city?.trim() ?? "",
        state: parsed.state?.trim() ?? "",
      };
    } catch {
      return { city: "", state: "" };
    }
  };

  // === College list session cache ===
  // Keep the last successful results so refresh / back-navigation don't refetch
  // unnecessarily. The cache is replaced on every new search.
  const SUGGESTIONS_CACHE_KEY = "nexteduwise_colleges_cache";

  const readCachedSuggestions = (): CollegeListItem[] | null => {
    try {
      const raw = sessionStorage.getItem(SUGGESTIONS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CollegeListItem[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const cacheSuggestions = (list: CollegeListItem[]) => {
    try {
      sessionStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify(list));
    } catch {}
  };

  const search = async (overrides?: Partial<Filters>) => {
    const effective = { ...filters, ...overrides };
    try {
      sessionStorage.setItem(
        "nexteduwise_user_activity",
        JSON.stringify({
          course: effective.course,
          city: effective.city,
          state: effective.state,
          name: effective.name,
          searchedAt: new Date().toISOString(),
        }),
      );
    } catch {}

    // Shiksha → College360 flow. Default/initial load is Engineering colleges
    // for the user's saved location (falling back to Bhopal when none is set).
    const course = effective.course?.trim() || "Engineering";
    const preferred = readPreferredLocation();
    const city = effective.city?.trim() || preferred.city || "bhopal";
    const keyword = effective.name?.trim() || course;

    setLoadingSuggestions(true);
    setSelectedCollege(null);
    setSelectedSuggestion(null);

    try {
      const searchResponse = await request(
        `/colleges/search?query=${encodeURIComponent(keyword)}`,
      );
      if (!searchResponse.ok)
        throw new Error(`Shiksha search failed (${searchResponse.status})`);
      const category = (await searchResponse.json()) as ShikshaCategoryResult;
      const categoryUrl = toShikshaCityUrl(category.url || "", city);

      const listResponse = await request(
        `/colleges?url=${encodeURIComponent(categoryUrl)}`,
      );
      if (!listResponse.ok)
        throw new Error(`College list failed (${listResponse.status})`);
      const list = (await listResponse.json()) as CollegeListItem[];
      const next = Array.isArray(list) ? list : [];
      setSuggestions(next);
      cacheSuggestions(next);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Initial load: reuse the session-cached list if available to avoid a redundant
  // API call on refresh / navigation back. A new search overwrites the cache.
  useEffect(() => {
    const cached = readCachedSuggestions();
    if (cached && cached.length > 0) {
      setSuggestions(cached);
      setLoadingSuggestions(false);
      return;
    }
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  // Mapbox city autocomplete
  useEffect(() => {
    const query = filters.city.trim();
    if (!mapboxToken || query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${mapboxToken}&limit=5&language=en&types=place`,
        );
        if (!response.ok) {
          setCitySuggestions([]);
          return;
        }
        const data = (await response.json()) as {
          suggestions?: CitySuggestion[];
        };
        setCitySuggestions(data.suggestions ?? []);
      } catch {
        setCitySuggestions([]);
      }
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [filters.city, mapboxToken, setCitySuggestions]);

  // Load testimonials
  useEffect(() => {
    void request("/testimonials")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Testimonials request failed (${response.status})`);
        }
        return response.json();
      })
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load testimonials", err);
        setTestimonials([]);
      });
  }, [request, setTestimonials]);

  // Hash-based smooth scroll
  useEffect(() => {
    if (location.hash === "dashboard") {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (location.hash === "login") {
      navigate("/login", { replace: true });
      return;
    }
    if (location.hash) {
      const section = document.getElementById(location.hash.slice(1));
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.hash, navigate]);
  const enquire = async (payload: Record<string, string>) => {
    try {
      const raw = sessionStorage.getItem("nexteduwise_user_activity");
      if (raw) {
        const act = JSON.parse(raw) as Record<string, string>;
        const parts: string[] = [];
        if (act.name) parts.push(`College searched: ${act.name}`);
        if (act.city) parts.push(`City: ${act.city}`);
        if (act.state) parts.push(`State: ${act.state}`);
        if (act.course) parts.push(`Course: ${act.course}`);
        if (act.searchedAt)
          parts.push(
            `Searched at: ${new Date(act.searchedAt).toLocaleString()}`,
          );
        if (parts.length) payload.searchActivity = parts.join(" | ");
      }
    } catch {}

    await request("/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSent(true);
  };

  const submitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      review: form.get("review"),
      rating,
    };
    const response = await request("/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      setFeedbackSent(true);
      event.currentTarget.reset();
      setRating(5);
      const data = await response.json();
      prependTestimonial(data as Testimonial);
    }
  };

  const openCollege = (college: CollegeListItem) => {
    // Resolve by name → exact College360 url → fetch details by that url.
    // The backend's getCollegeDetailsByName handles the resolution internally.
    setSelectedCollege(null);
    setSelectedSuggestion(college);
    const targetId = String(college.instituteId ?? college.slug ?? college.name ?? "");
    navigate(`/college-detail/${targetId}`, { state: { college } });
  };
  const onExplore = (category: string) => {
    const query = CATEGORY_SEARCH_MAP[category] ?? category;
    applyCategory(query);
  };
  const applyCategory = (category: string) => {
    updateFilterAndActivity("course", category);
    const preferred = readPreferredLocation();
    if (!preferred.city) {
      // No preferred location saved yet — ask the user to pick one first.
      // Colleges are loaded only once we know where they want to study.
      openLocationPopup();
      return;
    }
    void search({ course: category });
    document
      .getElementById("colleges")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[#fbfcfa] text-ink">
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime">
            <GraduationCap size={21} />
          </span>
          <span className="text-emerald-600"> nexteduwise</span>
        </Link>
        <div className="hidden gap-8 text-sm font-medium md:flex">
          <NavLink
            to={{ pathname: "/", hash: "colleges" }}
            className="text-emerald-700"
          >
            Find colleges
          </NavLink>
          <NavLink
            to={{ pathname: "/", hash: "courses" }}
            className="text-emerald-700"
          >
            Courses
          </NavLink>
          <NavLink
            to={{ pathname: "/", hash: "how" }}
            className="text-emerald-700"
          >
            How it works
          </NavLink>
          <NavLink to="/dashboard" className="text-emerald-700">
            Counselor dashboard
          </NavLink>
          <NavLink to="/login" className="text-emerald-700">
            Login
          </NavLink>
        </div>
        <Link
          to="/login"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          Talk to an expert
        </Link>
      </nav>

      <HeroSection
        colleges={suggestions}
        onFind={(quick) => {
          updateFilterAndActivity("city", quick.city);
          updateFilterAndActivity("course", quick.course);
          updateFilterAndActivity("state", quick.state);
          updateFilterAndActivity("name", quick.name);
          void search({
            city: quick.city,
            course: quick.course,
            state: quick.state,
            name: quick.name,
          });
          document
            .getElementById("colleges")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <SearchSection
        filters={filters}
        onFilterChange={updateFilterAndActivity}
        onSearch={() => void search()}
        onPickCity={(name) => {
          updateFilterAndActivity("city", name);
          setCitySuggestions([]);
        }}
        citySuggestions={citySuggestions}
        loading={loadingSuggestions}
      />

      <TopCollegesTable
        colleges={suggestions}
        loading={loadingSuggestions}
        activeCategory={filters.course || "Engineering"}
        onOpenCollege={openCollege}
      />

      <CourseCategories onSelect={applyCategory} onExplore={onExplore} />

      <HowItWorks />

      <LeadCapture sent={sent} onSubmit={enquire} />

      <Testimonials testimonials={testimonials} />
      {/* Feedback form */}
      <section
        id="feedback"
        className="border-t border-slate-100 bg-[#f8faf7] py-16"
      >
        <div className="mx-auto max-w-3xl px-6">
          {/* <p className="eyebrow">Share your experience</p> */}
          <h2 className="section-title">Tell us how nexteduwise helped you</h2>
          <p className="mt-3 max-w-xl text-sm text-slate-600">
            Your feedback helps fellow students make informed college decisions.
          </p>
          <form
            onSubmit={submitFeedback}
            className="mt-8 rounded-3xl border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-950/5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-700">
                Your Name
                <input
                  name="name"
                  required
                  placeholder="Enter your name"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <div>
                <span className="block text-xs font-bold text-slate-700">
                  Rating
                </span>
                <div className="mt-1.5 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                      className={`rounded-full p-1 transition ${value <= rating ? "text-amber-500" : "text-slate-300"}`}
                      onClick={() => setRating(value)}
                    >
                      <Star
                        size={20}
                        fill={value <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-bold text-amber-600">
                    {rating} / 5
                  </span>
                </div>
              </div>
            </div>
            <label className="mt-4 block text-xs font-bold text-slate-700">
              Your Feedback
              <textarea
                name="review"
                required
                rows={3}
                placeholder="Share how nexteduwise helped your search..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-ink py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              {feedbackSent ? "Thanks for your review!" : "Submit feedback"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
