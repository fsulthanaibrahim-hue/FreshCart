"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000/api";

type Product = { id: number; name: string; price: string | number; stock: number };
type Item = { product: Product; quantity: number };

const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Turns a Django/DRF error body into a readable sentence
function readableError(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(readableError).filter(Boolean).join(" ");
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.detail === "string") return obj.detail;
    return Object.values(obj).map(readableError).filter(Boolean).join(" ");
  }
  return "";
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("freshcart_token")) {
      router.replace("/login");
      return;
    }
    try {
      setCart(JSON.parse(localStorage.getItem("freshcart_cart") || "[]"));
    } catch {
      setCart([]);
    }
    setLoaded(true);
  }, [router]);

  const subtotal = cart.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const gst = Math.round(subtotal * 5) / 100;

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("freshcart_token");
    if (!token || !cart.length) {
      setError("Log in and add products first.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/billing/checkout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          items: cart.map((i) => ({ product: i.product.id, quantity: i.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(readableError(data) || "Checkout failed.");
      localStorage.setItem("freshcart_last_bill", JSON.stringify(data));
      localStorage.removeItem("freshcart_cart");
      router.push("/receipt");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 transition hover:border-gray-400 focus:border-green-700 focus:outline-none focus:ring-4 focus:ring-green-100";
  const labelClass = "mb-1.5 flex items-baseline justify-between text-sm font-medium text-gray-800";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-green-800">
            Fresh<span className="text-lime-600">Cart</span>
          </Link>
          <Link
            href="/cart"
            className="text-sm font-semibold text-green-800 underline-offset-4 hover:underline"
          >
            Back to cart
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>

        {!loaded ? null : !cart.length ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <span
              aria-hidden
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h2l2.4 10.2a1 1 0 001 .8h8.9a1 1 0 001-.8L20 8H6.2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
            </span>
            <h2 className="mt-5 text-xl font-bold text-gray-900">Nothing to check out</h2>
            <p className="mt-1 text-gray-600">Your cart is empty. Add some groceries first.</p>
            <Link
              href="/dashboard"
              className="mt-6 rounded-lg bg-green-800 px-6 py-3 font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <form
            onSubmit={placeOrder}
            className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_24rem]"
          >
            {/* Customer details */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900">Customer details</h2>
              <p className="mt-1 text-gray-600">
                Add a name and phone number to print on your receipt.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    <span>Name</span>
                    <span className="text-xs font-normal text-gray-500">Optional</span>
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Asha Nair"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    <span>Phone number</span>
                    <span className="text-xs font-normal text-gray-500">Optional</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="98765 43210"
                    className={inputClass}
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}
              </div>
            </section>

            {/* Summary */}
            <aside className="rounded-2xl bg-green-900 p-6 text-green-50 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">Order summary</h2>

              <ul className="mt-5 space-y-3">
                {cart.map((i) => (
                  <li key={i.product.id} className="flex items-start justify-between gap-4">
                    <span className="min-w-0 text-green-100">
                      {i.product.name}
                      <span className="text-green-100/60"> × {i.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {money(Number(i.product.price) * i.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-3 border-t border-green-700 pt-5 text-green-100/90">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>GST (5%)</dt>
                  <dd>{money(gst)}</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-baseline justify-between border-t border-green-700 pt-5">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-lime-300">{money(subtotal + gst)}</span>
              </div>

              <button
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-lime-300 py-3.5 font-semibold text-green-950 transition hover:bg-lime-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-lime-200/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <span
                    aria-hidden
                    className="h-4 w-4 animate-spin rounded-full border-2 border-green-900/30 border-t-green-900"
                  />
                )}
                {loading ? "Placing order..." : "Place order"}
              </button>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}