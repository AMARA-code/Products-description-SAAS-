import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Describeflow — AI product descriptions",
  description:
    "Create high-converting product descriptions in seconds from product details or images.",
  metadataBase: new URL("https://describeflow.app"),
  applicationName: "Describeflow",
  keywords: [
    "AI product descriptions",
    "ecommerce copywriting",
    "AI writing tool",
    "product copy generator",
    "description generator",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Describeflow — AI product descriptions",
    description:
      "Create high-converting product descriptions in seconds from product details or images.",
    url: "/",
    siteName: "Describeflow",
    type: "website",
    images: [
      {
        url: "/illustrations/hero.svg",
        width: 1200,
        height: 900,
        alt: "Describeflow AI workflow hero illustration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Describeflow — AI product descriptions",
    description:
      "Create high-converting product descriptions in seconds from product details or images.",
    images: ["/illustrations/hero.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
