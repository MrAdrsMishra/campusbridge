import  { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Download, GraduationCap } from "lucide-react";
import type { CounselorSession, Lead } from "../types";
import { Metric, Status } from "../components/ui";
import { LeadPanel } from "../components/Modals";
import { useApiStore } from "../stores/apiStore";
import { useDashboardStore } from "../stores/dashboardStore";
import { LeadStatus } from "../components/LeadStatus";

export default function DashboardPage() {
  const { leads, activeLead: active, saving, setLeads, setActiveLead, setSaving, replaceLead } = useDashboardStore();
  const request = useApiStore((state) => state.request);
  const authHeaders = useApiStore((state) => state.authHeaders);
  const clearAuth = useApiStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const counselor = JSON.parse(localStorage.getItem("nexteduwise.counselor") ?? "null") as CounselorSession;

  const parseSearchActivity = (value: string | undefined) => {
    if (!value) return null;
    const result: Record<string, string> = {};
    value.split(" | ").forEach((part) => {
      if (part.startsWith("College searched: ")) {
        result.name = part.slice("College searched: ".length);
      } else if (part.startsWith("City: ")) {
        result.city = part.slice("City: ".length);
      } else if (part.startsWith("State: ")) {
        result.state = part.slice("State: ".length);
      } else if (part.startsWith("Course: ")) {
        result.course = part.slice("Course: ".length);
      } else if (part.startsWith("Searched at: ")) {
        result.searchedAt = part.slice("Searched at: ".length);
      }
    });
    return result;
  };

  const load = () => {
    return request("/leads", {
      headers: authHeaders(),
    }).then(async (response) => {
      if (response.status === 401) {
        clearAuth();
        navigate("/login", { replace: true, state: { from: "/dashboard" } });
        return;
      }
      const data = await response.json();
      setLeads(data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, data: Partial<Lead>) => {
    setSaving(true);
    const updated = await request(`/leads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (response.status === 401) {
        clearAuth();
        navigate("/login", { replace: true, state: { from: "/dashboard" } });
        return null;
      }
      return response.json();
    });
    if (!updated) {
      setSaving(false);
      return;
    }
    replaceLead(id, updated);
    setActiveLead(updated);
    setSaving(false);
  };

  const awaiting = leads.filter((lead) => lead.contacted !== "yes").length;
  const ready = leads.filter((lead) => lead.interest === "ready").length;

  return (
    <main className="min-h-screen bg-slate-50 text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime">
              <GraduationCap size={21} />
            </span>
             <span className="text-emerald-600"> nexteduwise</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              
              <p className="text-sm font-bold text-slate-700">
               Welcome Back {counselor?.name ?? counselor?.email ?? "Counselor"}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const response = await request("/leads/export/csv", {
                  headers: authHeaders(),
                });
                if (response.status === 401) {
                  clearAuth();
                  navigate("/login", { replace: true, state: { from: "/dashboard" } });
                  return;
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "student-leads.csv";
                link.click();
                window.URL.revokeObjectURL(url);
              }}
              className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold sm:flex"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Counselor control center</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Student enquiries</h1>
            <p className="mt-2 text-slate-600">
              Review details, record the conversation and move the right leads forward.
            </p>
          </div>
          <p className="rounded-full bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
            {leads.length} total enquiries
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric label="New / awaiting contact" value={awaiting} color="bg-amber-50 text-amber-800" />
          <Metric label="Ready to proceed" value={ready} color="bg-emerald-50 text-emerald-800" />
          <Metric
            label="Needs clarity"
            value={leads.filter((lead) => lead.interest === "unclear").length}
            color="bg-indigo-50 text-indigo-800"
          />
        </div>

      <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
  {/* Table toolbar */}
  <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-slate-900">
            Student enquiries
          </h2>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {leads.length}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Manage enquiries, follow-ups and admission progress.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:w-64"
          />
        </div>

        {/* Filter */}
        <select
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          defaultValue="all"
        >
          <option value="all">All leads</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="follow-up">Follow-up</option>
          <option value="interested">Interested</option>
          <option value="documents">Documents</option>
          <option value="meeting">Meeting</option>
          <option value="admitted">Admitted</option>
        </select>
      </div>
    </div>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full min-w-[1250px] text-left text-sm">
      <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <tr className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          <th className="w-[250px] px-6 py-4">Student</th>
          <th className="w-[220px] px-5 py-4">Course & Location</th>
          <th className="px-5 py-4">Budget</th>
          <th className="px-5 py-4">Status</th>
          <th className="px-5 py-4">Contact</th>
          <th className="px-5 py-4">Interest</th>
          <th className="px-5 py-4">Enquiry</th>
          <th className="px-5 py-4">Activity</th>
          <th className="px-5 py-4 text-right">Action</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {leads.map((lead) => (
          <tr
            key={lead._id}
            onClick={() => setActiveLead(lead)}
            className="group cursor-pointer transition hover:bg-emerald-50/30"
          >
            {/* Student */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-extrabold text-emerald-700">
                  {lead.name?.charAt(0)?.toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-extrabold text-slate-900">
                    {lead.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {lead.phone}
                  </p>

                  {lead.email && (
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {lead.email}
                    </p>
                  )}
                </div>
              </div>
            </td>

            {/* Course + Location */}
            <td className="px-5 py-4">
              <p className="max-w-[210px] truncate font-bold text-slate-800">
                {lead.course || "—"}
              </p>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <span>{lead.city || "Location unavailable"}</span>
              </p>

              {(() => {
                const activity = parseSearchActivity(lead.searchActivity);
                return activity?.state ? (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {activity.state}
                  </p>
                ) : null;
              })()}
            </td>

            {/* Budget */}
            <td className="px-5 py-4">
              <span className="font-semibold text-slate-700">
                {lead.budget || "Not specified"}
              </span>
            </td>

            {/* Status */}
            <td className="px-5 py-4">
              <LeadStatus status={lead.status} />
            </td>

            {/* Contacted */}
            <td className="px-5 py-4">
              <Status
                label={lead.contacted ?? "pending"}
                type="contact"
              />
            </td>

            {/* Interest */}
            <td className="px-5 py-4">
              <Status
                label={lead.interest ?? "pending"}
                type="interest"
              />
            </td>

            {/* Date */}
            <td className="whitespace-nowrap px-5 py-4">
              <p className="font-semibold text-slate-700">
                {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {new Date(lead.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </td>

            {/* Search activity */}
            <td className="px-5 py-4">
              {lead.searchActivity ? (
                <div className="max-w-[180px]">
                  {(() => {
                    const activity = parseSearchActivity(lead.searchActivity);
                    return (
                      <>
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {activity?.course || activity?.name || "Course search"}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-slate-400">
                          {activity?.city || "No city"} ·{" "}
                          {activity?.state || "No state"}
                        </p>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  No activity
                </span>
              )}
            </td>

            {/* Action */}
            <td className="px-5 py-4 text-right">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLead(lead);
                }}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700 transition group-hover:bg-white group-hover:shadow-sm hover:bg-emerald-50"
              >
                View
                <ChevronRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </td>
          </tr>
        ))}

        {leads.length === 0 && (
          <tr>
            <td colSpan={9} className="px-6 py-20">
              <div className="mx-auto max-w-sm text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
                  <GraduationCap
                    size={25}
                    className="text-slate-400"
                  />
                </div>

                <h3 className="mt-4 font-extrabold text-slate-800">
                  No enquiries yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  New student enquiries will appear here once they are
                  submitted.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Footer */}
  {leads.length > 0 && (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
      <p className="text-xs font-medium text-slate-500">
        Showing <span className="font-bold text-slate-700">{leads.length}</span>{" "}
        enquiries
      </p>

      <button
        type="button"
        className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
      >
        Refresh
      </button>
    </div>
  )}
</section>
      </div>

      {active && <LeadPanel lead={active} close={() => setActiveLead(null)} update={update} saving={saving} />}
    </main>
  );
}
