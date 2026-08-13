import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, MapPin, Phone, MessageCircle, ShieldCheck, Headset, HandCoins } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold text-white">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink">
                <GraduationCap size={24} />
              </span>
               <span className="text-emerald-400"> nexteduwise</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Your trusted admission navigation platform. We help students discover verified colleges, compare courses, and get 1:1 counseling guidance.
            </p>

            {/* Trust badges */}
            <div className="mt-6 grid gap-2">
              {[
                { icon: <ShieldCheck size={15} />, label: "Verified College Partners" },
                { icon: <Headset size={15} />, label: "1:1 Admission Guidance" },
                { icon: <HandCoins size={15} />, label: "Zero-Cost Counseling" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/60 px-3.5 py-1.5 text-[11px] font-bold text-emerald-300"
                >
                  {badge.icon} {badge.label}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://wa.me/919039220551"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-950/80 border border-emerald-800/50 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900"
              >
                <MessageCircle size={15} /> WhatsApp Guidance
              </a>
              <a
                href="tel:+919039220551"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                <Phone size={15} /> Call Counselor
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Navigation</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <Link to={{ pathname: "/", hash: "#colleges" }} className="transition hover:text-lime">
                  Find Colleges
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#courses" }} className="transition hover:text-lime">
                  Top Categories
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#top-10" }} className="transition hover:text-lime">
                  Top 10 Colleges
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#how" }} className="transition hover:text-lime">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#enquire" }} className="transition hover:text-lime">
                  Get Free Counseling
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="transition hover:text-lime">
                  Counselor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-lime">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Category Tags */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Categories</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <Link to={{ pathname: "/", hash: "#courses" }} className="transition hover:text-lime">
                  Engineering
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#courses" }} className="transition hover:text-lime">
                  Management / MBA
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#courses" }} className="transition hover:text-lime">
                  Vocational Courses
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#courses" }} className="transition hover:text-lime">
                  Science & Research
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#courses" }} className="transition hover:text-lime">
                  Arts & Design
                </Link>
              </li>
              <li>
                <Link to={{ pathname: "/", hash: "#courses" }} className="transition hover:text-lime">
                  Medical & Paramedical
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">Contact Us</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                <span>NeelBad, Bhopal 462044, Madhya Pradesh, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0 text-emerald-400" />
                <span>+91 90392 20551</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0 text-emerald-400" />
                <span>vishnu.mishra0179@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} nexteduwise. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
