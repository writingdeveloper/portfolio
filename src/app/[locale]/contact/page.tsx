import { setRequestLocale } from "next-intl/server";
import { ContactSection } from "@/components/sections/ContactSection";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactSection />;
}
