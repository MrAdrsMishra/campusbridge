import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { useLocationPopupStore } from "../stores/locationPopupStore";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type CityOption = {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  displayName?: string;
};

type SavedLocation = {
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    state_district?: string;
    country?: string;
    country_code?: string;
  };
};

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const LOCATION_POPUP_SHOWN_KEY = "nexteduwise_location_popup_shown";

const PREFERRED_LOCATION_KEY = "nexteduwise_preferred_location";

const USER_ACTIVITY_KEY = "nexteduwise_user_activity";

const POPUP_DELAY = 50_000;

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const REVERSE_GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse";

const popularCities: CityOption[] = [
  {
    city: "Bhopal",
    state: "Madhya Pradesh",
    country: "India",
  },
  {
    city: "Indore",
    state: "Madhya Pradesh",
    country: "India",
  },
  {
    city: "Delhi",
    state: "Delhi",
    country: "India",
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
  },
  {
    city: "Pune",
    state: "Maharashtra",
    country: "India",
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
  },
];

/* -------------------------------------------------------------------------- */
/*                              Helper functions                              */
/* -------------------------------------------------------------------------- */

function getCityFromAddress(address?: NominatimResult["address"]) {
  if (!address) return "";

  return (
    address.city ||
    address.town ||
    address.municipality ||
    address.village ||
    address.county ||
    ""
  );
}

function getStateFromAddress(address?: NominatimResult["address"]) {
  if (!address) return "";

  return address.state || address.state_district || "";
}

