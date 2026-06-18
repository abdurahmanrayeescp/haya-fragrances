import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuxeAura | Premium Luxury Perfume E-Commerce Platform",
  description: "Discover luxury in every drop. Explore exclusive designer fragrances from Tom Ford, Dior, Chanel, Armani, and Le Labo. Find your signature scent with our AI Fragrance Quiz.",
  keywords: "luxury perfume, premium fragrances, tom ford, chanel, dior, scent finder, perfume e-commerce",
  openGraph: {
    title: "LuxeAura | Premium Luxury Perfume E-Commerce Platform",
    description: "Discover luxury in every drop. Explore exclusive designer fragrances from Tom Ford, Dior, Chanel, Armani, and Le Labo.",
    url: "https://luxeaura.com",
    siteName: "LuxeAura",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "LuxeAura Premium Fragrances"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LuxeAura | Premium Luxury Perfume E-Commerce Platform",
    description: "Discover luxury in every drop. Find your signature scent with our AI Fragrance Quiz.",
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth h-full">
      <head>
        {/* Load elegant fonts from Google Fonts directly */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-[#0B0B0B] text-[#F5F5F7] min-h-full flex flex-col antialiased selection:bg-[#D4AF37] selection:text-black`}>
        {children}
      </body>
    </html>
  );
}
