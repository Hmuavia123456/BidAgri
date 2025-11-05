import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css?v=2.0";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BidAgri",
  description: "Connecting farmers and buyers through smart agricultural bidding.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#FAFAFA]">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#FAFAFA]`}
      >
        {/* Skip to main content for keyboard and screen-reader users */}
        <a href="#main-content" className="skip-link">Skip to content</a>

        {/* Global site header */}
        <Navbar />

        {/* Offset for navbar height so content isn't hidden */}
        <main id="main-content" role="main" className="flex-1 px-0 pb-0 pt-[72px]" tabIndex={-1}>
          {children}
        </main>

        {/* Global site footer */}
        <Footer />

        {/* Global polite live region for occasional announcements */}
        <div id="sr-announcer" className="sr-only" aria-live="polite" aria-atomic="true" />
      </body>
    </html>
  );
}
