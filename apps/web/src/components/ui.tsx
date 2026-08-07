export const CDN_BASE_URL = "https://dfhe5ze0n4pxu.cloudfront.net";

export function formatImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (path.includes("college360.co.in/")) {
      return path.replace("https://college360.co.in/", `${CDN_BASE_URL}/`).replace("http://college360.co.in/", `${CDN_BASE_URL}/`);
    }
    return path;
  }
  const cleanPath = path.replace(/^\/+/, "");
  return `${CDN_BASE_URL}/${cleanPath}`;
}

export function navLinkClass({ isActive }: { isActive: boolean }) {
  return `transition ${isActive ? "text-emerald-700" : "text-slate-600 hover:text-ink"}`;
}

export function actionLinkClass({ isActive }: { isActive: boolean }) {
  return `rounded-full px-4 py-2 text-sm font-bold ${isActive ? "bg-ink text-white" : "border border-slate-200"}`;
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
