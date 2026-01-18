"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Send,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const socialLinks = [
  { icon: Github, label: "GitHub", href: "https://github.com", color: "hover:text-white" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com", color: "hover:text-blue-400" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com", color: "hover:text-sky-400" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ContactSection() {
  const t = useTranslations("contact");

  return (
    <div>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Contact Info */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Description Card */}
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <p className="text-gray-400 leading-relaxed">{t("description")}</p>
          </div>

          {/* Contact Details */}
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 space-y-4">
            {/* Email */}
            <motion.a
              href="mailto:hello@example.com"
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
            >
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{t("email")}</div>
                <div className="text-white font-medium">hello@example.com</div>
              </div>
            </motion.a>

            {/* Location */}
            <div className="flex items-center gap-4 p-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500">{t("location")}</div>
                <div className="text-white font-medium">Seoul, South Korea</div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-4">
              {t("social")}
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg bg-gray-800 text-gray-400 ${social.color} transition-colors`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-gray-900 border border-gray-800 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-6">{t("cta")}</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("form.name")}
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder={t("form.namePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("form.email")}
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder={t("form.emailPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {t("form.message")}
              </label>
              <textarea
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder={t("form.messagePlaceholder")}
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium hover:from-blue-600 hover:to-emerald-600 transition-all"
            >
              <Send className="w-4 h-4" />
              {t("cta")}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
