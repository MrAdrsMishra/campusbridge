import React from "react";
import { HOW_STEPS } from "../../data/landingData";

export function HowItWorks() {
  return (
    <section id="how" className="bg-ink py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-lime">Guidance that stays personal</p>
            <h2 className="section-title max-w-xl text-white">
              From discovery to admission — with you at every step.
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm leading-6 text-white/60 md:block">
            Five simple steps. One dedicated counselor. No guesswork, no missed deadlines.
          </p>
        </div>

        <div className="timeline mt-14">
          {HOW_STEPS.map((step) => (
            <div className="timeline-step" key={step.number}>
              <span className="timeline-number">
                <span aria-hidden="true">{step.icon}</span>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-lime">
                  Step {step.number}
                </p>
                <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 max-w-48 text-sm leading-6 text-white/65">
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