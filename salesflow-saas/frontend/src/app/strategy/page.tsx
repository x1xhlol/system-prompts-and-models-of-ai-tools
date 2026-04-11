import { StrategyPageClient } from "./strategy-page-client";

export const metadata = {
  title: "Dealix — الاستراتيجية والمستوى التالي",
  description:
    "موضع المنتج، التمييز عن المنافسين، خارطة الطريق، المخاطر، والوثيقة الكاملة — مع بيانات حية من API عند التوفر.",
};

export default function StrategyPage() {
  return <StrategyPageClient />;
}
