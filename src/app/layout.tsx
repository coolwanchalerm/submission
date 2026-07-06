import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const prompt = Prompt({ weight: ['300', '400', '500', '600', '700'], subsets: ["latin", "thai"] });

export const metadata: Metadata = {
  title: "ระบบส่งงานออนไลน์",
  description: "ระบบส่งงานออนไลน์ พัฒนาด้วย Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.className} bg-slate-50 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
