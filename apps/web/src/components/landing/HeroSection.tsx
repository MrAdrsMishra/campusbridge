import React, { useEffect, useMemo, useState } from "react";
import { GraduationCap, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { HERO_SLIDES, TYPED_PHRASES, TRUST_BADGES } from "../../data/landingData";
import { useTypewriter } from "../../hooks/useTypewriter";
import type { CollegeListItem } from "../../types";
import { fullImageUrl } from "../ui";

const SLIDE_MS = 5000;

export function HeroSection({
  onFind,
  colleges = [],
}: {
  onFind: (filters: { city: string; name: string; state: string; course: string }) => void;
  colleges?: CollegeListItem[];
}) {
  const [active, setActive] = useState(0);
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [course, setCourse] = useState("");
  const { text } = useTypewriter(TYPED_PHRASES);

  // Background slides come from the colleges' header images, so the hero shows real
  // campus photos with the college name in the corner. Falls back to the generic
  // HERO_SLIDES when no college has a header image yet.
  const slides = useMemo(() => {
    const collegeSlides = colleges
      .filter((c) => c.headerImage)
      .map((c) => ({ image: fullImageUrl(c.headerImage) ?? "", name: c.name }));
    if (collegeSlides.length > 0) return collegeSlides;
    return HERO_SLIDES.map((src) => ({ image: src, name: null }));
  }, [colleges]);

  const current = slides[active % slides.length];

  useEffect(() => {
    if (slides.length === 0) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);


  return (
  <section id="top" className="relative overflow-hidden bg-ink">
    {/* Crossfading slideshow */}
    <div className="absolute inset-0">
      {slides.map((slide, index) => (
        <img
          key={index}
          src={slide.image}
          alt={slide.name ?? "University nexteduwise"}
          loading={index === 0 ? "eager" : "lazy"}
          className={`slide ${
            active % slides.length === index ? "is-active" : ""
          } h-full w-full object-cover object-center`}
        />
      ))}
    </div>

    {/* Dark overlay — helps text stay readable on mobile */}
    <div className="absolute inset-0 bg-black/35" />

    {/* Featured college badge */}
    {current?.name && (
      <div className="absolute top-3 right-3 z-10 max-w-[160px] rounded-xl border border-white/20 bg-black/50 px-2.5 py-1.5 text-right backdrop-blur-md sm:bottom-6 sm:top-auto sm:right-6 sm:max-w-[260px] sm:rounded-2xl sm:px-4 sm:py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[.14em] text-lime sm:text-[10px] sm:tracking-[.16em]">
          Featured college
        </p>

        <p className="truncate text-[10px] font-extrabold text-white sm:text-sm">
          {current.name}
        </p>
      </div>
    )}

    {/* Hero content */}
    <div className="relative z-10 mx-auto flex w-full flex-col items-center px-4 pb-12 pt-8 text-center sm:px-6 sm:pb-24 sm:pt-20">
      {/* Eyebrow pill */}
      <div className="float-pill inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-lime backdrop-blur-md sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[.18em]">
        <Sparkles size={13} className="shrink-0 text-lime" />
        <span className="text-center">
          Verified Colleges · 1:1 Guidance · Zero-Cost Counseling
        </span>
      </div>

      {/* Headline */}
      <div className="mt-4 w-full max-w-3xl sm:mt-6">
        <h1 className="text-center text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your path to the right college,{" "}
          <em className="font-serif font-normal text-lime">
            made simpler.
          </em>
        </h1>

        {/* Typewriter */}
        <p className="mt-3 flex flex-wrap items-center justify-center text-center text-sm font-semibold text-white/95 sm:mt-6 sm:text-2xl min-h-[32px]">
          <span className="text-white/80">nexteduwise helps you&nbsp;</span>
          <span className="text-lime font-extrabold">{text}</span>
          <span className="typewriter-caret ml-0.5" aria-hidden="true" />
        </p>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-[340px] text-center text-xs leading-relaxed text-white/80 sm:mt-4 sm:max-w-2xl sm:text-lg sm:leading-7">
          Search trusted colleges, compare fees &amp; cutoffs, and get a
          counselor who understands your goals — all in one place.
        </p>
      </div>

      <div className="mt-4 sm:mt-10" />
    </div>
  </section>
);
}