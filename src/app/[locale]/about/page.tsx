import { setRequestLocale } from "next-intl/server";
import { AboutSection } from "@/components/sections/AboutSection";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutSection />;
}
