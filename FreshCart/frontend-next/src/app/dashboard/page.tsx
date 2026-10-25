"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000/api";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  stock: number;
  image_url?: string;
  is_available: boolean;
};
type Profile = { username: string; full_name: string; email: string; phone: string };
type CartItem = { product: Product; quantity: number };
type Notice = { text: string; tone: "success" | "error" } | null;

const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    const token = localStorage.getItem("freshcart_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("freshcart_cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    } catch {}

    Promise.all([
      fetch(`${API}/auth/profile/`, { headers: { Authorization: `Token ${token}` } }),
      fetch(`${API}/products/`),
    ])
      .then(async ([pr, prods]) => {
        if (!pr.ok || !prods.ok) throw new Error("Could not load account or products.");
        const profileData = await pr.json();
        const data = await prods.json();
        setProfile(profileData);
        setProducts(Array.isArray(data) ? data : data.results || []);
      })
      .catch((e) => setNotice({ text: e.message || "Loading failed.", tone: "error" }))
      .finally(() => setLoading(false));
  }, [router]);

  // Hide success/error messages after a few seconds
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  function add(product: Product) {
    let cart: CartItem[] = [];
    try {
      cart = JSON.parse(localStorage.getItem("freshcart_cart") || "[]");
    } catch {}
    const found = cart.find((item) => item.product.id === product.id);
    if (found) {
      if (found.quantity >= product.stock) {
        setNotice({ text: `You already have all ${product.stock} in your cart.`, tone: "error" });
        return;
      }
      found.quantity += 1;
    } else cart.push({ product, quantity: 1 });

    localStorage.setItem("freshcart_cart", JSON.stringify(cart));
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    setNotice({ text: `${product.name} added to cart.`, tone: "success" });
  }

  function logout() {
    localStorage.removeItem("freshcart_token");
    router.replace("/login");
  }

  const visible = products.filter(
    (p) => p.is_available && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const navLink =
    "rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-100";

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/" className="text-2xl font-bold tracking-tight text-green-800">
            Fresh<span className="text-lime-600">Cart</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/cart" className={`${navLink} flex items-center gap-2`}>
              Cart
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  cartCount ? "bg-green-800 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {cartCount}
              </span>
            </Link>
            <Link href="/history" className={navLink}>
              History
            </Link>
            <button onClick={logout} className={`${navLink} text-gray-500`}>
              Log out
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        {/* Greeting */}
        <section className="rounded-2xl bg-green-900 px-6 py-8 text-green-50 sm:px-10 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome, {profile?.full_name || profile?.username || "Shopper"}
          </h1>
          <p className="mt-2 min-h-6 text-green-100/80">
            {profile
              ? `${profile.email} · ${profile.phone || "No phone number"}`
              : loading
              ? ""
              : "What are we stocking up on today?"}
          </p>

          <div className="relative mt-6 max-w-lg">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M9 3a6 6 0 104.1 10.4l3.2 3.2a1 1 0 001.4-1.4l-3.2-3.2A6 6 0 009 3zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
                clipRule="evenodd"
              />
            </svg>
            <label htmlFor="search" className="sr-only">
              Search groceries
            </label>
            <input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groceries"
              className="w-full rounded-lg border border-transparent bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-lime-300/50"
            />
          </div>
        </section>

        {/* Notice */}
        <div aria-live="polite" className="mt-5 min-h-11">
          {notice && (
            <p
              role={notice.tone === "error" ? "alert" : "status"}
              className={`inline-block rounded-lg border px-4 py-2.5 text-sm ${
                notice.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
            >
              {notice.text}
            </p>
          )}
        </div>

        {/* Products */}
        <div className="mt-2 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-gray-900">Groceries</h2>
          {!loading && (
            <p className="text-sm text-gray-600">
              {visible.length} {visible.length === 1 ? "product" : "products"}
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : !visible.length ? (
          <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <h3 className="text-lg font-bold text-gray-900">
              {search ? `No results for "${search}"` : "No products available"}
            </h3>
            <p className="mt-1 text-gray-600">
              {search ? "Try a different name or clear the search." : "Check back soon for fresh stock."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-5 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-100"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((p) => {
              const out = !p.stock;
              const low = p.stock > 0 && p.stock <= 5;
              return (
                <article
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-green-300"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className={`h-40 w-full bg-green-50 object-cover ${out ? "opacity-50" : ""}`}
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="flex h-40 items-center justify-center bg-green-100 text-4xl font-bold text-green-800"
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {(out || low) && (
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          out ? "bg-gray-900 text-white" : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {out ? "Out of stock" : `Only ${p.stock} left`}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.description}</p>
                    )}
                    <p className="mt-3 text-lg font-bold text-green-800">
                      {money(Number(p.price))}
                    </p>
                    <button
                      disabled={out}
                      onClick={() => add(p)}
                      className="mt-4 w-full rounded-lg bg-green-800 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:active:scale-100"
                    >
                      {out ? "Unavailable" : "Add to cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart bar — appears once something is in the cart */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4">
          <Link
            href="/cart"
            className="mx-auto flex max-w-xl items-center justify-between rounded-xl bg-green-900 px-5 py-4 text-green-50 shadow-lg transition hover:bg-green-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-lime-300/60"
          >
            <span className="font-semibold">
              {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
            </span>
            <span className="rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-green-950">
              View cart
            </span>
          </Link>
        </div>
      )}
    </main>
  );
}