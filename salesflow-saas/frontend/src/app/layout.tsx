import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalesMatic - سيلزماتك | منصة مبيعات ذكية للشركات",
  description: "منصة ذكاء اصطناعي لأتمتة المبيعات. تدير عملاءك، تتابعهم تلقائياً، وتغلق الصفقات. مصممة للسوق السعودي.",
  keywords: "مبيعات, CRM, SaaS, ذكاء اصطناعي, أتمتة, عيادات, عقارات, الرياض, السعودية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
