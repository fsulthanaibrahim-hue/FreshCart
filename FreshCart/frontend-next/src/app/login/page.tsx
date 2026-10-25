"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const perks = [
  { title: "Pick up where you left off", text: "Your cart and saved details are waiting." },
  { title: "Reorder in a tap", text: "Repeat past orders without searching again." },
  { title: "Track every order", text: "See what's packed, on the way, and delivered." },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim().toLowerCase(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.detail ||
            (Array.isArray(data?.non_field_errors) ? data.non_field_errors.join(" ") : "") ||
            "Incorrect email or password."
        );
      }
      localStorage.setItem("freshcart_token", data.token);
      router.push("/dashboard");
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Can't reach the server. Make sure Django is running."
          : e instanceof Error
          ? e.message
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 transition hover:border-gray-400 focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-800";

  return (
    <main className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-green-900 p-12 text-green-50 lg:flex">
        <div
          aria-hidden
          className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-lime-300/20"
        />
        <div
          aria-hidden
          className="absolute -bottom-10 right-16 h-40 w-40 rounded-full bg-lime-300/30"
        />

        <Link href="/" className="relative text-2xl font-bold tracking-tight">
          Fresh<span className="text-lime-300">Cart</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Good to see you again.
          </h2>
          <ul className="mt-10 space-y-6">
            {perks.map((perk) => (
              <li key={perk.title} className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 text-green-900">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">{perk.title}</p>
                  <p className="text-green-100/80">{perk.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-green-100/60">
          © 2026 FreshCart. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-gray-50 px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 block text-2xl font-bold tracking-tight text-green-800 lg:hidden"
          >
            Fresh<span className="text-lime-600">Cart</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">Log in to continue to your dashboard.</p>

          {params.get("registered") === "1" && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Account created. Log in to get started.
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>
              <input
                id="email"
                className={inputClass}
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className={`${inputClass} pr-16`}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-4 text-sm font-medium text-green-800 hover:text-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 py-3.5 font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            New to FreshCart?{" "}
            <Link
              href="/register"
              className="font-semibold text-green-800 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
          <div className="w-full max-w-md animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-5 w-64 rounded bg-gray-200" />
            <div className="h-12 rounded-lg bg-gray-200" />
            <div className="h-12 rounded-lg bg-gray-200" />
            <div className="h-12 rounded-lg bg-gray-300" />
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}