"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Item = { product_name: string; quantity: number; line_total: string | number };
type Bill = {
  id: number;
  bill_number: string;
  customer_name: string;
  subtotal: string | number;
  gst_amount: string | number;
  total: string | number;
  created_at: string;
  items: Item[];
};

const money = (n: string | number) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function HistoryPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("freshcart_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/billing/history/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || data.error || "Could not load history.");
        setBills(Array.isArray(data) ? data : data.results || []);
      })
      .catch((e) =>
        setError(
          e instanceof TypeError
            ? "Can't reach the server. Make sure Django is running."
            : e.message || "Could not load history."
        )
      )
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-green-800">
            Fresh<span className="text-lime-600">Cart</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-green-800 underline-offset-4 hover:underline"
          >
            Back to shop
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order history</h1>
        {!loading && !error && bills.length > 0 && (
          <p className="mt-1 text-gray-600">
            {bills.length} {bills.length === 1 ? "order" : "orders"}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : (
          !error &&
          !bills.length && (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <span
                aria-hidden
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5h6M9 9h6m-6 4h3M7 3h10a2 2 0 012 2v14l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 012-2z"
                  />
                </svg>
              </span>
              <h2 className="mt-5 text-xl font-bold text-gray-900">No orders yet</h2>
              <p className="mt-1 text-gray-600">Your past orders will show up here.</p>
              <Link
                href="/dashboard"
                className="mt-6 rounded-lg bg-green-800 px-6 py-3 font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
              >
                Start shopping
              </Link>
            </div>
          )
        )}

        <div className="mt-6 space-y-4">
          {bills.map((b) => (
            <article
              key={b.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-semibold text-gray-900">{b.bill_number}</h2>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {formatDate(b.created_at)}
                    {b.customer_name ? ` · ${b.customer_name}` : ""}
                  </p>
                </div>
                <p className="text-xl font-bold text-green-800">{money(b.total)}</p>
              </div>

              <div className="px-5 py-4 sm:px-6">
                {b.items?.length > 0 && (
                  <ul className="space-y-2">
                    {b.items.map((i, n) => (
                      <li key={n} className="flex items-start justify-between gap-4 text-sm">
                        <span className="min-w-0 text-gray-800">
                          {i.product_name}
                          <span className="text-gray-500"> × {i.quantity}</span>
                        </span>
                        <span className="shrink-0 font-medium text-gray-900">
                          {money(i.line_total)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <dl className="mt-4 space-y-1.5 border-t border-gray-200 pt-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{money(b.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>GST</dt>
                    <dd>{money(b.gst_amount)}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}