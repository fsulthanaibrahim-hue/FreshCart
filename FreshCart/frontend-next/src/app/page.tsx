
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = "http://127.0.0.1:8000/api";

type Product = {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  image_url?: string;
  is_available: boolean;
};

const money = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const categories = [
  { icon: "🥬", name: "Fruits & Vegetables", query: "vegetable" },
  { icon: "🥛", name: "Dairy & Eggs", query: "milk" },
  { icon: "🌾", name: "Pantry Essentials", query: "rice" },
  { icon: "🍪", name: "Snacks & Drinks", query: "snack" },
  { icon: "🧼", name: "Household", query: "soap" },
  { icon: "🍎", name: "Fresh Picks", query: "" },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(`${API}/products/`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to fetch products");
        }

        const data = await response.json();

        setProducts(
          Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : []
        );
        setError("");
      } catch {
        if (!controller.signal.aborted) {
          setProducts([]);
          setError(
            "Couldn't load products. Please make sure the Django server is running."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const shown = products.filter(
    (product) =>
      product.is_available &&
      product.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  function searchCategory(query: string) {
    setSearch(query);

    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-[#f7faf6] text-slate-800">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-green-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-green-900"
          >
            🌿 Fresh<span className="text-lime-600">Cart</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link href="/" className="text-green-800">
              Home
            </Link>
            <a href="#products" className="transition hover:text-green-700">
              Shop
            </a>
            <a href="#benefits" className="transition hover:text-green-700">
              Why FreshCart?
            </a>
            <a href="#footer" className="transition hover:text-green-700">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-50"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-emerald-800">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-lime-400/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-lime-200">
              🌱 Fresh · Healthy · Affordable
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Fresh groceries,
              <span className="block text-lime-300">every day.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-green-100 sm:text-lg">
              Discover your everyday groceries in one place. Fresh picks,
              quality essentials, and a simple shopping experience.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-xl"
            >
              <span
                className="flex items-center pl-3 text-xl"
                aria-hidden="true"
              >
                🔎
              </span>

              <input
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rice, milk, fruits..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="rounded-xl bg-green-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                Search
              </button>
            </form>

            <div
              id="benefits"
              className="mt-9 grid grid-cols-3 gap-3 text-sm text-green-50"
            >
              <div>
                <span className="text-2xl">🛒</span>
                <p className="mt-2 font-bold">Easy shopping</p>
                <p className="mt-1 text-xs text-green-200">
                  Simple ordering
                </p>
              </div>

              <div>
                <span className="text-2xl">🥬</span>
                <p className="mt-2 font-bold">Fresh picks</p>
                <p className="mt-1 text-xs text-green-200">
                  Everyday essentials
                </p>
              </div>

              <div>
                <span className="text-2xl">🧾</span>
                <p className="mt-2 font-bold">Clear billing</p>
                <p className="mt-1 text-xs text-green-200">
                  Itemised receipts
                </p>
              </div>
            </div>
          </div>

          {/* Decorative grocery illustration */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-5 rounded-full bg-lime-300/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-sm sm:p-7">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-lime-50 to-green-100 p-7 text-center sm:p-10">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-800">
                  Good food, better life
                </p>

                <div
                  aria-label="Illustration of fresh groceries"
                  className="my-8 flex flex-wrap items-center justify-center gap-3 text-6xl sm:text-7xl"
                >
                  <span>🥦</span>
                  <span>🥕</span>
                  <span>🍅</span>
                  <span>🥑</span>
                  <span>🍋</span>
                  <span>🍎</span>
                </div>

                <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                  <p className="text-xl font-extrabold text-green-900">
                    Your daily basket
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Your everyday essentials, all in one place.
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-3 rounded-2xl bg-white px-5 py-3 shadow-lg sm:-left-6">
                <p className="text-sm font-bold text-green-900">
                  🌿 Shop fresh
                </p>
                <p className="text-xs text-slate-500">
                  Make every meal count
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-14">
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-widest text-green-700">
            Explore the store
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Shop by category
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Find what you need for your everyday basket.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => searchCategory(category.query)}
              className="group rounded-2xl border border-green-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl transition group-hover:bg-green-100">
                {category.icon}
              </span>

              <p className="mt-4 text-sm font-bold text-slate-800">
                {category.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">Explore →</p>
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section
        id="products"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-green-700">
              Selected for you
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Our products
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Fresh picks for your everyday needs.
            </p>
          </div>

          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-900">
            {loading ? "Loading..." : `${shown.length} products`}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-green-100"
              />
            ))}
          </div>
        ) : !shown.length && !error ? (
          <div className="mt-8 rounded-2xl border border-dashed border-green-200 bg-white p-12 text-center">
            <div className="text-5xl">🧺</div>

            <h3 className="mt-4 font-bold text-slate-900">
              {search
                ? `No products found for "${search}"`
                : "No products available yet"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or check back soon.
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 rounded-xl bg-green-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-900"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((product) => {
              const outOfStock = product.stock <= 0;
              const lowStock = product.stock > 0 && product.stock <= 5;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-xl"
                >
                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-lime-50">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                          outOfStock ? "opacity-50" : ""
                        }`}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="text-7xl transition duration-300 group-hover:scale-110"
                      >
                        🛍️
                      </div>
                    )}

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                        outOfStock
                          ? "bg-slate-800 text-white"
                          : lowStock
                            ? "bg-amber-100 text-amber-900"
                            : "bg-white text-green-800 shadow-sm"
                      }`}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : lowStock
                          ? `Only ${product.stock} left`
                          : "✓ In stock"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-bold text-slate-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-xl font-extrabold text-green-800">
                      {money(Number(product.price))}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {outOfStock
                        ? "Currently unavailable"
                        : "Ready for your basket"}
                    </p>

                    <Link
                      href="/login"
                      aria-disabled={outOfStock}
                      tabIndex={outOfStock ? -1 : undefined}
                      className={`mt-5 block rounded-xl px-4 py-3 text-center text-sm font-bold transition ${
                        outOfStock
                          ? "pointer-events-none bg-slate-100 text-slate-400"
                          : "bg-green-800 text-white hover:bg-green-900"
                      }`}
                    >
                      {outOfStock ? "Out of stock" : "Log in to shop →"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Call to action */}
      <section className="mx-5 mb-14 overflow-hidden rounded-3xl bg-lime-100 sm:mx-auto sm:max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-green-800">
              Your fresh start
            </p>

            <h2 className="mt-3 text-2xl font-extrabold text-green-950 sm:text-3xl">
              Ready to fill your basket?
            </h2>

            <p className="mt-2 text-sm leading-6 text-green-900/80">
              Create an account to start shopping and manage your grocery bills.
            </p>
          </div>

          <Link
            href="/register"
            className="shrink-0 rounded-xl bg-green-800 px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-green-900"
          >
            Create an account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-green-950 text-green-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-3">
          <div>
            <Link href="/" className="text-2xl font-black">
              🌿 FreshCart
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-green-200">
              Everyday grocery essentials, with a fresh and simple shopping
              experience.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Quick links</h3>

            <div className="mt-3 flex flex-col items-start gap-2 text-sm text-green-200">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <a href="#products" className="hover:text-white">
                Shop products
              </a>
              <Link href="/login" className="hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="hover:text-white">
                Sign up
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Contact</h3>

            <p className="mt-3 text-sm leading-6 text-green-200">
              Have a question about your shopping experience?
            </p>

            <a
              href="mailto:support@freshcart.example"
              className="mt-2 inline-block text-sm font-semibold text-lime-300 hover:text-white"
            >
              Contact FreshCart
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-green-200">
          © 2026 FreshCart. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
