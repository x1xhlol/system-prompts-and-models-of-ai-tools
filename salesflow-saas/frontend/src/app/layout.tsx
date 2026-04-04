import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

const kufi = Noto_Kufi_Arabic({ 
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kufi",
});

export const metadata: Metadata = {
  title: "Dealix — نظام تشغيل الإيرادات B2B",
  description:
    "اكتشاف، تأهيل، قنوات متعددة، وتحليلات — مع حوكمة وذاكرة. سوق سعودي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${kufi.variable} font-sans antialiased`}>
        {/* Background Gradients for depth */}
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="fixed top-20 left-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 z-[-1]" />
        
        {children}
      </body>
    </html>
  );
}
