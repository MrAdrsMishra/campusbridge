import React from "react";
import { CalendarCheck2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Field } from "../ui";

type Props = {
  sent: boolean;
  onSubmit: (payload: Record<string, string>) => Promise<void> | void;
};

export function LeadCapture({ sent, onSubmit }: Props) {
  return (
    <section id="enquire" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-20">
      <div className="grid gap-10 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-ink to-ink p-8 text-white sm:p-12 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
        {/* Left: copy + direct channels */}
        <div>
          <p className="eyebrow text-lime">Get free counseling</p>
          <h2 className="section-title text-white">
            Start a conversation with a real admission expert.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-white/70">
            Tell us about your goals and a specialist counsellor for your course and city will
            guide you — WhatsApp, call or form, your choice.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="https://wa.me/919039220551"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-5 py-3.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/25"
            >
              <MessageCircle size={18} />
              WhatsApp Support
            </a>
            <a
              href="tel:+919039220551"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <Phone size={18} />
              Direct Call — +91 90392 20551
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Verified College Partners", "1:1 Admission Guidance", "Zero-Cost Counseling"].map(
              (badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/80"
                >
                  <ShieldCheck size={14} className="text-lime" /> {badge}
                </span>
              )
            )}
          </div>
        </div>

        {/* Right: lead capture card */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const payload = Object.fromEntries(new FormData(e.currentTarget)) as Record<
              string,
              string
            >;
            void onSubmit(payload);
            e.currentTarget.reset();
          }}
          className="glass-card rounded-3xl p-7 text-ink sm:p-8"
        >
          <h3 className="text-xl font-extrabold text-ink">Get free guidance</h3>
          <p className="mt-1 text-xs text-slate-500">
            No spam. A counsellor calls you back within working hours.
          </p>

          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Full Name"  required />
              <Field name="phone" label="Phone Number"  required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="email" label="Email Address"  required />
              <Field name="course" label="Preferred Course"  required />
            </div>
            <Field name="city" label="Target City"  required />

            <button
              type="submit"
              disabled={sent}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sent ? (
                <>
                  <CalendarCheck2 size={18} /> Request received — we'll be in touch!
                </>
              ) : (
                "Get Free Guidance"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}