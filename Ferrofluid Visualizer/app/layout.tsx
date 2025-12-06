import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Ferrofluid Visualizer",
  description: "Interactive ferrofluid visualization synchronized with Spotify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
