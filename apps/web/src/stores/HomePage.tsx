import React, { useEffect, useState } from "react";
import { GraduationCap, Menu, Star, X } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
 import {
  CATEGORY_SEARCH_MAP,
  CourseCategories,
} from "../components/landing/CourseCategories";
import { HowItWorks } from "../components/landing/HowItWorks";
import { LeadCapture } from "../components/landing/LeadCapture";
import { Testimonials } from "../components/landing/Testimonials";
import { CollegesListTable } from "../components/landing/CollegesListTable";
import { HomeFaqSection } from "../components/landing/HomeFaqSection";
import { normalizeCourseQuery, toCollegeSlug } from "../components/seoUtils";

// Fallbacks for the initial load, used only until the user explicitly picks a
// course/city. Kept small (5 each) and randomly chosen so every fresh visit
// shows something useful without asking for a location.
const FALLBACK_COURSES = ["Engineering", "MBA", "Medical", "B.Sc", "Arts"];
const FALLBACK_CITIES = ["Bhopal", "Indore", "Delhi", "Mumbai", "Pune"];

const pickRandom = <T,>(list: T[]): T =>
  list[Math.floor(Math.random() * list.length)];

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
  const [searchParams] = useSearchParams();
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

  const SUGGESTIONS_CACHE_KEY = "nexteduwise_colleges_cache";
  const TESTIMONIALS_CACHE_KEY = "nexteduwise_testimonials";

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

  const readCachedTestimonials = (): Testimonial[] | null => {
    try {
      const raw = sessionStorage.getItem(TESTIMONIALS_CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Testimonial[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const cacheTestimonials = (list: Testimonial[]) => {
    try {
      sessionStorage.setItem(TESTIMONIALS_CACHE_KEY, JSON.stringify(list));
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

    // Shiksha → College360 flow. Always keep a fallback for course & city so the
    // page loads fine before the user explicitly picks them; once a specific
    // value is provided it wins. No location popup is triggered from here.
    const name = effective.name?.trim() || "";
    const rawCourse = effective.course?.trim() || pickRandom(FALLBACK_COURSES);
    const course = normalizeCourseQuery(rawCourse);
    const preferred = readPreferredLocation();
    const city = (
      effective.city?.trim() ||
      preferred.city ||
      pickRandom(FALLBACK_CITIES)
    ).trim();

    const keyword = name || course;
    const cityQuery = `&city=${encodeURIComponent(city)}`;
    const state = (
      effective.state?.trim() ||
      preferred.state ||
      ""
    ).trim();
    const stateQuery = state ? `&state=${encodeURIComponent(state)}` : "";

    setLoadingSuggestions(true);
    setSelectedCollege(null);
    setSelectedSuggestion(null);

    try {
      const searchResponse = await request(
        `/colleges/search?query=${encodeURIComponent(keyword)}${cityQuery}${stateQuery}`,
      );
      if (!searchResponse.ok)
        throw new Error(`Shiksha search failed (${searchResponse.status})`);
      const result = (await searchResponse.json()) as
        | ShikshaCategoryResult
        | CollegeListItem[];

      // College-name search → backend already resolved the institutes.
      let next: CollegeListItem[];
      if (Array.isArray(result)) {
        next = result;
      } else {
        // Course/category search → fetch the category college list as before.
        const categoryUrl = toShikshaCityUrl(result.url || "", city);
        const listResponse = await request(
          `/colleges?url=${encodeURIComponent(categoryUrl)}${cityQuery}${stateQuery}`,
        );
        if (!listResponse.ok)
          throw new Error(`College list failed (${listResponse.status})`);
        const list = (await listResponse.json()) as CollegeListItem[];
        next = Array.isArray(list) ? list : [];
      }
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
  // If ?course= / ?city= query params are present (e.g. from Related Links on a
  // college detail page) pre-fill the filters and trigger a targeted search.
  useEffect(() => {
    const qCourse = searchParams.get("course")?.trim() ?? "";
    const qCity = searchParams.get("city")?.trim() ?? "";

    if (qCourse || qCity) {
      // Pre-fill filters from URL params
      if (qCourse) setFilter("course", qCourse);
      if (qCity) setFilter("city", qCity);
      // Trigger a fresh search with these params
      void search({ course: qCourse || undefined, city: qCity || undefined });
      // Scroll to the results section
      window.setTimeout(() => {
        document.getElementById("colleges")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
      return;
    }

    const cached = readCachedSuggestions();
    if (cached && cached.length > 0) {
      setSuggestions(cached);
      setLoadingSuggestions(false);
      return;
    }
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, searchParams]);

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
    const cached = readCachedTestimonials();
    if (cached && cached.length > 0) {
      setTestimonials(cached);
      return;
    }
    void request("/testimonials")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Testimonials request failed (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTestimonials(list);
        cacheTestimonials(list);
      })
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
      cacheTestimonials([data as Testimonial, ...testimonials].slice(0, 6));
    }
  };

  const openCollege = (college: CollegeListItem) => {
    // Always use the freshest snapshot from the suggestions store — the background
    // pre-computation mutates the same list objects in-place, so by click-time
    // slug/seriesId are usually already populated.
    const fresh =
      useHomeStore.getState().suggestions.find(
        (s) =>
          (college.instituteId != null && s.instituteId === college.instituteId) ||
          (college.slug && s.slug === college.slug) ||
          s.name === college.name,
      ) ?? college;

    setSelectedCollege(null);
    setSelectedSuggestion(fresh);
    // Build a human-readable, SEO-friendly URL slug: college-name-city
    const urlSlug = toCollegeSlug(fresh.name, fresh.city ?? null);
    navigate(`/college-detail/${urlSlug}`, { state: { college: fresh } });
  };
  const onExplore = (category: string) => {
    const query = CATEGORY_SEARCH_MAP[category] ?? category;
    applyCategory(query);
  };
  const applyCategory = (category: string) => {
    updateFilterAndActivity("course", category);
    const preferred = readPreferredLocation();
    if (!preferred.city && !filters.city.trim()) {
      // Ask for the user's location first so the category search is city-specific.
      openLocationPopup();
      return;
    }
    void search({ course: category });
    document
      .getElementById("colleges")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#fbfcfa] text-ink">
      <nav className="relative z-30 mx-auto flex w-full items-center justify-between px-4 py-3.5 sm:px-6 sm:py-5 border-b border-slate-100/80 bg-white/90 backdrop-blur-md sticky top-0">
        <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-extrabold shrink-0">
          <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-ink text-lime">
            <GraduationCap size={20} />
          </span>
          <span className="text-emerald-600 tracking-tight">nexteduwise</span>
        </Link>
        <div className="hidden gap-7 text-sm font-semibold md:flex">
          <NavLink
            to={{ pathname: "/", hash: "colleges" }}
            className="text-slate-700 hover:text-emerald-600 transition"
          >
            Find colleges
          </NavLink>
          <NavLink
            to={{ pathname: "/", hash: "courses" }}
            className="text-slate-700 hover:text-emerald-600 transition"
          >
            Courses
          </NavLink>
          <NavLink
            to={{ pathname: "/", hash: "how" }}
            className="text-slate-700 hover:text-emerald-600 transition"
          >
            How it works
          </NavLink>
          <NavLink to="/dashboard" className="text-slate-700 hover:text-emerald-600 transition">
            Counselor dashboard
          </NavLink>
          <NavLink to="/login" className="text-slate-700 hover:text-emerald-600 transition">
            Login
          </NavLink>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden sm:inline-flex rounded-full bg-ink px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-emerald-900"
          >
            Talk to an expert
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v: boolean) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 md:hidden hover:bg-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-50 flex flex-col gap-3 border-b border-slate-200 bg-white p-5 shadow-2xl md:hidden animate-in slide-in-from-top-2">
            <NavLink
              to={{ pathname: "/", hash: "colleges" }}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Find colleges
            </NavLink>
            <NavLink
              to={{ pathname: "/", hash: "courses" }}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Courses
            </NavLink>
            <NavLink
              to={{ pathname: "/", hash: "how" }}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
            >
              How it works
            </NavLink>
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Counselor dashboard
            </NavLink>
            <NavLink
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Login
            </NavLink>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 text-center rounded-xl bg-ink py-3 text-sm font-extrabold text-white"
            >
              Talk to an expert
            </Link>
          </div>
        )}
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

      <CollegesListTable
        colleges={suggestions}
        loading={loadingSuggestions}
        activeCategory={filters.course || "Engineering"}
        onOpenCollege={openCollege}
      />

      <CourseCategories onSelect={applyCategory} onExplore={onExplore} />

      <HowItWorks />

      <LeadCapture sent={sent} onSubmit={enquire} />

      <Testimonials testimonials={testimonials} />

      <HomeFaqSection />

      {/* Feedback form */}
      <section
        id="feedback"
        className="border-t border-slate-100 bg-[#f8faf7] py-10 sm:py-16"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="section-title text-xl sm:text-3xl font-extrabold text-ink">Tell us how nexteduwise helped you</h2>
          <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm text-slate-600">
            Your feedback helps fellow students make informed college decisions.
          </p>
          <form
            onSubmit={submitFeedback}
            className="mt-6 sm:mt-8 rounded-2xl sm:rounded-3xl border border-emerald-100 bg-white p-5 sm:p-7 shadow-lg shadow-emerald-950/5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold text-slate-700">
                Your Name
                <input
                  name="name"
                  required
                  placeholder="Enter your name"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-ink outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-ink py-3 text-xs sm:text-sm font-bold text-white transition active:scale-[0.98] hover:bg-emerald-900"
            >
              {feedbackSent ? "Thanks for your review!" : "Submit feedback"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
