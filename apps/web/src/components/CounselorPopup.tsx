import React, { useEffect, useState } from "react";
import { X, Sparkles, Phone, User, Mail, GraduationCap, MapPin, CheckCircle2 } from "lucide-react";
import { useApiStore } from "../stores/apiStore";
import { useCounselorPopupStore } from "../stores/counselorPopupStore";

export function CounselorPopup() {
  const MAX_DISMISSALS = 3;

  if (typeof window !== "undefined" && localStorage.getItem("nexteduwise.accessToken")) {
    return null;
  }

  const { isOpen, collegeName, close: closePopup } = useCounselorPopupStore();
  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem("nexteduwise_lead_submitted") === "true";
  });
  const [dismissCount, setDismissCount] = useState(() => {
    return parseInt(localStorage.getItem("nexteduwise_popup_dismissed") ?? "0", 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    city: "",
  });

  const request = useApiStore((state) => state.request);

  // Helper to load session search activity
  const loadSessionActivity = () => {
    try {
      const activityStr = sessionStorage.getItem("nexteduwise_user_activity");
      if (activityStr) {
        const activity = JSON.parse(activityStr);
        setForm((prev) => ({
          ...prev,
          course: prev.course || activity.course || "",
          city: prev.city || activity.city || "",
        }));
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleDismiss = () => {
    const next = dismissCount + 1;
    setDismissCount(next);
    localStorage.setItem("nexteduwise_popup_dismissed", String(next));
    closePopup();
  };

  useEffect(() => {
    // Never show again if already submitted or dismissed 3+ times
    if (submitted || dismissCount >= MAX_DISMISSALS) return;

    const intervalId = setInterval(() => {
      if (localStorage.getItem("nexteduwise_lead_submitted") === "true") {
        setSubmitted(true);
        return;
      }
      const currentDismissals = parseInt(
        localStorage.getItem("nexteduwise_popup_dismissed") ?? "0",
        10
      );
      if (currentDismissals >= MAX_DISMISSALS) {
        setDismissCount(currentDismissals);
        return;
      }

      loadSessionActivity();
      useCounselorPopupStore.getState().open();
    }, 30000); // 40 seconds interval

    return () => clearInterval(intervalId);
  }, [submitted, dismissCount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    // Build a plain-text summary of everything the user searched this session
    let searchActivity: string | undefined;
    try {
      const raw = sessionStorage.getItem("nexteduwise_user_activity");
      if (raw) {
        const act = JSON.parse(raw) as Record<string, string>;
        const parts: string[] = [];
        if (act.name) parts.push(`College searched: ${act.name}`);
        if (act.city) parts.push(`City: ${act.city}`);
        if (act.state) parts.push(`State: ${act.state}`);
        if (act.course) parts.push(`Course: ${act.course}`);
        if (act.searchedAt) parts.push(`Searched at: ${new Date(act.searchedAt).toLocaleString()}`);
        if (parts.length) searchActivity = parts.join(" | ");
      }
    } catch {}

    try {
      const response = await request("/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(searchActivity ? { searchActivity } : {}), ...(collegeName ? { collegeQuery: collegeName } : {}) }),
      });

      if (response.ok) {
        localStorage.setItem("nexteduwise_lead_submitted", "true");
        setSubmitted(true);
        setSuccess(true);
        setTimeout(() => {
          closePopup();
          setSuccess(false);
        }, 2500);
      }
    } catch {
      // Handle network error
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || submitted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-all"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="mt-4 text-2xl font-extrabold text-ink">Request Submitted!</h3>
            <p className="mt-2 text-sm text-slate-600">
              An expert admission counselor will get in touch with you shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-bold text-emerald-800">
                <Sparkles size={14} className="text-emerald-600" /> Free Guidance
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
              Connect with an expert counselor
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Get personalized college shortlists, fee structures, and scholarship insights tailored to your search goals.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Mobile number"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email address"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Preferred Course <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <GraduationCap className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      placeholder="e.g. B.Tech / MBA"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Preferred City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Bengaluru / Pune"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-2xl bg-ink py-3.5 font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? "Connecting..." : "Get Free Expert Guidance"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
