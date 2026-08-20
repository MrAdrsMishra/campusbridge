import React, { useEffect } from "react";

/**
 * HomeFaqSection
 * --------------
 * Platform-level FAQ section for the nexteduwise home page.
 *
 * Questions cover:
 *  - What nexteduwise does / how it works
 *  - How to find a college / course
 *  - Cost of counselling
 *  - Geographic coverage
 *  - Admission process
 *  - How to compare colleges
 *
 * JSON-LD FAQPage schema is injected into <head> for rich-result eligibility.
 */

const HOME_FAQS: { question: string; answer: string }[] = [
  {
    question: "What is nexteduwise and how does it help students?",
    answer:
      "nexteduwise is a free college discovery and admission guidance platform for Indian students. It helps you search verified colleges across India by course, city or state, compare fees and placements, and connect with a personal counsellor who guides you through the entire admission process — at no cost.",
  },
  {
    question: "Is nexteduwise's counselling service free?",
    answer:
      "Yes, completely free. nexteduwise offers zero-cost 1:1 admission counselling. Our counsellors are paid by partner colleges — never by students. You get personalised shortlisting, document guidance and deadline tracking without any hidden fees.",
  },
  {
    question: "Which courses and streams does nexteduwise cover?",
    answer:
      "nexteduwise covers all major streams: Engineering (B.Tech / M.Tech), Management (MBA / BBA), Medical (MBBS / BDS / BAMS), Science (B.Sc / M.Sc), Commerce (B.Com / M.Com), Law (LL.B / LL.M), Computer Applications (BCA / MCA), Architecture, Design, Pharmacy, Nursing, Education, Hospitality, and Vocational programs across India.",
  },
  {
    question: "Which cities and states does nexteduwise cover?",
    answer:
      "nexteduwise lists colleges across all major Indian states and cities including Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Pune, Bhopal, Indore, Jaipur, Lucknow, Kolkata, Ahmedabad and hundreds more. Search by city or state to find options near you.",
  },
  {
    question: "How do I search for a college on nexteduwise?",
    answer:
      "Use the search bar on the home page to filter colleges by course (e.g. B.Tech, MBA), city or college name. You can also browse by category — click on a course category card to view all matching colleges in your preferred location. Click any college card to see full details including courses, fees and student reviews.",
  },
  {
    question: "What entrance exams are covered — JEE, CAT, CUET?",
    answer:
      "nexteduwise covers admissions based on all major national and state entrance exams: JEE Main and Advanced (Engineering), CUET (central universities), CAT / MAT / CMAT / XAT (MBA), NEET (Medical), CLAT (Law), NATA (Architecture), and state-level CETs. Our counsellors help you understand which exams are needed for your target colleges.",
  },
  {
    question: "How can I talk to an admission counsellor?",
    answer:
      "Fill in the enquiry form on this page with your name, phone number, preferred course and city. A nexteduwise counsellor will reach out within 24 hours to understand your goals and provide personalised college shortlists, eligibility checks and application support.",
  },
  {
    question: "Are the colleges listed on nexteduwise verified?",
    answer:
      "Yes. College data on nexteduwise is sourced from Shiksha.com and College360 — two of India's largest verified college databases. All listed institutions are recognised by regulatory bodies such as UGC, AICTE, MCI or their state equivalents. Our counsellors also independently verify key details before guiding students.",
  },
];

const JSONLD_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export function HomeFaqSection() {
  // Inject FAQPage structured data into <head>
  useEffect(() => {
    const existing = document.getElementById("home-faq-jsonld");
    if (existing) existing.remove();

    const scriptEl = document.createElement("script");
    scriptEl.type = "application/ld+json";
    scriptEl.id = "home-faq-jsonld";
    scriptEl.textContent = JSON.stringify(JSONLD_SCHEMA);
    document.head.appendChild(scriptEl);

    return () => {
      document.getElementById("home-faq-jsonld")?.remove();
    };
  }, []);

  return (
    <section
      id="faq"
      aria-labelledby="home-faq-heading"
      className="border-t border-slate-100 bg-white py-10 sm:py-16"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="eyebrow text-xs font-bold uppercase tracking-[.18em] text-emerald-700">
            FAQ
          </p>
          <h2
            id="home-faq-heading"
            className="section-title mt-2 text-xl font-extrabold text-ink sm:text-3xl"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Everything you need to know about finding the right college with nexteduwise.
          </p>
        </div>

        {/* Accordion list */}
        <div className="divide-y divide-slate-100 rounded-3xl border border-emerald-100 bg-white shadow-sm">
          {HOME_FAQS.map((faq, idx) => (
            <details key={idx} className="group px-6 py-4 first:pt-5 last:pb-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-slate-800 marker:hidden [&::-webkit-details-marker]:hidden hover:text-emerald-700 transition-colors">
                <span className="leading-snug">{faq.question}</span>
                {/* Chevron — rotates on open */}
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 group-open:rotate-180 group-open:bg-emerald-50 group-open:text-emerald-700"
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

              {/* Answer */}
              <div className="mt-3 pr-9 text-sm leading-7 text-slate-600">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-4">
          <p className="text-sm text-slate-500">Still have a question?</p>
          <a
            href="#lead-capture"
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-900"
          >
            Talk to a free counsellor
          </a>
        </div>
      </div>
    </section>
  );
}
