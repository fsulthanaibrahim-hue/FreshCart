
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

type PrinterWidth = "58mm" | "80mm";

const money = (v: string | number) =>
  `₹${Number(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
  const [printerWidth, setPrinterWidth] =
    useState<PrinterWidth>("80mm");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("freshcart_last_bill");

      if (saved) {
        setBill(JSON.parse(saved) as Bill);
      }
    } catch {
      setBill(null);
    }

    setLoaded(true);
  }, []);

  const printBtn =
    "rounded-lg bg-green-800 px-5 py-3 text-center font-semibold text-white transition hover:bg-green-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200";

  const secondaryBtn =
    "rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-800 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-100";

  return (
    <main className="receipt-page min-h-screen bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {!loaded ? null : !bill ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <h1 className="text-xl font-bold text-gray-900">
              No receipt found
            </h1>
            <p className="mt-1 text-gray-600">
              Complete a checkout and your receipt will show up here.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 rounded-lg bg-green-800 px-6 py-3 font-semibold text-white hover:bg-green-900"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Printer controls - hidden when printing */}
            <div className="print:hidden mb-6 flex flex-wrap items-center justify-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                Thermal paper
                <select
                  value={printerWidth}
                  onChange={(event) =>
                    setPrinterWidth(
                      event.target.value as PrinterWidth
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="58mm">58 mm</option>
                  <option value="80mm">80 mm</option>
                </select>
              </label>

              <button
                onClick={() => window.print()}
                className={printBtn}
              >
                Print Bill
              </button>
            </div>

            {/* Receipt: screen preview and printed bill */}
            <section
              id="receipt"
              className={`receipt-paper receipt-${printerWidth} overflow-hidden rounded-2xl border border-gray-200 bg-white`}
            >
              {/* Screen confirmation header; hidden for thermal print */}
              <div className="confirmation-header bg-green-900 px-6 py-8 text-center text-green-50 sm:px-10">
                <p className="text-lg font-bold tracking-tight">
                  Fresh<span className="text-lime-300">Cart</span>
                </p>

                <span
                  aria-hidden
                  className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-lime-300 text-green-900"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>

                <h1 className="mt-4 text-2xl font-bold tracking-tight">
                  Order confirmed
                </h1>
                <p className="mt-1 text-green-100/80">
                  Thanks for shopping with FreshCart.
                </p>
              </div>

              {/* Thermal receipt header */}
              <div className="thermal-header">
                <h1>FRESHCART</h1>
                <p>FRESHNESS AT YOUR DOORSTEP</p>
                <p className="thermal-invoice">CUSTOMER RECEIPT</p>
              </div>

              <div className="receipt-content px-6 py-6 sm:px-10 sm:py-8">
                {/* Bill details */}
                <dl className="bill-details grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Bill number</dt>
                    <dd className="mt-0.5 font-semibold text-gray-900">
                      {bill.bill_number}
                    </dd>
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
                      <dd className="mt-0.5 font-semibold text-gray-900">
                        {bill.customer_name}
                      </dd>
                    </div>
                  )}

                  {bill.customer_phone && (
                    <div>
                      <dt className="text-gray-500">Phone</dt>
                      <dd className="mt-0.5 font-semibold text-gray-900">
                        {bill.customer_phone}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Purchased products */}
                <div className="items-section mt-6 overflow-x-auto border-t border-dashed border-gray-300 pt-4">
                  <table className="w-full min-w-[26rem] text-left text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2 pr-3 font-medium">
                          Product
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          Price
                        </th>
                        <th className="py-2 pl-3 text-right font-medium">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {bill.items?.map((item, index) => (
                        <tr key={`${item.product_name}-${index}`}>
                          <td className="py-3 pr-3 font-medium text-gray-900">
                            {item.product_name}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-3 text-right text-gray-700">
                            {money(item.price)}
                          </td>
                          <td className="py-3 pl-3 text-right font-medium text-gray-900">
                            {money(item.line_total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bill totals */}
                <dl className="bill-totals ml-auto mt-4 max-w-xs space-y-2 border-t border-dashed border-gray-300 pt-4 text-gray-700">
                  <div className="flex justify-between gap-3">
                    <dt>Subtotal</dt>
                    <dd>{money(bill.subtotal)}</dd>
                  </div>

                  <div className="flex justify-between gap-3">
                    <dt>GST</dt>
                    <dd>{money(bill.gst_amount)}</dd>
                  </div>

                  <div className="flex items-baseline justify-between gap-3 border-t border-gray-200 pt-3">
                    <dt className="text-lg font-semibold text-gray-900">
                      Total
                    </dt>
                    <dd className="text-2xl font-bold text-green-800">
                      {money(bill.total)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Receipt footer */}
              <footer className="receipt-footer">
                <p>THANK YOU FOR SHOPPING WITH FRESHCART!</p>
                <p>We hope to serve you again.</p>
                <p className="footer-small">
                  Please keep this receipt for your records.
                </p>
                <p className="footer-small">*** CUSTOMER COPY ***</p>
              </footer>
            </section>

            {/* Navigation actions */}
            <div className="print:hidden mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => window.print()}
                className={printBtn}
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
        .thermal-header {
          display: none;
        }

        .receipt-footer {
          display: none;
        }

        @media print {
          @page {
            size: auto;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #receipt,
          #receipt * {
            visibility: visible;
          }

          .receipt-page {
            min-height: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          #receipt {
            position: absolute;
            top: 0;
            left: 0;
            width: var(--receipt-width, 80mm) !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            color: #000 !important;
            background: #fff !important;
            font-family: "Courier New", monospace !important;
            font-size: 10px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          #receipt.receipt-58mm {
            --receipt-width: 58mm;
          }

          #receipt.receipt-80mm {
            --receipt-width: 80mm;
          }

          .confirmation-header {
            display: none !important;
          }

          .thermal-header {
            display: block !important;
            padding: 3mm 2mm 2mm;
            text-align: center;
            border-bottom: 1px dashed #000;
          }

          .thermal-header h1 {
            margin: 0 0 3px;
            font-family: Arial, sans-serif;
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 1px;
          }

          .thermal-header p {
            margin: 3px 0;
            font-size: 9px;
          }

          .thermal-header .thermal-invoice {
            margin-top: 8px;
            font-weight: bold;
          }

          .receipt-content {
            padding: 3mm 2mm !important;
          }

          .bill-details {
            display: block !important;
            font-size: 9px !important;
          }

          .bill-details > div {
            display: flex;
            justify-content: space-between;
            gap: 4px;
            margin: 4px 0;
          }

          .bill-details dt,
          .bill-details dd {
            margin: 0 !important;
            color: #000 !important;
          }

          .bill-details dd {
            text-align: right;
            overflow-wrap: anywhere;
          }

          .items-section {
            margin-top: 8px !important;
            padding-top: 6px !important;
            overflow: visible !important;
            border-top: 1px dashed #000 !important;
          }

          .items-section table {
            width: 100% !important;
            min-width: 0 !important;
            table-layout: fixed;
            border-collapse: collapse;
            font-family: "Courier New", monospace !important;
            font-size: 8px !important;
          }

          .items-section th,
          .items-section td {
            padding: 5px 1px !important;
            color: #000 !important;
            overflow-wrap: anywhere;
            vertical-align: top;
          }

          .items-section th {
            border-bottom: 1px solid #000;
          }

          .items-section th:first-child,
          .items-section td:first-child {
            width: 38%;
            text-align: left;
          }

          .items-section th:nth-child(2),
          .items-section td:nth-child(2) {
            width: 12%;
            text-align: right;
          }

          .items-section th:nth-child(3),
          .items-section td:nth-child(3) {
            width: 23%;
            text-align: right;
          }

          .items-section th:nth-child(4),
          .items-section td:nth-child(4) {
            width: 27%;
            text-align: right;
          }

          .items-section tbody tr {
            border-bottom: 1px dashed #ccc;
            break-inside: avoid;
          }

          .bill-totals {
            max-width: none !important;
            margin-top: 8px !important;
            padding-top: 7px !important;
            border-top: 1px dashed #000 !important;
            color: #000 !important;
            font-size: 9px !important;
          }

          .bill-totals dt,
          .bill-totals dd {
            color: #000 !important;
          }

          .bill-totals > div:last-child {
            border-top: 1px solid #000 !important;
          }

          .bill-totals > div:last-child dt,
          .bill-totals > div:last-child dd {
            font-size: 13px !important;
            font-weight: 900 !important;
            color: #000 !important;
          }

          .receipt-footer {
            display: block !important;
            padding: 2mm 2mm 4mm;
            border-top: 1px dashed #000;
            text-align: center;
            font-family: "Courier New", monospace;
            font-size: 9px;
          }

          .receipt-footer p {
            margin: 5px 0;
          }

          .receipt-footer .footer-small {
            font-size: 8px;
          }

          .items-section tr,
          .bill-totals,
          .receipt-footer {
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}

