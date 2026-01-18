import { setRequestLocale } from "next-intl/server";
import { TechStackSection } from "@/components/sections/TechStackSection";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TechStackPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TechStackSection />;
}
