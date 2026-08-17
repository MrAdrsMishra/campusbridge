export function LeadStatus({ status }: { status?: string }) {
  const config: Record<
    string,
    { label: string; className: string; dot: string }
  > = {
    new: {
      label: "New",
      className: "bg-blue-50 text-blue-700 ring-blue-600/10",
      dot: "bg-blue-500",
    },
    contacted: {
      label: "Contacted",
      className: "bg-slate-100 text-slate-700 ring-slate-600/10",
      dot: "bg-slate-500",
    },
    "follow-up": {
      label: "Follow-up",
      className: "bg-amber-50 text-amber-700 ring-amber-600/10",
      dot: "bg-amber-500",
    },
    interested: {
      label: "Interested",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
      dot: "bg-emerald-500",
    },
    documents: {
      label: "Documents",
      className: "bg-indigo-50 text-indigo-700 ring-indigo-600/10",
      dot: "bg-indigo-500",
    },
    meeting: {
      label: "Meeting",
      className: "bg-purple-50 text-purple-700 ring-purple-600/10",
      dot: "bg-purple-500",
    },
    admitted: {
      label: "Admitted",
      className: "bg-lime-50 text-lime-800 ring-lime-600/20",
      dot: "bg-lime-600",
    },
  };

  const current = config[status ?? "new"] ?? {
    label: status || "New",
    className: "bg-slate-100 text-slate-600 ring-slate-600/10",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-extrabold ring-1 ring-inset ${current.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}