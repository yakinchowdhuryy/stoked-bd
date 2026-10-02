import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stoked-bd.vercel.app"),
  title: "STOKED BD",
  description: "STOKED BD",
  openGraph: {
    title: "STOKED BD",
    description: "STOKED BD",
    url: "https://stoked-bd.vercel.app",
    siteName: "STOKED BD",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "STOKED BD",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STOKED BD",
    description: "STOKED BD",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}