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
            alt={slide.name ?? "University  nexteduwise"}
            loading={index === 0 ? "eager" : "lazy"}
            className={`slide ${active % slides.length === index ? "is-active" : ""}`}
          />
        ))}
      </div>

      {/* College name for the current background image — bottom-right corner */}
      {current?.name && (
        <div className="absolute bottom-4 right-4 z-10 rounded-2xl border border-white/20 bg-black/45 px-4 py-2.5 text-right backdrop-blur-sm sm:bottom-6 sm:right-6">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-lime">
            Featured college
          </p>
          <p className="max-w-[240px] truncate text-sm font-extrabold text-white sm:text-base">
            {current.name}
          </p>
        </div>
      )}

      <div className="relative mx-auto flex w-full flex-col items-center justify-between pb-24 pt-16 text-center sm:pt-24">
      {/* Eyebrow pill  */}
        <div className="float-pill inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-lime backdrop-blur-sm">
          <Sparkles size={14} />
          Verified Colleges · 1:1 Guidance · Zero-Cost Counseling
        </div>

        {/* Headline   */}
        <div className="mt-6 max-w-3xl">
          <h1 className="text-center text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Your path to the right college,{" "}
            <em className="font-serif font-normal text-lime">made simpler.</em>
          </h1>
          <p className="mt-6 text-center text-xl font-semibold text-white/95 sm:text-2xl">
            <span className="text-white/70">nexteduwise helps you </span>
            <span className="text-lime">{text}</span>
            <span className="typewriter-caret" aria-hidden="true" />
          </p>
          <p className="text-center mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Search trusted colleges, compare fees &amp; cutoffs, and get a counselor who
            understands your goals — all in one place.
          </p>
        </div>

        <div className="mt-14" />
      </div>
    </section>
  );
}