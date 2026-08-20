import React, { useEffect } from "react";
import type { CollegeDetailView } from "../types";
import { generateFaqs } from "./seoUtils";

interface Props {
  college: CollegeDetailView;
  currentCourse: string;
}

/**
 * CollegeFaqSection
 * -----------------
 * Renders a semantic FAQ accordion for a college detail page.
 *
 * - Uses <details>/<summary> for native, JS-free open/close behaviour.
 * - Injects FAQPage JSON-LD into <head> via useEffect for structured data.
 * - Content is deterministically generated from the college's actual data so
 *   every page has unique, context-specific questions.
 */
export function CollegeFaqSection({ college, currentCourse }: Props) {
  const faqs = generateFaqs(college, currentCourse);

  // Inject / remove FAQPage JSON-LD on mount/unmount
  useEffect(() => {
    if (faqs.length === 0) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    const scriptEl = document.createElement("script");
    scriptEl.type = "application/ld+json";
    scriptEl.id = "faq-jsonld";
    scriptEl.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptEl);

    return () => {
      document.getElementById("faq-jsonld")?.remove();
    };
    // We intentionally depend only on the college name so the script is not
    // re-injected on every render; FAQ content is stable per college.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [college.name]);

  if (faqs.length === 0) return null;

  return (
    <section
      aria-labelledby="faq-heading"
      className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Section header */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          Frequently Asked Questions
        </p>
        <h2
          id="faq-heading"
          className="mt-1 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl"
        >
          Common questions about {college.name}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Find quick answers about admissions, courses, fees and more.
        </p>
      </div>

      {/* FAQ accordion list */}
      <div className="divide-y divide-slate-100">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group py-4 first:pt-0 last:pb-0"
          >
            <summary
              className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-slate-800 marker:hidden [&::-webkit-details-marker]:hidden hover:text-emerald-700 transition-colors"
            >
              <span>{faq.question}</span>
              {/* Chevron icon — rotates on open */}
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 group-open:rotate-180 group-open:bg-emerald-50 group-open:text-emerald-700"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </summary>

            {/* Answer — shown when details is open */}
            <div className="mt-3 pr-8 text-sm leading-7 text-slate-600">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>

      {/* Subtle CTA at the bottom */}
      <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4">
        <p className="text-xs font-semibold text-emerald-800">
          Still have questions?{" "}
          <a
            href="/#lead-capture"
            className="underline underline-offset-2 hover:text-emerald-900"
          >
            Talk to a free counsellor
          </a>{" "}
          — no fees, no pressure.
        </p>
      </div>
    </section>
  );
}
