import { setRequestLocale } from "next-intl/server";
import { TimelineSection } from "@/components/sections/TimelineSection";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TimelinePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TimelineSection />;
}
