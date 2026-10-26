"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api/admin/dashboard/";

type Order = {
  id: number;
  bill_number: string;
  customer_name: string;
  total: string;
  status: string;
  created_at: string;
};

type DashboardData = {
  total_orders: number;
  total_products: number;
  total_customers: number;
  total_revenue: string;
  recent_orders: Order[];
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("careertrack_token");

      if (!token) {
        setError("Please log in to access the admin dashboard.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          setError(
            "Access denied. Please log in using an authorized admin account."
          );
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load dashboard information.");
        }

        const result: DashboardData = await response.json();
        setData(result);
      } catch {
        setError(
          "Cannot connect to Django. Please check that the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("careertrack_token");
    localStorage.removeItem("careertrack_user");
    localStorage.removeItem("freshcart_token");

    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
          <p className="mt-4 text-gray-600">
            Loading FreshCart Admin Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 text-gray-900 md:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold tracking-wide text-green-700">FRESHCART</p>
            <h1 className="mt-2 text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 hover:bg-gray-100"
            >
              View Store
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </header>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          {error}
        </div>

        <Link
          href="/admin/login"
          className="mt-5 inline-block font-semibold text-green-700 underline"
        >
          Go to login
        </Link>
      </main>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Total Orders",
      value: data.total_orders.toLocaleString("en-IN"),
      symbol: "🛍️",
      description: "Orders placed in your store",
    },
    {
      label: "Total Products",
      value: data.total_products.toLocaleString("en-IN"),
      symbol: "📦",
      description: "Products in your catalog",
    },
    {
      label: "Total Customers",
      value: data.total_customers.toLocaleString("en-IN"),
      symbol: "👥",
      description: "Registered customers",
    },
    {
      label: "Total Revenue",
      value: `₹${Number(data.total_revenue).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      symbol: "₹",
      description: "Excluding cancelled orders",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-5 text-gray-900 sm:p-8 lg:p-10">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold tracking-wide text-green-700">FRESHCART</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your store, products, and customer orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium transition hover:bg-gray-100"
          >
            View Store
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Statistics */}
      <section
        aria-label="Store statistics"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-3 break-words text-3xl font-bold">
                  {stat.value}
                </p>
              </div>

              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl text-green-800"
              >
                {stat.symbol}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-500">{stat.description}</p>
          </article>
        ))}
      </section>

      {/* Recent orders */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest orders placed by your customers.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="font-semibold text-green-700 hover:underline"
          >
            View all orders →
          </Link>
        </div>

        {data.recent_orders.length === 0 ? (
          <div className="rounded-lg bg-gray-50 px-4 py-10 text-center">
            <p className="font-medium text-gray-700">No orders yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-4 pr-5 font-medium">Order Number</th>
                  <th className="py-4 pr-5 font-medium">Customer</th>
                  <th className="py-4 pr-5 font-medium">Total</th>
                  <th className="py-4 pr-5 font-medium">Status</th>
                  <th className="py-4 font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                {data.recent_orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-4 pr-5 font-semibold">
                      {order.bill_number}
                    </td>

                    <td className="py-4 pr-5">
                      {order.customer_name || "Customer"}
                    </td>

                    <td className="py-4 pr-5 font-medium">
                      ₹
                      {Number(order.total).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="py-4 pr-5">
                      <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-800">
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Admin actions */}
      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Link
          href="/admin/products"
          className="group rounded-2xl bg-green-700 p-6 text-white shadow-sm transition hover:bg-green-800"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Manage Products</h2>
              <p className="mt-2 text-sm text-green-100">
                Add products, edit prices, and update stock.
              </p>
            </div>

            <span className="text-3xl" aria-hidden="true">
              📦
            </span>
          </div>

          <p className="mt-5 font-semibold">
            Open product management <span aria-hidden="true">→</span>
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="group rounded-2xl bg-gray-900 p-6 text-white shadow-sm transition hover:bg-gray-800"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Track Orders</h2>
              <p className="mt-2 text-sm text-gray-300">
                Review customer orders and delivery status.
              </p>
            </div>

            <span className="text-3xl" aria-hidden="true">
              🚚
            </span>
          </div>

          <p className="mt-5 font-semibold">
            Open order management <span aria-hidden="true">→</span>
          </p>
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-200 py-5 text-center text-sm text-gray-500">
        FreshCart Admin Dashboard · 2026
      </footer>
    </main>
  );
}
