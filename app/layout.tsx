import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const dmsans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dmsans",
});

export const metadata: Metadata = {
  title: "TechFix Unlock Hub | Phone Repair & Unlocking in Dormaa, Ghana",
  description: "Fast, reliable phone repair, screen replacement, software unlocking & FRP bypass services in Dormaa Ahenkro, Ghana. Book online and checkout with MTN Mobile Money, Vodafone Cash, or bank cards.",
  keywords: [
    "Phone Repair",
    "Screen Replacement",
    "iPhone Unlocking",
    "Android Unlocking",
    "FRP Bypass",
    "Google Lock Bypass",
    "Dormaa",
    "Ghana Mobile Money Repair",
    "TechFix",
  ],
  authors: [{ name: "TechFix Team" }],
  openGraph: {
    title: "TechFix Unlock Hub | Phone Repair & Unlocking in Dormaa, Ghana",
    description: "Fast, reliable phone repair, screen replacement, software unlocking & FRP bypass services in Dormaa. Pay instantly with Mobile Money.",
    url: "https://techfixunlock.com",
    siteName: "TechFix Unlock Hub",
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechFix Unlock Hub | Phone Repair & Unlocking in Dormaa, Ghana",
    description: "Fast, reliable phone repair, screen replacement, software unlocking & FRP bypass services in Dormaa.",
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${syne.variable} ${dmsans.variable} font-dmsans bg-brand-dark text-slate-100 antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-grid-glow overflow-x-hidden">
            {/* CSS Moving Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-[0.04] pointer-events-none" />
            <Navbar />
            <main className="flex-grow relative z-10">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