function safelyParseJson<T>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                         Reverse geocoding helper                           */
/* -------------------------------------------------------------------------- */

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<SavedLocation> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "json",
    addressdetails: "1",
    zoom: "10",
  });

  const response = await fetch(`${REVERSE_GEOCODE_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to determine your location.");
  }

  const data = (await response.json()) as NominatimResult;

  const city = getCityFromAddress(data.address);

  if (!city) {
    throw new Error("We couldn't determine your city from your location.");
  }

  return {
    city,
    state: getStateFromAddress(data.address),
    country: data.address?.country || "",
    latitude,
    longitude,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Main component                                */
/* -------------------------------------------------------------------------- */

export function DesiredLocationPopup() {
  const {
    isOpen,
    open: openPopup,
    close: closePopup,
  } = useLocationPopupStore();

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ------------------------------------------------------------------------ */
  /*                    Open popup after 50 seconds                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (sessionStorage.getItem(LOCATION_POPUP_SHOWN_KEY) === "true") {
      return;
    }

    /*
     * If the user already selected a location previously,
     * don't bother showing the popup.
     */
    if (sessionStorage.getItem(PREFERRED_LOCATION_KEY)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      /*
       * Check one more time in case another component
       * changed sessionStorage during these 50 seconds.
       */
      if (sessionStorage.getItem(LOCATION_POPUP_SHOWN_KEY) === "true") {
        return;
      }

      /*
       * Mark as shown BEFORE opening.
       *
       * This guarantees that closing/dismissing the popup
       * doesn't cause it to appear again.
       */
      sessionStorage.setItem(LOCATION_POPUP_SHOWN_KEY, "true");

      openPopup();
    }, POPUP_DELAY);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [openPopup]);

  /* ------------------------------------------------------------------------ */
  /*                         Search city autocomplete                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!search.trim()) {
      setShowSuggestions(false);
      return;
    }

    if (selectedCity) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setShowSuggestions(true);
      } catch {
        // Search errors are intentionally ignored.
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, selectedCity]);

  /*
   * We use Nominatim directly for city suggestions.
   *
   * For production/high traffic, move this request
   * behind your backend.
   */
  const [remoteCities, setRemoteCities] = useState<CityOption[]>([]);

  useEffect(() => {
    const query = search.trim();

    if (!query || selectedCity) {
      setRemoteCities([]);
      return;
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "6",
          countrycodes: "in",
        });

        const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("City search failed");
        }

        const data = (await response.json()) as NominatimResult[];

        const cities: CityOption[] = data
          .map((item) => {
            const city = getCityFromAddress(item.address);

            const state = getStateFromAddress(item.address);

            return {
              city,
              state,
              country: item.address?.country || "India",
              latitude: Number(item.lat),
              longitude: Number(item.lon),
              displayName: item.display_name,
            };
          })
          .filter((item) => item.city);

        setRemoteCities(cities);
        setShowSuggestions(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        setRemoteCities([]);
      }
    }, 350);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search, selectedCity]);

  /* ------------------------------------------------------------------------ */
  /*                           Search suggestions                             */
  /* ------------------------------------------------------------------------ */

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query || selectedCity) {
      return [];
    }

    /*
     * First show matching popular cities.
     */
    const popularMatches = popularCities.filter((item) =>
      `${item.city} ${item.state}`.toLowerCase().includes(query),
    );

    /*
     * Then remote results.
     */
    const remoteMatches = remoteCities.filter(
      (remote) =>
        !popularMatches.some(
          (popular) =>
            popular.city.toLowerCase() === remote.city.toLowerCase() &&
            popular.state.toLowerCase() === remote.state.toLowerCase(),
        ),
    );

    return [...popularMatches, ...remoteMatches].slice(0, 6);
  }, [search, remoteCities, selectedCity]);

  /* ------------------------------------------------------------------------ */
  /*                          Select a city                                   */
  /* ------------------------------------------------------------------------ */

  const handleSelectCity = (option: CityOption) => {
    setSelectedCity(option);
    setSearch(option.city);
    setShowSuggestions(false);
    setError("");
  };

  /* ------------------------------------------------------------------------ */
  /*                     Use browser current location                         */
  /* ------------------------------------------------------------------------ */

  const handleUseCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Location services are not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          /*
           * Coordinates received from browser.
           */
          console.log({
            latitude,
            longitude,
          });

          /*
           * Convert coordinates into city/state.
           */
          const location = await reverseGeocode(latitude, longitude);

          const cityOption: CityOption = {
            city: location.city,
            state: location.state,
            country: location.country,
            latitude: location.latitude || 0,
            longitude: location.longitude || 0,
          };

          setSelectedCity(cityOption);
          setSearch(location.city);
          setShowSuggestions(false);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to determine your city.",
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (geoError) => {
        setLocationLoading(false);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError(
              "Location access was denied. You can search for your city instead.",
            );
            break;

          case geoError.POSITION_UNAVAILABLE:
            setError(
              "Your location could not be determined. Please search for your city.",
            );
            break;

          case geoError.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;

          default:
            setError("Unable to determine your location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                            Save location                                 */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async () => {
    if (!selectedCity) {
      setError("Please select a city to continue.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const location: SavedLocation = {
        city: selectedCity.city,
        state: selectedCity.state,
        country: selectedCity.country,
        latitude: selectedCity.latitude ?? null,
        longitude: selectedCity.longitude ?? null,
      };

      /*
       * Persist location for future visits.
       */
      sessionStorage.setItem(PREFERRED_LOCATION_KEY, JSON.stringify(location));

      /*
       * Update your existing session activity.
       *
       * This keeps the location available to your
       * counselor popup as well.
       */
      try {
        const existing =
          safelyParseJson<Record<string, unknown>>(
            sessionStorage.getItem(USER_ACTIVITY_KEY),
          ) ?? {};

        sessionStorage.setItem(
          USER_ACTIVITY_KEY,
          JSON.stringify({
            ...existing,

            city: location.city,

            state: location.state,

            latitude: location.latitude,

            longitude: location.longitude,

            locationSource:
              selectedCity.latitude != null && selectedCity.longitude != null
                ? "detected_or_autocomplete"
                : "manual",

            locationUpdatedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // Session storage failure should not block submission.
      }

      /*
       * Close popup.
       */
      closePopup();

      /*
       * IMPORTANT:
       *
       * This is where you should connect your
       * college search/filter state.
       *
       * Example:
       *
       * setPreferredLocation(location);
       *
       * OR:
       *
       * fetchColleges({
       *   city: location.city,
       *   latitude: location.latitude,
       *   longitude: location.longitude,
       * });
       */
    } catch {
      setError("Something went wrong while saving your location.");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                            Dismiss popup                                 */
  /* ------------------------------------------------------------------------ */

  const handleClose = () => {
    closePopup();
  };

  /* ------------------------------------------------------------------------ */
  /*                         Don't render closed                              */
  /* ------------------------------------------------------------------------ */

  if (!isOpen) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /*                                  UI                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="
        fixed inset-0 z-[60]
        flex items-center justify-center
        bg-slate-950/60
        p-4
        backdrop-blur-sm
        transition-all
      "
      onClick={handleClose}
    >
      <div
        className="
          relative
          w-full
          max-w-lg
          overflow-hidden
          rounded-3xl
          border
          border-emerald-100
          bg-white
          shadow-2xl
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
        onClick={(event) => event.stopPropagation()}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Close button                                                     */}
        {/* ---------------------------------------------------------------- */}

        <button
          type="button"
          onClick={handleClose}
          className="
            absolute
            right-5
            top-5
            z-20
            rounded-full
            p-2
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-700
          "
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="px-7 pb-5 pt-8">
          <div
            className="
              mb-5
              grid
              h-14
              w-14
              place-items-center
              rounded-2xl
              bg-emerald-50
              text-emerald-600
            "
          >
            <MapPin size={28} />
          </div>

          <h2
            className="
              pr-10
              text-2xl
              font-extrabold
              leading-tight
              text-ink
              sm:text-3xl
            "
          >
            Where do you want to study?
          </h2>

          <p
            className="
              mt-2
              max-w-md
              text-sm
              leading-6
              text-slate-600
            "
          >
            Tell us your preferred location and we'll show you colleges that
            match your plans.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* City search                                                      */}
        {/* ---------------------------------------------------------------- */}

        <div className="px-7">
          <div className="relative">
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/60
                px-4
                transition
                focus-within:border-emerald-500
                focus-within:bg-white
                focus-within:ring-2
                focus-within:ring-emerald-100
              "
            >
              <Search
                size={18}
                className="
                  shrink-0
                  text-slate-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedCity(null);
                  setError("");
                }}
                onFocus={() => {
                  if (search.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Search your preferred city..."
                autoComplete="off"
                className="
                  h-14
                  w-full
                  bg-transparent
                  text-sm
                  text-ink
                  outline-none
                  placeholder:text-slate-400
                "
              />

              {selectedCity && (
                <Check
                  size={18}
                  className="
                    shrink-0
                    text-emerald-600
                  "
                />
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Autocomplete dropdown                                        */}
            {/* ------------------------------------------------------------ */}

            {showSuggestions && suggestions.length > 0 && !selectedCity && (
              <div
                className="
                    absolute
                    left-0
                    right-0
                    top-[calc(100%+8px)]
                    z-30
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-2
                    shadow-xl
                  "
              >
                {suggestions.map((option, index) => (
                  <button
                    key={`${option.city}-${option.state}-${index}`}
                    type="button"
                    onClick={() => handleSelectCity(option)}
                    className="
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-left
                          transition
                          hover:bg-emerald-50
                        "
                  >
                    <div
                      className="
                            grid
                            h-9
                            w-9
                            shrink-0
                            place-items-center
                            rounded-xl
                            bg-slate-100
                            text-slate-500
                          "
                    >
                      <MapPin size={16} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                              truncate
                              text-sm
                              font-semibold
                              text-slate-800
                            "
                      >
                        {option.city}
                      </p>

                      <p
                        className="
                              truncate
                              text-xs
                              text-slate-400
                            "
                      >
                        {option.state}
                        {option.country ? `, ${option.country}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Current location                                               */}
          {/* -------------------------------------------------------------- */}

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locationLoading}
            className="
              mt-3
              flex
              items-center
              gap-2
              rounded-xl
              px-2
              py-2
              text-sm
              font-semibold
              text-emerald-700
              transition
              hover:bg-emerald-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {locationLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Navigation size={16} />
            )}

            {locationLoading
              ? "Detecting your location..."
              : "Use my current location"}
          </button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Detected / selected location                                     */}
        {/* ---------------------------------------------------------------- */}

        {selectedCity && (
          <div className="mx-7 mt-4">
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50/70
                p-3
              "
            >
              <div
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-emerald-100
                  text-emerald-600
                "
              >
                <Check size={18} />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-xs
                    font-semibold
                    text-emerald-700
                  "
                >
                  Preferred location
                </p>

                <p
                  className="
                    truncate
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  {selectedCity.city}
                  {selectedCity.state ? `, ${selectedCity.state}` : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Error                                                            */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div className="px-7 pt-3">
            <p
              className="
                rounded-xl
                bg-rose-50
                px-3
                py-2.5
                text-xs
                leading-5
                text-rose-600
              "
            >
              {error}
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Popular cities                                                   */}
        {/* ---------------------------------------------------------------- */}

        {!selectedCity && (
          <div className="px-7 pb-6 pt-5">
            <p
              className="
                mb-3
                text-[11px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-slate-400
              "
            >
              Popular cities
            </p>

            <div className="flex flex-wrap gap-2">
              {popularCities.map((option) => {
                const selected =
                  search.toLowerCase() === option.city.toLowerCase();

                return (
                  <button
                    key={option.city}
                    type="button"
                    onClick={() => handleSelectCity(option)}
                    className={`
                        rounded-full
                        border
                        px-4
                        py-2
                        text-sm
                        font-medium
                        transition
                        ${
                          selected
                            ? `
                              border-emerald-600
                              bg-emerald-600
                              text-white
                            `
                            : `
                              border-slate-200
                              bg-white
                              text-slate-600
                              hover:border-emerald-300
                              hover:bg-emerald-50
                              hover:text-emerald-700
                            `
                        }
                      `}
                  >
                    {option.city}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            border-t
            border-slate-100
            bg-slate-50/70
            px-7
            py-5
          "
        >
          <button
            type="button"
            disabled={!selectedCity || saving || locationLoading}
            onClick={handleSubmit}
            className="
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-ink
              font-bold
              text-white
              shadow-lg
              transition
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Show Colleges
                <ArrowRight size={17} />
              </>
            )}
          </button>

          <p
            className="
              mt-3
              text-center
              text-[11px]
              leading-5
              text-slate-400
            "
          >
            We'll use your location to personalize your college recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
