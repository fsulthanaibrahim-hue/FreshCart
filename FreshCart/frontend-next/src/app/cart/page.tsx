"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  image_url?: string;
};
type Item = { product: Product; quantity: number };

const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  function update(next: Item[]) {
    setCart(next);
    localStorage.setItem("freshcart_cart", JSON.stringify(next));
  }

  const subtotal = cart.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const gst = Math.round(subtotal * 5) / 100;
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  const stepBtn =
    "flex h-9 w-9 items-center justify-center text-lg text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent";

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
            Continue shopping
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your cart</h1>
        {loaded && cart.length > 0 && (
          <p className="mt-1 text-gray-600">
            {count} {count === 1 ? "item" : "items"}
          </p>
        )}

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
            <h2 className="mt-5 text-xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-1 text-gray-600">Add some groceries and they'll show up here.</p>
            <Link
              href="/dashboard"
              className="mt-6 rounded-lg bg-green-800 px-6 py-3 font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
            {/* Items */}
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {cart.map((i) => {
                const price = Number(i.product.price);
                const atMax = i.quantity >= i.product.stock;
                return (
                  <li key={i.product.id} className="flex gap-4 p-4 sm:p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {i.product.image_url ? (
                      <img
                        src={i.product.image_url}
                        alt={i.product.name}
                        className="h-20 w-20 shrink-0 rounded-xl bg-green-50 object-cover sm:h-24 sm:w-24"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl font-bold text-green-800 sm:h-24 sm:w-24"
                      >
                        {i.product.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-gray-900">{i.product.name}</h2>
                        <p className="text-sm text-gray-600">{money(price)} each</p>
                        {atMax && (
                          <p className="mt-1 text-xs font-medium text-amber-700">
                            Only {i.product.stock} in stock
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white">
                          <button
                            className={stepBtn}
                            aria-label={`Decrease quantity of ${i.product.name}`}
                            onClick={() =>
                              update(
                                i.quantity === 1
                                  ? cart.filter((x) => x.product.id !== i.product.id)
                                  : cart.map((x) =>
                                      x.product.id === i.product.id
                                        ? { ...x, quantity: x.quantity - 1 }
                                        : x
                                    )
                              )
                            }
                          >
                            −
                          </button>
                          <span
                            className="w-9 text-center text-sm font-semibold text-gray-900"
                            aria-live="polite"
                          >
                            {i.quantity}
                          </span>
                          <button
                            className={stepBtn}
                            aria-label={`Increase quantity of ${i.product.name}`}
                            disabled={atMax}
                            onClick={() =>
                              update(
                                cart.map((x) =>
                                  x.product.id === i.product.id
                                    ? { ...x, quantity: x.quantity + 1 }
                                    : x
                                )
                              )
                            }
                          >
                            +
                          </button>
                        </div>

                        <div className="w-24 text-right">
                          <p className="font-bold text-gray-900">{money(price * i.quantity)}</p>
                          <button
                            className="mt-0.5 text-sm text-red-600 underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
                            onClick={() => update(cart.filter((x) => x.product.id !== i.product.id))}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Summary */}
            <aside className="rounded-2xl bg-green-900 p-6 text-green-50 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">Order summary</h2>
              <dl className="mt-5 space-y-3 text-green-100/90">
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
              <Link
                href="/checkout"
                className="mt-6 block rounded-lg bg-lime-300 py-3.5 text-center font-semibold text-green-950 transition hover:bg-lime-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-lime-200/60 active:scale-[0.99]"
              >
                Go to checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}