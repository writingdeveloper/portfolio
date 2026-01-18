"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Rocket,
  Layers,
  Clock,
  User,
  Mail,
  Menu,
  X,
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

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="font-semibold gradient-text">{tCommon("portfolio")}</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 -mr-2 text-gray-400 hover:text-white active:text-white transition-colors touch-manipulation"
          aria-label={tCommon("toggleMenu")}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-14 right-0 bottom-0 z-30 w-64 bg-gray-900 border-l border-gray-800 overflow-y-auto"
            >
              <div className="px-4 py-6 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation ${
                          isActive
                            ? "text-white bg-gray-800"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-800"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{t(item.labelKey)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Language Switcher */}
              <div className="px-4 py-4 border-t border-gray-800">
                <LanguageSwitcher />
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
