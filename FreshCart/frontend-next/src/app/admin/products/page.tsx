
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000/api/admin/products/";

type Product = {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  image_url: string;
  is_available: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  is_available: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  image_url: "",
  is_available: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [token, setToken] = useState("");

  const loadProducts = useCallback(async (authToken: string) => {
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
          "Access denied. Please use an authorized admin account."
        );
      }

      if (!response.ok) {
        throw new Error("Could not load products from Django.");
      }

      const result = await response.json();

      // Supports both a normal array and Django REST Framework pagination.
      const productList: Product[] = Array.isArray(result)
        ? result
        : result.results ?? [];

      setProducts(productList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("careertrack_token");

    if (!savedToken) {
      setError("Please log in with your admin account first.");
      setLoading(false);
      return;
    }

    setToken(savedToken);
    void loadProducts(savedToken);
  }, [loadProducts]);

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url ?? "",
      is_available: product.is_available,
    });
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Admin token is missing. Please log in again.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter the product name.");
      return;
    }

    if (Number(form.price) < 0 || form.price.trim() === "") {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError("Stock must be a whole number of zero or more.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url.trim(),
      is_available: form.is_available,
    };

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}${editingId}/`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof result === "object"
            ? Object.entries(result)
                .map(([key, value]) => `${key}: ${String(value)}`)
                .join(" | ")
            : "";

        throw new Error(
          detail || `Unable to save product (HTTP ${response.status}).`
        );
      }

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product added successfully."
      );

      setEditingId(null);
      setForm(emptyForm);

      await loadProducts(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!token) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}${product.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));

        throw new Error(
          result.detail ||
            `Unable to delete product (HTTP ${response.status}). It may be linked to an order.`
        );
      }

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );

      if (editingId === product.id) {
        cancelEditing();
      }

      setMessage("Product deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete product."
      );
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

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
            Manage Products
          </h1>

          <p className="mt-2 text-gray-500">
            Add, update, and manage your grocery products.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium hover:bg-gray-100"
        >
          View Store
        </Link>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      {/* Add or edit product form */}
      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="mb-6 text-xl font-bold">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="product-name"
                className="mb-2 block text-sm font-medium"
              >
                Product Name *
              </label>
              <input
                id="product-name"
                required
                maxLength={150}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Fresh Apples"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="product-price"
                className="mb-2 block text-sm font-medium"
              >
                Price (₹) *
              </label>
              <input
                id="product-price"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="e.g. 120.00"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="product-stock"
                className="mb-2 block text-sm font-medium"
              >
                Stock Quantity *
              </label>
              <input
                id="product-stock"
                type="number"
                required
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                placeholder="e.g. 50"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="product-image"
                className="mb-2 block text-sm font-medium"
              >
                Image URL
              </label>
              <input
                id="product-image"
                type="url"
                value={form.image_url}
                onChange={(e) => updateField("image_url", e.target.value)}
                placeholder="https://example.com/apple.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="product-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="product-description"
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the product..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) =>
                updateField("is_available", e.target.checked)
              }
              className="h-4 w-4 accent-green-700"
            />
            Product is available for purchase
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Product"
                  : "Add Product"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-100"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Products table */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">All Products</h2>
            <p className="mt-1 text-sm text-gray-500">
              {products.length} product{products.length === 1 ? "" : "s"} total
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 sm:w-64"
            />

            <button
              type="button"
              disabled={!token || loading}
              onClick={() => void loadProducts(token)}
              className="rounded-lg border border-gray-300 px-4 py-3 font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-500">
            Loading products...
          </p>
        ) : filteredProducts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-semibold text-gray-700">
              {search ? "No matching products found." : "No products yet."}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {search
                ? "Try another product name."
                : "Use the form above to add your first product."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="py-4 pr-4 font-medium">Product</th>
                  <th className="py-4 pr-4 font-medium">Price</th>
                  <th className="py-4 pr-4 font-medium">Stock</th>
                  <th className="py-4 pr-4 font-medium">Availability</th>
                  <th className="py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-xl">
                            🥬
                          </div>
                        )}

                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {product.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-4 font-medium">
                      ₹
                      {Number(product.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="py-4 pr-4">{product.stock}</td>

                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          product.is_available
                            ? "bg-green-50 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          className="rounded-md border border-green-200 px-3 py-2 font-medium text-green-800 hover:bg-green-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(product)}
                          className="rounded-md border border-red-200 px-3 py-2 font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
