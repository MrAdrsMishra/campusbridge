import React, { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronRight, Download, GraduationCap } from "lucide-react";
import type { CounselorSession, Lead } from "../types";
import { actionLinkClass, Metric, Status } from "../components/ui";
import { LeadPanel } from "../components/Modals";
import { useApiStore } from "../stores/apiStore";
import { useDashboardStore } from "../stores/dashboardStore";

export default function DashboardPage() {
  const { leads, activeLead: active, saving, setLeads, setActiveLead, setSaving, replaceLead } = useDashboardStore();
  const request = useApiStore((state) => state.request);
  const authHeaders = useApiStore((state) => state.authHeaders);
  const clearAuth = useApiStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const counselor = JSON.parse(localStorage.getItem("campusbridge.counselor") ?? "null") as CounselorSession;

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
            campus<span className="text-emerald-600">bridge</span>
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

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-5 py-4">Preference</th>
                  <th className="px-5 py-4">Contacted</th>
                  <th className="px-5 py-4">Interest</th>
                  <th className="px-5 py-4">Enquiry date</th>
                  <th className="px-5 py-4">Search activity</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-bold">{lead.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.phone} · {lead.city}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{lead.course}</p>
                      <p className="mt-1 text-xs text-slate-500">Budget: {lead.budget}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Status label={lead.contacted ?? "pending"} type="contact" />
                    </td>
                    <td className="px-5 py-4">
                      <Status label={lead.interest ?? "pending"} type="interest" />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setActiveLead(lead)}
                        className="inline-flex items-center gap-1 font-bold text-emerald-700"
                      >
                        Open <ChevronRight size={16} />
                      </button>
                    </td>
                    {/* <td className="px-5 py-4">
                      <p className="mt-1 text-xs text-slate-500">{lead.searchActivity}</p>
                    </td> */}
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      No student enquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {active && <LeadPanel lead={active} close={() => setActiveLead(null)} update={update} saving={saving} />}
    </main>
  );
}
