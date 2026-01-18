import { setRequestLocale } from "next-intl/server";
import { VenturesSection } from "@/components/sections/VenturesSection";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function VenturesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VenturesSection />;
}
