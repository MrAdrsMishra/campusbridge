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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition ${
          value
            ? "border-emerald-300 bg-white text-ink"
            : "border-slate-200 bg-white text-slate-400"
        }`}
      >
        {icon}
        <span className="flex-1 truncate font-semibold">{selected}</span>
        <ChevronDown size={16} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 max-h-64 w-full min-w-44 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
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

  const collegeMatches = useMemo(() => {
    const query = filters.name.trim().toLowerCase();
    if (query.length < 2) return [];
    return FEATURED_COLLEGE_NAMES.filter((name) => name.toLowerCase().includes(query)).slice(0, 5);
  }, [filters.name]);

  return (
    <section id="colleges" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-14">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Advanced College Search</p>
          <h2 className="section-title">Find the right college in minutes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Filter by course category, state, college name or city. Compare rank, cutoff, fees
            and deadlines across verified  nexteduwisees — Collegedunia-style.
          </p>
        </div>
      </div>

      {/* Search Controls Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="mt-8 rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-emerald-950/5 sm:p-5"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr_1fr_auto]">
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
          <div className="relative">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-slate-400">
              <Building2 size={17} />
              <input
                value={filters.name}
                onChange={(e) => {
                  onFilterChange("name", e.target.value);
                  setShowCollegeSuggestions(Boolean(e.target.value.trim()));
                }}
                onFocus={() => setShowCollegeSuggestions(Boolean(filters.name.trim()))}
                onBlur={() => window.setTimeout(() => setShowCollegeSuggestions(false), 150)}
                placeholder="College name (autocomplete)"
                className="w-full bg-transparent py-2.5 text-sm font-semibold text-ink outline-none"
              />
            </label>
            {showCollegeSuggestions && collegeMatches.length > 0 && (
              <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
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
                    className="flex w-full items-start rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-emerald-50"
                  >
                    <Building2 size={14} className="mr-2 mt-0.5 shrink-0 text-emerald-600" />
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City with Mapbox suggestions */}
          <div className="relative">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-slate-400">
              <MapPin size={17} />
              <input
                value={filters.city}
                onChange={(e) => {
                  onFilterChange("city", e.target.value);
                  setShowCitySuggestions(Boolean(e.target.value.trim()));
                }}
                onFocus={() => setShowCitySuggestions(Boolean(filters.city.trim()))}
                onBlur={() => window.setTimeout(() => setShowCitySuggestions(false), 150)}
                placeholder="City (e.g. Pune)"
                className="w-full bg-transparent py-2.5 text-sm font-semibold text-ink outline-none"
              />
            </label>
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
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
                    className="flex w-full items-start rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-emerald-50"
                  >
                    <MapPin size={14} className="mr-2 mt-0.5 shrink-0 text-emerald-600" />
                    <span>
                      <span className="block font-semibold">{suggestion.name}</span>
                      <span className="block text-xs text-slate-500">{suggestion.full_address}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-7 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={17} />
            {loading ? "Searching..." : "Find Colleges"}
          </button>
        </div>
      </form>

      <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <ShieldCheck size={15} className="text-emerald-600" />
        Results ranked from verified partner colleges for your selected category — updated live
        from our database.
      </p>
    </section>
  );
}