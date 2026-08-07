import React, { useEffect, useState } from "react";
import { Check, Mail, MessageCircle, Phone, Star, X } from "lucide-react";
import type { College, Lead } from "../types";
import { useApiStore } from "../stores/apiStore";

export function LeadPanel({
  lead,
  close,
  update,
  saving,
}: {
  lead: Lead;
  close: () => void;
  update: (id: string, data: Partial<Lead>) => Promise<void>;
  saving: boolean;
}) {
  const [response, setResponse] = useState(lead.response ?? "");
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "" });
  const request = useApiStore((state) => state.request);

  useEffect(() => {
    void request("/leads/contact-info")
      .then((response) => response.json())
      .then((data) => setContactInfo(data))
      .catch(() => setContactInfo({ phone: "", email: "" }));
  }, [request]);

  return (
    <div className="fixed inset-0 z-20 bg-ink/30" onClick={close}>
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="float-right rounded-full p-2 hover:bg-slate-100"
          onClick={close}
        >
          <X />
        </button>
        <p className="eyebrow">Student record</p>
        <h2 className="mt-2 text-3xl font-extrabold">{lead.name}</h2>
        <div className="mt-7 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
          <Detail label="Phone" value={lead.phone} />
          <Detail label="City" value={lead.city} />
          <Detail label="Course" value={lead.course} />
          <Detail label="Email" value={lead.email ?? "—"} />
        </div>
        <div className="mt-8">
          <p className="text-sm font-bold">Was the student contacted?</p>
          <div className="mt-3 flex gap-2">
            {(["yes", "no"] as const).map((value) => (
              <button
                key={value}
                onClick={() => update(lead._id, { contacted: value })}
                className={`choice ${lead.contacted === value ? "choice-on" : ""}`}
              >
                {value === "yes" ? <Check size={16} /> : <X size={16} />}
                {value === "yes" ? "Yes, contacted" : "No"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-7">
          <p className="text-sm font-bold">Student interest after discussion</p>
          <div className="mt-3 flex gap-2">
            {(["ready", "unclear"] as const).map((value) => (
              <button
                key={value}
                onClick={() => update(lead._id, { interest: value })}
                className={`choice ${lead.interest === value ? "choice-on" : ""}`}
              >
                {value === "ready" ? "Ready to proceed" : "Needs clarity"}
              </button>
            ))}
          </div>
        </div>
        <label className="mt-7 block text-sm font-bold">
          Counselor response / discussion notes
          <textarea
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Add a summary of the student’s goals, preferences and next step…"
            className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </label>
        <button
          disabled={saving}
          onClick={() => update(lead._id, { response })}
          className="mt-4 w-full rounded-xl bg-ink py-3 font-bold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save response"}
        </button>
        <div className="mt-7 grid grid-cols-3 gap-2">
          <a
            href={`tel:${contactInfo.phone || lead.phone}`}
            className="quick-action"
          >
            <Phone size={16} />
            Call
          </a>
          <a
            href={`https://wa.me/${(contactInfo.phone || lead.phone).replace(/\D/g, "")}`}
            className="quick-action"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
          <a
            href={`mailto:${contactInfo.email}?subject=${encodeURIComponent("Your college guidance")}&body=${encodeURIComponent(
              `Hi ${lead.name},

Thank you for your interest. I'd be happy to guide you regarding your admission.

Best regards`,
            )}`}
            className="quick-action"
          >
            <Mail size={16} />
            Email
          </a>
        </div>
      </aside>
    </div>
  );
}

export function CollegeModal({
  college,
  close,
}: {
  college: College;
  close: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-10 grid place-items-center bg-ink/40 p-4"
      onClick={close}
    >
      <article
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="float-right" onClick={close}>
          <X />
        </button>
        <p className="eyebrow">College profile</p>
        <h2 className="mt-2 text-3xl font-extrabold">{college.name}</h2>
        <p className="mt-2 text-slate-500">
          {college.city}, {college.state} · Average fee ₹
          {college.averageFees?.toLocaleString("en-IN")}/year
        </p>
        <p className="mt-7 leading-7 text-slate-700">{college.about}</p>
        <h3 className="mt-8 font-bold">Courses offered</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {college.courses.map((course) => (
            <span key={course} className="tag">
              {course}
            </span>
          ))}
        </div>
        <h3 className="mt-8 font-bold">Student reviews</h3>
        <div className="mt-3 grid gap-3">
          {college.reviews.map((review) => (
            <div key={review.name} className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold">
                {review.name}{" "}
                <span className="float-right inline-flex items-center gap-1 text-amber-500">
                  <Star size={15} fill="currentColor" />
                  {review.rating}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-800">{value}</p>
    </div>
  );
}
