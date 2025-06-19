import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/footer";
import { Inter, DM_Sans } from "next/font/google"
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] })
const dmSans = DM_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MK Price Tracker - Best Mechanical Keyboard Deals in India",
  description:
    "Compare prices across India's top vendors for mechanical keyboards, switches, keycaps, and gaming gear. Never overpay again!",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.className} min-h-screen flex flex-col antialiased`}
      >
        <Navbar/>
        <main className="flex-grow">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      <Footer/>
      </body>
    </html>
  );
}
