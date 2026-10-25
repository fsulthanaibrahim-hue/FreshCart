"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000/api";

type FieldErrors = Partial<Record<string, string>>;

const perks = [
  { title: "Fresh picks", text: "Fruit, veg and dairy chosen the day you order." },
  { title: "One-tap checkout", text: "Save your address and phone for faster orders." },
  { title: "Track every order", text: "See what's packed, on the way, and delivered." },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: undefined });
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          username: form.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Django REST returns { field: ["message"] } — show each under its input
        const next: FieldErrors = {};
        let general = "";
        if (data && typeof data === "object") {
          for (const [key, value] of Object.entries(data)) {
            const msg = Array.isArray(value) ? value.join(" ") : String(value);
            if (key in form) next[key] = msg;
            else if (key === "username") next.email = msg;
            else general = msg;
          }
        }
        setFieldErrors(next);
        if (general || Object.keys(next).length === 0) {
          setError(general || "Could not create your account. Please try again.");
        }
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Can't reach the server. Make sure Django is running.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (name: string) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:ring-4 ${
      fieldErrors[name]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-gray-300 hover:border-gray-400 focus:border-green-700 focus:ring-green-100"
    }`;

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
            Groceries that show up fresh, every time.
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

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-gray-600">
            Sign up to save your details and check out faster.
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-5" noValidate={false}>
            <div>
              <label htmlFor="full_name" className={labelClass}>
                Full name
              </label>
              <input
                id="full_name"
                className={inputClass("full_name")}
                name="full_name"
                autoComplete="name"
                placeholder="Full Name"
                value={form.full_name}
                onChange={update}
                required
              />
              {fieldErrors.full_name && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.full_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>
              <input
                id="email"
                className={inputClass("email")}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone number
              </label>
              <input
                id="phone"
                className={inputClass("phone")}
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="phone number"
                value={form.phone}
                onChange={update}
                required
              />
              {fieldErrors.phone && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className={`${inputClass("password")} pr-16`}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={update}
                  minLength={8}
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
              {fieldErrors.password && (
                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-800 underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}