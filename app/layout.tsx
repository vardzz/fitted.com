import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitted — Your CV, cut to fit the role",
  description: "One-page Harvard-style tailored resume generated from your CV.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
