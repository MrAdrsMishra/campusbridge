import React from "react";
import { HOW_STEPS } from "../../data/landingData";

export function HowItWorks() {
  return (
    <section id="how" className="bg-ink py-12 sm:py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-xs font-bold uppercase tracking-wider text-lime">Guidance that stays personal</p>
            <h2 className="section-title text-xl sm:text-3xl font-extrabold max-w-xl text-white">
              From discovery to admission — with you at every step.
            </h2>
          </div>
          <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-white/60">
            Five simple steps. One dedicated counselor. No guesswork, no missed deadlines.
          </p>
        </div>

        <div className="timeline mt-8 sm:mt-14">
          {HOW_STEPS.map((step) => (
            <div className="timeline-step" key={step.number}>
              <span className="timeline-number">
                <span aria-hidden="true">{step.icon}</span>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[.18em] text-lime">
                  Step {step.number}
                </p>
                <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-1.5 max-w-full md:max-w-48 text-xs sm:text-sm leading-relaxed text-white/70">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}