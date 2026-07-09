import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Reja - Kunlik Vazifalar Boshqaruvi", template: "%s | Reja" },
  description: "Professional darajadagi kunlik vazifalarni boshqarish tizimi",
  manifest: "/manifest.json",
  applicationName: "Reja",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Reja" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "Reja",
    title: "Reja - Kunlik Vazifalar Boshqaruvi",
    description: "Professional darajadagi kunlik vazifalarni boshqarish tizimi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reja - Kunlik Vazifalar Boshqaruvi",
    description: "Professional darajadagi kunlik vazifalarni boshqarish tizimi",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme")||"system",d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
