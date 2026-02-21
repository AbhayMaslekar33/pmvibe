import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PMVIBE — Build Real Product Intuition",
  description:
    "Daily product launches, expert insights, and structured reflection prompts to help aspiring PMs develop genuine product thinking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
