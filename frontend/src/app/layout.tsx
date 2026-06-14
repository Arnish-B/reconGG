import type { Metadata } from "next";
import { Oswald, Barlow, Bebas_Neue, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";
import { SpoilerProvider } from "@/components/common/SpoilerContext";

const oswald = Oswald({
  variable: "--font-disp",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const barlow = Barlow({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const bebas = Bebas_Neue({
  variable: "--font-score",
  subsets: ["latin"],
  weight: ["400"],
});
const barlowSemi = Barlow_Semi_Condensed({
  variable: "--font-mono-ggwp",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GGWP — VALORANT Esports Recon",
  description: "Scout VALORANT esports: tournaments, matches, maps, and player stats from vlr.gg.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${oswald.variable} ${barlow.variable} ${bebas.variable} ${barlowSemi.variable}`}
    >
      <body className="min-h-full font-ui text-ink antialiased">
        <SpoilerProvider>{children}</SpoilerProvider>
      </body>
    </html>
  );
}
