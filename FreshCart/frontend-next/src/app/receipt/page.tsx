"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Bill = {
  bill_number: string;
  customer_name: string;
  customer_phone: string;
  subtotal: string | number;
  gst_amount: string | number;
  total: string | number;
  created_at: string;
  items: {
    product_name: string;
    quantity: number;
    price: string | number;
    line_total: string | number;
  }[];
};

const money = (v: string | number) =>
  `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function ReceiptPage() {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("freshcart_last_bill");
      if (saved) setBill(JSON.parse(saved));
    } catch {
      setBill(null);
    }
    setLoaded(true);
  }, []);

  const secondaryBtn =
    "rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-100";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {!loaded ? null : !bill ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h1 className="text-xl font-bold text-gray-900">No receipt found</h1>
            <p className="mt-1 text-gray-600">Complete a checkout and your receipt will show up here.</p>
            <Link
              href="/dashboard"
              className="mt-6 rounded-lg bg-green-800 px-6 py-3 font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <section
              id="receipt"
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              {/* Confirmation header */}
              <div className="bg-green-900 px-6 py-8 text-center text-green-50 sm:px-10">
                <p className="text-lg font-bold tracking-tight">
                  Fresh<span className="text-lime-300">Cart</span>
                </p>
                <span
                  aria-hidden
                  className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 text-green-900"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <h1 className="mt-4 text-2xl font-bold tracking-tight">Order confirmed</h1>
                <p className="mt-1 text-green-100/80">Thanks for shopping with FreshCart.</p>
              </div>

              <div className="px-6 py-6 sm:px-10 sm:py-8">
                {/* Details */}
                <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Bill number</dt>
                    <dd className="mt-0.5 font-semibold text-gray-900">{bill.bill_number}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Date</dt>
                    <dd className="mt-0.5 font-semibold text-gray-900">
                      {formatDate(bill.created_at)}
                    </dd>
                  </div>
                  {bill.customer_name && (
                    <div>
                      <dt className="text-gray-500">Customer</dt>
                      <dd className="mt-0.5 font-semibold text-gray-900">{bill.customer_name}</dd>
                    </div>
                  )}
                  {bill.customer_phone && (
                    <div>
                      <dt className="text-gray-500">Phone</dt>
                      <dd className="mt-0.5 font-semibold text-gray-900">{bill.customer_phone}</dd>
                    </div>
                  )}
                </dl>

                {/* Items */}
                <div className="mt-6 overflow-x-auto border-t border-dashed border-gray-300 pt-4">
                  <table className="w-full min-w-[26rem] text-left text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2 pr-3 font-medium">Product</th>
                        <th className="px-3 py-2 text-right font-medium">Qty</th>
                        <th className="px-3 py-2 text-right font-medium">Price</th>
                        <th className="py-2 pl-3 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bill.items?.map((i, n) => (
                        <tr key={n}>
                          <td className="py-3 pr-3 font-medium text-gray-900">{i.product_name}</td>
                          <td className="px-3 py-3 text-right text-gray-700">{i.quantity}</td>
                          <td className="px-3 py-3 text-right text-gray-700">{money(i.price)}</td>
                          <td className="py-3 pl-3 text-right font-medium text-gray-900">
                            {money(i.line_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <dl className="ml-auto mt-4 max-w-xs space-y-2 border-t border-dashed border-gray-300 pt-4 text-gray-700">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{money(bill.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>GST</dt>
                    <dd>{money(bill.gst_amount)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
                    <dt className="text-lg font-semibold text-gray-900">Total</dt>
                    <dd className="text-2xl font-bold text-green-800">{money(bill.total)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-green-800 px-5 py-3 font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 active:scale-[0.99]"
              >
                Print receipt
              </button>
              <Link href="/dashboard" className={secondaryBtn}>
                Continue shopping
              </Link>
              <Link href="/history" className={secondaryBtn}>
                Order history
              </Link>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt,
          #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 0;
            border-radius: 0;
            box-shadow: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}