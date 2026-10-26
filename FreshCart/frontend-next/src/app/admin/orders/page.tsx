
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000/api/admin/orders/";

type OrderItem = {
  id: number;
  product: number;
  product_name?: string;
  quantity: number;
  price: string | number;
  line_total: string | number;
};

type Order = {
  id: number;
  bill_number: string;
  customer_name: string;
  customer_phone: string;
  subtotal: string | number;
  gst_amount: string | number;
  total: string | number;
  status: string;
  created_at: string;
  items?: OrderItem[];
};

const STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatCurrency(value: string | number) {
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [token, setToken] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async (authToken: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Access denied. Please log in with an authorized admin account."
        );
      }

      if (!response.ok) {
        throw new Error(`Could not load orders (HTTP ${response.status}).`);
      }

      const result = await response.json();
      const orderList: Order[] = Array.isArray(result)
        ? result
        : result.results ?? [];

      setOrders(orderList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("careertrack_token");

    if (!savedToken) {
      setError("Admin token not found. Please log in first.");
      setLoading(false);
      return;
    }

    setToken(savedToken);
    void loadOrders(savedToken);
  }, [loadOrders]);

  async function updateStatus(order: Order, newStatus: string) {
    if (!token || newStatus === order.status.toLowerCase()) return;

    const previousStatus = order.status;
    setSavingId(order.id);
    setError("");
    setMessage("");

    // Optimistically update the table while saving.
    setOrders((previous) =>
      previous.map((item) =>
        item.id === order.id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const response = await fetch(`${API_URL}${order.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.detail ||
            `Could not update order status (HTTP ${response.status}).`
        );
      }

      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      setMessage(`Order ${order.bill_number} updated to ${newStatus}.`);
    } catch (err) {
      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? { ...item, status: previousStatus }
            : item
        )
      );

      setError(
        err instanceof Error ? err.message : "Unable to update order."
      );
    } finally {
      setSavingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      order.bill_number?.toLowerCase().includes(query) ||
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_phone?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      order.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status.toLowerCase() === "pending").length,
    processing: orders.filter((o) => o.status.toLowerCase() === "processing").length,
    shipped: orders.filter((o) => o.status.toLowerCase() === "shipped").length,
    delivered: orders.filter((o) => o.status.toLowerCase() === "delivered").length,
    cancelled: orders.filter((o) => o.status.toLowerCase() === "cancelled").length,
  };

  return (
    <main className="min-h-screen bg-gray-50 p-5 text-gray-900 sm:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-4 font-bold tracking-wide text-green-700">
            FRESHCART
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Manage Orders
          </h1>

          <p className="mt-2 text-gray-500">
            Review orders and update delivery status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!token || loading}
            onClick={() => void loadOrders(token)}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            Refresh Orders
          </button>

          <Link
            href="/"
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            View Store
          </Link>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {message}
        </div>
      )}

      {/* Order status summaries */}
      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "All Orders", value: counts.all, key: "all" },
          { label: "Pending", value: counts.pending, key: "pending" },
          { label: "Processing", value: counts.processing, key: "processing" },
          { label: "Shipped", value: counts.shipped, key: "shipped" },
          { label: "Delivered", value: counts.delivered, key: "delivered" },
          { label: "Cancelled", value: counts.cancelled, key: "cancelled" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-green-400 ${
              statusFilter === item.key
                ? "border-green-600 ring-2 ring-green-100"
                : "border-gray-200"
            }`}
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </button>
        ))}
      </section>

      {/* Search and filters */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Customer Orders</h2>
            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order or customer..."
              aria-label="Search orders"
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600"
            >
              <option value="all">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-semibold text-gray-700">No orders found</p>
            <p className="mt-2 text-sm text-gray-500">
              Try changing the search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-4 pr-4 font-medium">Order Number</th>
                  <th className="py-4 pr-4 font-medium">Customer</th>
                  <th className="py-4 pr-4 font-medium">Phone</th>
                  <th className="py-4 pr-4 font-medium">Total</th>
                  <th className="py-4 pr-4 font-medium">Date</th>
                  <th className="py-4 pr-4 font-medium">Status</th>
                  <th className="py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-4 pr-4 font-semibold">
                      {order.bill_number}
                    </td>

                    <td className="py-4 pr-4">
                      {order.customer_name || "Customer"}
                    </td>

                    <td className="py-4 pr-4">
                      {order.customer_phone || "—"}
                    </td>

                    <td className="py-4 pr-4 font-medium">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="py-4 pr-4">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-md border border-gray-300 px-3 py-2 font-medium hover:bg-gray-100"
                        >
                          Details
                        </button>

                        <select
                          aria-label={`Update status for ${order.bill_number}`}
                          value={order.status.toLowerCase()}
                          disabled={savingId === order.id}
                          onChange={(e) =>
                            void updateStatus(order, e.target.value)
                          }
                          className="rounded-md border border-gray-300 bg-white px-2 py-2 disabled:opacity-50"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Order details modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="order-details-title"
                  className="text-2xl font-bold"
                >
                  Order Details
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {selectedOrder.bill_number}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
                className="rounded-lg px-3 py-2 text-xl hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Customer</p>
                <p className="mt-1 font-semibold">
                  {selectedOrder.customer_name || "Customer"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="mt-1 font-semibold">
                  {selectedOrder.customer_phone || "—"}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="mt-1 font-semibold">
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Current Status</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <h3 className="mt-7 text-lg font-bold">Items</h3>

            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="py-3 pr-3">Product</th>
                      <th className="py-3 pr-3">Qty</th>
                      <th className="py-3 pr-3">Price</th>
                      <th className="py-3">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 pr-3">
                          {item.product_name || `Product #${item.product}`}
                        </td>
                        <td className="py-3 pr-3">{item.quantity}</td>
                        <td className="py-3 pr-3">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3">
                          {formatCurrency(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                Item details are not included in the API response.
              </p>
            )}

            <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500">GST</span>
                <span>{formatCurrency(selectedOrder.gst_amount)}</span>
              </div>

              <div className="flex justify-between gap-4 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-7 w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
