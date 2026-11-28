import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fitted — Your CV, cut to fit the role",
  description: "One-page Harvard-style tailored resume generated from your CV.",
  icons: {
    icon: [
      { url: "/fitted-logo.png", type: "image/png" },
    ],
    shortcut: "/fitted-logo.png",
    apple: "/fitted-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} font-medium antialiased`}>
        {children}
      </body>
    </html>
  );
}
