import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // Ensure hydration matches by not using non-deterministic inputs here.
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Ensure hydration matches by not using non-deterministic inputs here.
});

export const metadata: Metadata = {
  title: "Acharya – Jyotish",
  description: "Acharya is your Jyotish (Vedic astrology) assistant. Chat, explore predictions, track history, manage your profile, and buy credits for in-depth insights—all in a beautiful, faith-aware user dashboard.",
  icons: [
    {
      rel: "icon",
      url: "/logo.svg", // Place your logo at public/logo.svg
      type: "image/svg+xml"
    },
    // Optionally, a shortcut icon (favicon)
    {
      rel: "shortcut icon",
      url: "/favicon.ico",
      type: "image/x-icon"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Avoid including non-deterministic data or “window” checks here */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
