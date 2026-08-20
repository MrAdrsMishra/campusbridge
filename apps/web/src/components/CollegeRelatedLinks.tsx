import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Compass } from "lucide-react";
import type { CollegeDetailView } from "../types";
import { generateRelatedLinks } from "./seoUtils";

interface Props {
  college: CollegeDetailView;
  currentCourse: string;
}

/**
 * CollegeRelatedLinks
 * -------------------
 * "Explore More" section with internal links to course×city combinations.
 *
 * Links navigate to `/colleges?course=X&city=Y` — a real, crawlable URL that
 * renders the HomePage with the search pre-filled. This allows search engines
 * to discover related content via genuine hyperlinks.
 *
 * Generation rules (see seoUtils.ts):
 *  - Same course in 3–4 other popular cities
 *  - Same city with 2–3 related courses
 *  - Private / Government qualifiers
 *  - Self-links (current course + city) are always filtered out
 *  - Maximum 10 links
 */
export function CollegeRelatedLinks({ college, currentCourse }: Props) {
  const links = generateRelatedLinks(college, currentCourse);

  if (links.length === 0) return null;

  const city = college.address.city ?? "";

  return (
    <section
      aria-labelledby="related-links-heading"
      className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm sm:p-8"
    >
      {/* Section header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Compass size={18} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Explore More
          </p>
          <h2
            id="related-links-heading"
            className="mt-0.5 text-lg font-extrabold text-slate-900 sm:text-xl"
          >
            {city
              ? `Related Colleges Near ${city} & Beyond`
              : "Related College Searches"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Discover top colleges by course and location — browse similar options.
          </p>
        </div>
      </div>

      {/* Link grid */}
      <ul
        role="list"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span className="leading-snug">{link.label}</span>
              <ArrowUpRight
                size={15}
                className="ml-2 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer note */}
      <p className="mt-4 text-xs text-slate-400">
        All searches are powered by verified college data across India.
      </p>
    </section>
  );
}
