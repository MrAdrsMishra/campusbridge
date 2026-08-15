import React from "react";
import { CalendarCheck2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Field } from "../ui";

type Props = {
  sent: boolean;
  onSubmit: (payload: Record<string, string>) => Promise<void> | void;
};

export function LeadCapture({ sent, onSubmit }: Props) {
  return (
    <section id="enquire" className="mx-auto max-w-7xl scroll-mt-20 px-3.5 sm:px-6 py-10 sm:py-20">
      <div className="grid gap-8 overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-ink to-ink p-5 sm:p-10 text-white lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
        {/* Left: copy + direct channels */}
        <div>
          <p className="eyebrow text-xs font-bold uppercase tracking-wider text-lime">Get free counseling</p>
          <h2 className="section-title text-xl sm:text-3xl font-extrabold text-white">
            Start a conversation with a real admission expert.
          </h2>
          <p className="mt-3 sm:mt-5 max-w-md text-xs sm:text-sm leading-relaxed text-white/70">
            Tell us about your goals and a specialist counsellor for your course and city will
            guide you — WhatsApp, call or form, your choice.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="https://wa.me/919039220551"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/25 active:scale-[0.98]"
            >
              <MessageCircle size={17} />
              WhatsApp Support
            </a>
            <a
              href="tel:+919039220551"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-white/20 active:scale-[0.98]"
            >
              <Phone size={17} />
              Direct Call — +91 90392 20551
            </a>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
            {["Verified College Partners", "1:1 Admission Guidance", "Zero-Cost Counseling"].map(
              (badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] sm:text-xs font-bold text-white/80"
                >
                  <ShieldCheck size={13} className="text-lime shrink-0" /> {badge}
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
          className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-ink"
        >
          <h3 className="text-lg sm:text-xl font-extrabold text-ink">Get free guidance</h3>
          <p className="mt-1 text-xs text-slate-500">
            No spam. A counsellor calls you back within working hours.
          </p>

          <div className="mt-5 space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="name" label="Full Name" required />
              <Field name="phone" label="Phone Number" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="email" label="Email Address" required />
              <Field name="course" label="Preferred Course" required />
            </div>
            <Field name="city" label="Target City" required />

            <button
              type="submit"
              disabled={sent}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-xs sm:text-sm font-bold text-white transition active:scale-[0.98] hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sent ? (
                <>
                  <CalendarCheck2 size={17} /> Request received — we'll be in touch!
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