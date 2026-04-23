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
  const themeBootstrapScript = `
    (() => {
      try {
        const storageKey = "describeflow:theme";
        const storedTheme = window.localStorage.getItem(storageKey);
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme =
          storedTheme === "light" || storedTheme === "dark"
            ? storedTheme
            : (prefersDark ? "dark" : "light");
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        root.style.colorScheme = theme;
        root.style.backgroundColor = theme === "dark" ? "#07112b" : "#f7f7ff";
      } catch {
        const root = document.documentElement;
        root.classList.add("dark");
        root.style.colorScheme = "dark";
        root.style.backgroundColor = "#07112b";
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
