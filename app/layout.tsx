import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English Diary Corrector",
  description: "Write daily English diary entries and get AI-powered corrections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="border-b border-gray-200 bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  📝 English Diary
                </Link>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Home
                </Link>
                <Link
                  href="/write"
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Write Diary
                </Link>
                <Link
                  href="/weaknesses"
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Weaknesses
                </Link>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
