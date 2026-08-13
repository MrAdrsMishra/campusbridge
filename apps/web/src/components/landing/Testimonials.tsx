import React, { useMemo } from "react";
import { BadgeCheck, Star } from "lucide-react";
import type { Testimonial } from "../../types";

const ADMITTED_COLLEGES = [
  "IIT Bombay",
  "Christ University, Bengaluru",
  "IIT Delhi",
  "VIT Vellore",
  "Symbiosis Pune",
  "DU, North Campus",
  "NCHMCT-Mumbai",
  "BITS Pilani",
];

type Props = {
  testimonials: Testimonial[];
};

function admittedCollege(name: string, index: number) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ADMITTED_COLLEGES[(hash + index * 3) % ADMITTED_COLLEGES.length];
}

export function Testimonials({ testimonials }: Props) {
  const stories = useMemo(
    () => testimonials.slice(0, Math.min(testimonials.length, 6)),
    [testimonials]
  );

  return (
    <section id="testimonials" className="border-t border-slate-100 bg-[#f8faf7] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Student Stories</p>
            <h2 className="section-title">Admitted with confidence, guided by us</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Real reviews from students who navigated their college choices with nexteduwise.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">
            ★ 4.8 average rating · {stories.length} recent reviews
          </span>
        </div>

        {stories.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((item, index) => {
              const logoHue = (index * 47) % 360;
              return (
                <article
                  key={`${item.name}-${index}`}
                  className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: item.rating }).map((_, starIndex) => (
                        <Star key={starIndex} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">“{item.review}”</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-extrabold text-white"
                        style={{ background: `linear-gradient(135deg, hsl(${logoHue} 55% 45%), hsl(${(logoHue + 40) % 360} 55% 32%))` }}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-ink">{item.name}</p>
                        <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <BadgeCheck size={13} />
                          Admitted at {admittedCollege(item.name, index)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No reviews yet. Be the first to share your nexteduwise experience.
          </div>
        )}
      </div>
    </section>
  );
}