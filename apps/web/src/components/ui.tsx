import { useApiStore } from "../stores/apiStore";

export const CDN_BASE_URL = "https://dfhe5ze0n4pxu.cloudfront.net";

/** Hosts served by Shiksha's hotlink-protected S3 bucket (block 403 direct loads). */
const SHIKSHA_HOST_RE = /(^|\.)shiksha\.com$/i;

/**
 * Rewrite a hotlink-protected Shiksha image to our backend proxy, which fetches it with
 * the browser-like Referer/User-Agent headers Shiksha's S3 bucket requires. All other
 * hosts (e.g. the college360 CloudFront CDN, Unsplash) pass through untouched.
 */
export function imageProxyUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.origin);
    if (SHIKSHA_HOST_RE.test(parsed.hostname)) {
      const apiBase = useApiStore.getState().url("/colleges/image");
      const sep = apiBase.includes("?") ? "&" : "?";
      return `${apiBase}${sep}url=${encodeURIComponent(parsed.href)}`;
    }
  } catch {
    /* fall through to the raw URL */
  }
  return url;
}

export function formatImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (path.includes("college360.co.in/")) {
      path = path
        .replace("https://college360.co.in/", `${CDN_BASE_URL}/`)
        .replace("http://college360.co.in/", `${CDN_BASE_URL}/`);
    }
    return imageProxyUrl(path);
  }
  const cleanPath = path.replace(/^\/+/, "");
  return imageProxyUrl(`${CDN_BASE_URL}/${cleanPath}`);
}

/**
 * Upgrade a Shiksha/College360 resized thumbnail (e.g. ".../<id>_270x200.jpg") to the
 * original full-quality image by stripping the `_<width>x<height>` size token. Use this
 * where an image is displayed large (like the hero background) instead of the small thumb.
 * URLs without a size token are returned unchanged.
 */
export function fullImageUrl(path?: string | null): string | null {
  if (!path) return null;
  const full = path.replace(/_\d+x\d+(?=\.[A-Za-z0-9]+(?:\?[^/]*)?$)/, "");
  return formatImageUrl(full);
}

export function SearchBox({
  icon,
  placeholder,
  value,
  onChange,
  inputRef,
  onFocus,
  onBlur,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 text-slate-400">
      {icon}
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full bg-transparent py-3 text-sm text-ink outline-none"
      />
    </label>
  );
}

export function Field({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        required={required}
        className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
        placeholder={`Enter your ${label.toLocaleLowerCase()}`}
      />
    </label>
  );
}

export function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-5 ${color}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

export function Status({
  label,
  type,
}: {
  label: string;
  type: "contact" | "interest";
}) {
  const labels: Record<string, string> = {
    pending: "Pending",
    yes: "Contacted",
    no: "No",
    ready: "Ready",
    unclear: "Unclear",
  };
  const tone =
    label === "yes" || label === "ready"
      ? "bg-emerald-100 text-emerald-800"
      : label === "no" || label === "unclear"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-800";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
      {labels[label] ?? (type === "contact" ? "Pending" : "Pending")}
    </span>
  );
}
