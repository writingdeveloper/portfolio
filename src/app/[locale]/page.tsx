import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { OverviewSection } from "@/components/sections/OverviewSection";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <OverviewSection />;
}
