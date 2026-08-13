import React, { useEffect, useState } from "react";
import { GraduationCap, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { HERO_SLIDES, TYPED_PHRASES, TRUST_BADGES } from "../../data/landingData";
import { useTypewriter } from "../../hooks/useTypewriter";

const SLIDE_MS = 5000;

export function HeroSection({
  onFind,
}: {
  onFind: (filters: { city: string; name: string; state: string; course: string }) => void;
}) {
  const [active, setActive] = useState(0);
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [course, setCourse] = useState("");
  const { text } = useTypewriter(TYPED_PHRASES);

  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % HERO_SLIDES.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-ink">
      {/* Crossfading slideshow */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="University  nexteduwise"
            loading={index === 0 ? "eager" : "lazy"}
            className={`slide ${active === index ? "is-active" : ""}`}
          />
        ))}
       </div>

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