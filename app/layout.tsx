import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { CartWishlistSync } from "@/components/providers/CartWishlistSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jewellery Store - Premium Jewelry Collection",
  description:
    "Discover our exquisite collection of fine jewelry including rings, necklaces, earrings, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartWishlistSync />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
