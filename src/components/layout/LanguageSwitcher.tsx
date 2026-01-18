"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const localeNames: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
  es: "Español",
  ja: "日本語",
};

const localeFlags: Record<Locale, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  zh: "🇨🇳",
  es: "🇪🇸",
  ja: "🇯🇵",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 uppercase tracking-wider">
        <Globe className="w-3.5 h-3.5" />
        <span>{t("language")}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {locales.map((loc) => (
          <motion.button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors touch-manipulation ${
              locale === loc
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-800"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-base">{localeFlags[loc]}</span>
            <span className="truncate">{localeNames[loc]}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
