"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function POSPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/cart");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-5 text-center">
      <span
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-800"
      />
      <p role="status" className="font-semibold text-gray-900">
        Opening your cart...
      </p>
      <Link
        href="/cart"
        className="text-sm text-green-800 underline-offset-4 hover:underline"
      >
        Not redirected? Go to cart
      </Link>
    </main>
  );
}