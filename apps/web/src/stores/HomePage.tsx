import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, GraduationCap, MapPin, MessageCircle, Phone, Search, ShieldCheck, Star } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import type { CollegeDetailView, CollegeSearchResponse, CollegeSuggestion, CitySuggestion, Testimonial } from "../types";
import { Field, SearchBox, formatImageUrl, navLinkClass } from "../components/ui";
import { useApiStore } from "./apiStore";
import { useHomeStore } from "./homeStore";

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
    loadingCollege,
    setLoadingCollege,
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
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

  const updateFilterAndActivity = (key: keyof typeof filters, value: string) => {
    setFilter(key, value);
    const updated = { ...filters, [key]: value };
    try {
      sessionStorage.setItem(
        "campusbridge_user_activity",
        JSON.stringify({
          course: updated.course,
          city: updated.city,
          state: updated.state,
          name: updated.name,
          searchedAt: new Date().toISOString(),
        })
      );
    } catch {}
  };

  const search = async () => {
    const params = new URLSearchParams();
    if (filters.city) params.set("city", filters.city);
    if (filters.course) params.set("course", filters.course);
    if (filters.state) params.set("state", filters.state);
    if (filters.name) params.set("name", filters.name);

    try {
      sessionStorage.setItem(
        "campusbridge_user_activity",
        JSON.stringify({
          course: filters.course,
          city: filters.city,
          state: filters.state,
          name: filters.name,
          searchedAt: new Date().toISOString(),
        })
      );
    } catch {}

    setLoadingSuggestions(true);
    setSelectedCollege(null);
    setSelectedSuggestion(null);

    try {
      const response = await request(`/colleges/suggestions?${params.toString()}`);
      const data = (await response.json()) as CollegeSearchResponse;
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };
  useEffect(() => {
    void search();
  }, [request]);

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
        const data = (await response.json()) as { suggestions?: CitySuggestion[] };
        setCitySuggestions(data.suggestions ?? []);
      } catch {
        setCitySuggestions([]);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [filters.city, mapboxToken]);

  useEffect(() => {
    void request("/testimonials")
      .then((response) => response.json())
      .then((data) => setTestimonials(Array.isArray(data) ? data : []))
      .catch(() => setTestimonials([]));
  }, [request]);

  useEffect(() => {
    if (location.hash === "#dashboard") {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (location.hash === "#login") {
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

  const enquire = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form) as Record<string, string>;

    // Attach session search activity as plain text
    try {
      const raw = sessionStorage.getItem("campusbridge_user_activity");
      if (raw) {
        const act = JSON.parse(raw) as Record<string, string>;
        const parts: string[] = [];
        if (act.name) parts.push(`College searched: ${act.name}`);
        if (act.city) parts.push(`City: ${act.city}`);
        if (act.state) parts.push(`State: ${act.state}`);
        if (act.course) parts.push(`Course: ${act.course}`);
        if (act.searchedAt) parts.push(`Searched at: ${new Date(act.searchedAt).toLocaleString()}`);
        if (parts.length) payload.searchActivity = parts.join(" | ");
      }
    } catch {}

    await request("/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSent(true);
    event.currentTarget.reset();
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

  const marqueeTestimonials = testimonials.slice(0, Math.min(testimonials.length, 6));
  const citySuggestionsLabel = useMemo(() => {
    if (!filters.city.trim()) return "Try typing a city like Bengaluru or Pune";
    return citySuggestions.length ? "Suggested cities" : "No suggestions yet";
  }, [citySuggestions.length, filters.city]);

  return (
    <main className="min-h-screen bg-[#fbfcfa] text-ink">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime">
            <GraduationCap size={21} />
          </span>
          campus<span className="text-emerald-600">bridge</span>
        </Link>
        <div className="hidden gap-8 text-sm font-medium md:flex">
          <NavLink to={{ pathname: "/", hash: "#colleges" }} className={navLinkClass}>
            Find colleges
          </NavLink>
          <NavLink to={{ pathname: "/", hash: "#how" }} className={navLinkClass}>
            How it works
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            Counselor dashboard
          </NavLink>
          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>
        </div>
        <Link to="/login" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
          Talk to an expert
        </Link>
      </nav>

      <section id="top" className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-20 pt-14">
        <div className="orb absolute right-0 top-0 h-72 w-72 rounded-full bg-lime/45 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.18em] text-emerald-700">
            Your right college, made simpler
          </p>
          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
            A clearer path to your <em className="font-serif font-normal text-emerald-700">next chapter.</em>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Search trusted colleges, compare real details, and get a counselor who understands your goals — all in one place.
          </p>
        </div>
        <div className="relative mt-10 grid gap-3 rounded-3xl border border-emerald-100 bg-white p-4 shadow-xl shadow-emerald-950/5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <SearchBox
              icon={<MapPin />}
              placeholder="Enter city"
              value={filters.city}
              onChange={(value) => {
                updateFilterAndActivity("city", value);
                setShowCitySuggestions(Boolean(value.trim()));
              }}
              onFocus={() => setShowCitySuggestions(Boolean(filters.city.trim()))}
              onBlur={() => window.setTimeout(() => setShowCitySuggestions(false), 150)}
            />
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{citySuggestionsLabel}</p>
                {citySuggestions.map((suggestion) => (
                  <button
                    key={suggestion.mapbox_id}
                    type="button"
                    className="flex w-full items-start rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      updateFilterAndActivity("city", suggestion.name);
                      setCitySuggestions([]);
                      setShowCitySuggestions(false);
                    }}
                  >
                    <span className="mr-2 mt-0.5 text-emerald-600">
                      <MapPin size={14} />
                    </span>
                    <span>
                      <span className="block font-semibold">{suggestion.name}</span>
                      <span className="block text-xs text-slate-500">{suggestion.full_address}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <SearchBox
            icon={<Search />}
            placeholder="Enter college name"
            value={filters.name}
            onChange={(value) => updateFilterAndActivity("name", value)}
          />
          <SearchBox
            icon={<ShieldCheck />}
            placeholder="Enter state"
            value={filters.state}
            onChange={(value) => updateFilterAndActivity("state", value)}
          />
          <SearchBox icon={<GraduationCap />} placeholder="Enter course" value={filters.course} onChange={(value) => updateFilterAndActivity("course", value)} />
          <button onClick={search} className="rounded-2xl bg-ink px-6 font-semibold text-white">Find colleges</button>
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium text-slate-600">
          <span className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={18} />
            Verified college partners
          </span>
          <span>1:1 admission guidance</span>
          <span>Zero-cost counseling</span>
        </div>
      </section>

      <section id="colleges" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-9 flex items-end justify-between gap-4">
          <span className="text-sm font-medium text-slate-500">
            {loadingSuggestions ? "Searching..." : `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"}`}
          </span>
        </div>
        {suggestions.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suggestions.map((college) => (
              <article key={college.id} className="card flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-mint text-emerald-800">
                      {college.logo ? (
                        <img src={formatImageUrl(college.logo) || ""} alt={college.name} className="h-full w-full object-cover" />
                      ) : (
                        <Building2 />
                      )}
                    </div>
                    <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold">Suggested</span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold leading-tight">{college.name}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{college.slug}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = college.id || college.slug;
                    setSelectedCollege(null);
                    setSelectedSuggestion(college);
                    navigate(`/college-detail/${targetId}`, { state: { college } });
                  }}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800"
                >
                  View details <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="how" className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow text-lime">Guidance that stays personal</p>
          <h2 className="section-title max-w-xl">From discovery to admission — with you at every step.</h2>
          <div className="timeline mt-14">
            {[
              ["01", "Discover your options", "Search by course, city, state or college name."],
              ["02", "Share your goals", "Tell us your course, budget and preferred city."],
              ["03", "Get personal guidance", "A counselor shortlists colleges, scholarships and pathways."],
              ["04", "Choose with clarity", "Compare fees, hostel, placement support and student reviews."],
              ["05", "Complete admission", "Submit documents, meet your college and secure your seat."],
            ].map(([number, title, description]) => (
              <div className="timeline-step" key={number}>
                <span className="timeline-number">{number}</span>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-2 max-w-48 text-sm leading-6 text-white/65">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Start a conversation</p>
          <h2 className="section-title">Your counselor is just one message away.</h2>
          <p className="mt-5 max-w-md leading-7 text-slate-600">
            Share a few details and we’ll connect you with a specialist for your course and city.
          </p>
          <div className="mt-8 flex gap-3">
            <a className="contact" href="https://wa.me/919039220551" target="_blank" rel="noopener noreferrer">
              <MessageCircle />
              WhatsApp
            </a>
            <a className="contact" href="tel:+919039220551">
              <Phone />
              Call
            </a>
          </div>
        </div>
        <form onSubmit={enquire} className="rounded-3xl bg-mint p-7 sm:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="name" label="Your name" required />
            <Field name="phone" label="Phone number" required />
            <Field name="email" label="Email address" required />
            <Field name="course" label="Preferred course" required />
            <Field name="city" label="Your city" required />
          </div>
          <button className="mt-7 w-full rounded-2xl bg-ink py-4 font-bold text-white">
            {sent ? "Request received — we’ll be in touch!" : "Get free guidance"}
          </button>
        </form>
      </section>

      {/* Elegant Testimonials & Feedback Section */}
      <section id="testimonials" className="border-t border-slate-100 bg-[#f8faf7] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            
            {/* Left: Testimonials Showcase */}
            <div>
              <p className="eyebrow">Student Stories</p>
              <h2 className="section-title mt-2">What students say about campusbridge</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                Real reviews from students who navigated their college choices with our counseling journey.
              </p>

              <div className="mt-8">
                {marqueeTestimonials.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {marqueeTestimonials.map((item, index) => (
                      <article key={`${item.name}-${index}`} className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
                        <div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: item.rating }).map((_, starIndex) => (
                              <Star key={starIndex} size={15} fill="currentColor" />
                            ))}
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">“{item.review}”</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                          <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs font-bold text-ink">{item.name}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    No testimonials yet. Be the first to share your experience below.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Elegant Feedback Form Card */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-950/5">
              <h3 className="text-xl font-extrabold text-ink">Share your experience</h3>
              <p className="mt-1 text-xs text-slate-500">Your feedback helps fellow students make informed college decisions.</p>

              <form onSubmit={submitFeedback} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Your Name</label>
                  <input
                    name="name"
                    required
                    placeholder="Enter your name"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Your Feedback</label>
                  <textarea
                    name="review"
                    required
                    rows={3}
                    placeholder="Share how campusbridge helped your search..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Rating</label>
                  <div className="mt-1.5 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        className={`rounded-full p-1 transition ${value <= rating ? "text-amber-500" : "text-slate-300"}`}
                        onClick={() => setRating(value)}
                      >
                        <Star size={20} fill={value <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                    <span className="ml-auto text-xs font-bold text-amber-600">{rating} / 5</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-ink py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  {feedbackSent ? "Thanks for your review!" : "Submit feedback"}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
