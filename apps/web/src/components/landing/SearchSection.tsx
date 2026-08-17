import React, { useMemo, useState } from "react";
import { Building2, ChevronDown, MapPin, Search, ShieldCheck } from "lucide-react";
import type { CitySuggestion, Filters } from "../../types";
import { FEATURED_COLLEGE_NAMES, SEARCH_CATEGORIES, SEARCH_STATES } from "../../data/landingData";

type Props = {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onSearch: () => void;
  onPickCity: (name: string) => void;
  citySuggestions: CitySuggestion[];
  loading: boolean;
};

function Dropdown({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value || label;
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        className={`flex h-11 sm:h-12 w-full items-center gap-2 rounded-2xl border px-3.5 text-left text-xs sm:text-sm transition ${
          value
            ? "border-emerald-500 ring-2 ring-emerald-100 bg-white text-ink font-semibold"
            : "border-slate-200 bg-white text-slate-400"
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 truncate font-semibold">{selected}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option === "All Categories" || option === "All States" ? "" : option);
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition hover:bg-emerald-50 ${
                selected === option ? "font-bold text-emerald-700" : "text-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchSection({ filters, onFilterChange, onSearch, onPickCity, citySuggestions, loading }: Props) {
  const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [cityError, setCityError] = useState(false);

  const collegeMatches = useMemo(() => {
    const query = filters.name.trim().toLowerCase();
    if (query.length < 2) return [];
    return FEATURED_COLLEGE_NAMES.filter((name) => name.toLowerCase().includes(query)).slice(0, 5);
  }, [filters.name]);

  return (
    <section id="colleges" className="mx-auto max-w-7xl scroll-mt-20 px-3.5 sm:px-6 py-8 sm:py-14">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-xs font-bold uppercase tracking-wider text-emerald-700">Advanced College Search</p>
          <h2 className="section-title text-xl sm:text-3xl font-extrabold text-ink">Find the right college in minutes</h2>
          <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
            Filter by course category, state, college name or city. Compare rank, cutoff, fees
            and deadlines across verified nexteduwisees — Collegedunia-style.
          </p>
        </div>
      </div>

      {/* Search Controls Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // A course-only search can't run without a city — flag it in the UI.
          setCityError(Boolean(filters.course) && !filters.city.trim());
          onSearch();
        }}
        className="mt-5 sm:mt-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-lg shadow-emerald-950/5"
      >
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3.5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr_1fr_auto]">
          <Dropdown
            label="Course Category"
            icon={<ShieldCheck size={17} className="text-emerald-600" />}
            value={filters.course}
            options={SEARCH_CATEGORIES}
            onChange={(v) => onFilterChange("course", v)}
          />
          <Dropdown
            label="State"
            icon={<MapPin size={17} className="text-emerald-600" />}
            value={filters.state}
            options={SEARCH_STATES}
            onChange={(v) => onFilterChange("state", v)}
          />

          {/* College name with autocomplete */}
          <div className="relative w-full">
            <label className="flex h-11 sm:h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 text-slate-400 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
              <Building2 size={17} className="shrink-0 text-emerald-600" />
              <input
                value={filters.name}
                onChange={(e) => {
                  onFilterChange("name", e.target.value);
                  setShowCollegeSuggestions(Boolean(e.target.value.trim()));
                }}
                onFocus={() => setShowCollegeSuggestions(Boolean(filters.name.trim()))}
                onBlur={() => window.setTimeout(() => setShowCollegeSuggestions(false), 150)}
                placeholder="College name (autocomplete)"
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
              />
            </label>
            {showCollegeSuggestions && collegeMatches.length > 0 && (
              <div className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Suggested colleges
                </p>
                {collegeMatches.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onFilterChange("name", name);
                      setShowCollegeSuggestions(false);
                    }}
                    className="flex w-full items-start rounded-xl px-3 py-2 text-left text-xs sm:text-sm text-slate-700 transition hover:bg-emerald-50"
                  >
                    <Building2 size={14} className="mr-2 mt-0.5 shrink-0 text-emerald-600" />
                    <span className="truncate">{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City with Mapbox suggestions */}
          <div className="relative w-full">
            <label className={`flex h-11 sm:h-12 items-center gap-2 rounded-2xl border px-3.5 text-slate-400 focus-within:ring-2 ${
              cityError
                ? "border-amber-400 bg-amber-50/40 focus-within:border-amber-400 focus-within:ring-amber-100"
                : "border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-emerald-100"
            }`}>
              <MapPin size={17} className="shrink-0 text-emerald-600" />
              <input
                value={filters.city}
                onChange={(e) => {
                  onFilterChange("city", e.target.value);
                  setCityError(false);
                  setShowCitySuggestions(Boolean(e.target.value.trim()));
                }}
                onFocus={() => setShowCitySuggestions(Boolean(filters.city.trim()))}
                onBlur={() => window.setTimeout(() => setShowCitySuggestions(false), 150)}
                placeholder={filters.course ? "City (required for course search)" : "City (e.g. Pune)"}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-ink outline-none placeholder:text-slate-400"
              />
              {filters.course && !cityError && (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                  Required
                </span>
              )}
            </label>
            {cityError && (
              <p className="mt-1 text-[11px] font-semibold text-amber-700">
                No city selected — showing a default city. Pick one to personalize your results.
              </p>
            )}
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-40 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Suggested cities
                </p>
                {citySuggestions.map((suggestion) => (
                  <button
                    key={suggestion.mapbox_id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onPickCity(suggestion.name);
                      setShowCitySuggestions(false);
                    }}
                    className="flex w-full items-start rounded-xl px-3 py-2 text-left text-xs sm:text-sm text-slate-700 transition hover:bg-emerald-50"
                  >
                    <MapPin size={14} className="mr-2 mt-0.5 shrink-0 text-emerald-600" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{suggestion.name}</span>
                      <span className="block truncate text-xs text-slate-500">{suggestion.full_address}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-7 text-xs sm:text-sm font-bold text-white transition active:scale-[0.98] hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 xl:w-auto"
          >
            <Search size={17} />
            <span>{loading ? "Searching..." : "Find Colleges"}</span>
          </button>
        </div>
      </form>

      <p className="mt-3 sm:mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <ShieldCheck size={15} className="shrink-0 text-emerald-600" />
        <span>Results ranked from verified partner colleges for your selected category — updated live from our database.</span>
      </p>
    </section>
  );
}