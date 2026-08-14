import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useApiStore } from "../stores/apiStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useApiStore((state) => state.request);
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message ?? "Login failed. Check your credentials.");
      setLoading(false);
      return;
    }
    localStorage.setItem("nexteduwise.accessToken", data.accessToken);
    localStorage.setItem(
      "nexteduwise.counselor",
      JSON.stringify(data.counselor),
    );
    navigate(from, { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime">
            <GraduationCap size={21} />
          </span>
           <span className="text-emerald-600"> nexteduwise</span>
        </Link>
        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <Link to="/" className="font-semibold text-emerald-700">
            Back to Home page
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white shadow-2xl shadow-emerald-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,100,0.18),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.22),transparent_35%)]" />
          <div className="relative">
            <p className="eyebrow text-lime">Admin access</p>
            <h1 className="mt-4 max-w-lg text-4xl font-extrabold tracking-tight sm:text-5xl">
              Sign in with the admin secret to manage leads and student
              conversations.
            </h1>
            <p className="mt-5 max-w-md text-white/70">
              Enter the configured secret key to access the dashboard.
            </p>
          </div>
        </div>

        <form
          onSubmit={login}
          className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-950/5"
        >
          <p className="eyebrow">Welcome back</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
            Log in with your admin secret
          </h2>
          <div className="mt-8 grid gap-5">
            <label className="text-sm font-semibold text-slate-700">
              Secret key
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter the admin secret"
                className="mt-2 w-full rounded-xl border border-emerald-100 bg-[#fbfcfa] px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
          </div>
          {error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center rounded-2xl bg-ink py-4 font-bold text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
