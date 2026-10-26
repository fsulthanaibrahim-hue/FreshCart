"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Update this URL to match your existing Django login endpoint.
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            data.non_field_errors?.[0] ||
            "Invalid username or password."
        );
      }

      const token = data.token || data.key;

      if (!token) {
        throw new Error(
          "Login succeeded, but no API token was returned. Check your Django login response."
        );
      }

      // Only staff/admin accounts should access this dashboard.
      const userResponse = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        headers: { Authorization: `Token ${token}` },
      });

      if (!userResponse.ok) {
        throw new Error(
          "Unable to verify your admin account. Check the user-details API endpoint."
        );
      }

      const user = await userResponse.json();

      if (!user.is_staff && !user.is_superuser) {
        throw new Error("Access denied. Admin privileges are required.");
      }

      localStorage.setItem("careertrack_token", token);
      router.push("/admin");
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Can't reach the server. Make sure Django is running."
          : err instanceof Error
          ? err.message
          : "Unable to log in. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 transition hover:border-gray-400 focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-800";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-green-950 px-4 py-10">
      <div
        aria-hidden
        className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-lime-300/10"
      />
      <div
        aria-hidden
        className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-green-800/40"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl sm:p-10">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-tight text-green-800">
              Fresh<span className="text-lime-600">Cart</span>
            </span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-900">
              Admin
            </span>
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
            Admin login
          </h1>
          <p className="mt-2 text-gray-600">Sign in to manage orders and products.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className={labelClass}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Admin username"
                autoComplete="username"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin password"
                  autoComplete="current-password"
                  required
                  className={`${inputClass} pr-16`}
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
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-800 py-3.5 font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {loading ? "Signing in..." : "Sign in to admin"}
            </button>
          </form>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-green-100/70 underline-offset-4 hover:text-green-50 hover:underline"
        >
          Back to shop
        </Link>
      </div>
    </main>
  );
}