import React from "react";
import { CalendarCheck2, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { Field } from "../ui";

type Props = {
  sent: boolean;
  onSubmit: (payload: Record<string, string>) => Promise<void> | void;
};

export function LeadCapture({ sent, onSubmit }: Props) {
  return (
    <section id="lead-capture" className="mx-auto max-w-7xl scroll-mt-20 px-3.5 sm:px-6 py-8 sm:py-16">
      <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 p-5 sm:p-10 text-white shadow-xl lg:grid lg:grid-cols-12 lg:gap-10 lg:p-14">
        {/* Left Side: Counselor Value Proposition & Contact Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 mb-8 lg:mb-0">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-4">
              <Sparkles size={13} className="text-lime" />
              100% Free Admission Guidance
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Connect with an Expert Admission Counselor
            </h2>

            <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-emerald-100/80">
              Get personalized college shortlists, fee structure comparisons, scholarship guidance, and direct admission assistance — tailored specifically to your target course and budget.
            </p>

            {/* Mobile-Friendly Direct Contact Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/919039220551"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-xs sm:text-sm font-extrabold text-emerald-200 shadow-sm transition hover:bg-emerald-500/30 active:scale-[0.98]"
              >
                <MessageCircle size={18} className="text-emerald-300" />
                <span>WhatsApp Expert</span>
              </a>

              <a
                href="tel:+919039220551"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-white/20 active:scale-[0.98]"
              >
                <Phone size={18} className="text-emerald-300" />
                <span>Call Counselor</span>
              </a>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-emerald-800/60">
            {["Verified College Partners", "1:1 Expert Guidance", "Zero Extra Fees"].map(
              (badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-emerald-200"
                >
                  <ShieldCheck size={12} className="text-lime shrink-0" />
                  {badge}
                </span>
              )
            )}
          </div>
        </div>

        {/* Right Side: Lead Form Card */}
        <div className="lg:col-span-7">
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
            className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 text-slate-800 shadow-lg"
          >
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Request Free Counseling Call
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Fill in your details and an admission specialist will call you back within working hours.
            </p>

            <div className="mt-5 space-y-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field name="name" label="Full Name *" required />
                <Field name="phone" label="Phone Number *" required />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field name="email" label="Email Address *" required />
                <Field name="course" label="Target Course (e.g. B.Tech / MBA) *" required />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field name="city" label="Target City *" required />
                <Field name="budget" label="Annual Budget (Optional)" />
              </div>

              <button
                type="submit"
                disabled={sent}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sent ? (
                  <>
                    <CalendarCheck2 size={18} /> Request received — we'll call you back!
                  </>
                ) : (
                  "Connect with Counselor Now"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}