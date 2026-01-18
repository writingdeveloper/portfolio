"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Rocket,
  Layers,
  Clock,
  User,
  Mail,
  Globe,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navItems = [
  { href: "/", icon: LayoutDashboard, labelKey: "overview" },
  { href: "/ventures", icon: Rocket, labelKey: "ventures" },
  { href: "/tech-stack", icon: Layers, labelKey: "techStack" },
  { href: "/timeline", icon: Clock, labelKey: "timeline" },
  { href: "/about", icon: User, labelKey: "about" },
  { href: "/contact", icon: Mail, labelKey: "contact" },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tFooter = useTranslations("footer");
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-lg gradient-text">{tCommon("portfolio")}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-white bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t(item.labelKey)}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div className="px-4 py-4 border-t border-gray-800">
        <LanguageSwitcher />
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Globe className="w-3.5 h-3.5" />
          <span>{tFooter("tagline")}</span>
        </div>
      </div>
    </aside>
  );
}
