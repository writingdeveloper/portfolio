"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Wrench, Lightbulb, BookOpen, Code, Heart, Coffee } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const highlights = [
  { key: "builder", icon: Wrench },
  { key: "problemSolver", icon: Lightbulb },
  { key: "learner", icon: BookOpen },
];

const interests = [
  { icon: Code, key: "openSource" },
  { icon: Heart, key: "productDesign" },
  { icon: Coffee, key: "startups" },
];

const funFacts = [
  { emoji: "☕", key: "coffee" },
  { emoji: "🌙", key: "nightOwl" },
  { emoji: "📚", key: "learning" },
  { emoji: "🎮", key: "gamer" },
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

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <div>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Main About Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden"
        >
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"
                >
                  <span className="text-5xl lg:text-6xl">👨‍💻</span>
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {t("greeting")}{" "}
                  <span className="gradient-text">{t("role")}</span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {t("description")}
                </p>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {highlights.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="rounded-lg bg-gray-800/50 border border-gray-700 p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Icon className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="font-medium text-white">
                            {t(`highlights.${item.key}.title`)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {t(`highlights.${item.key}.description`)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interests & Values */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interests */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gray-900 border border-gray-800 p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("interests")}
            </h3>
            <div className="flex flex-wrap gap-3">
              {interests.map((interest, index) => {
                const Icon = interest.icon;
                return (
                  <motion.div
                    key={interest.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t(`interestItems.${interest.key}`)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Fun Facts */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-gray-900 border border-gray-800 p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("funFacts")}
            </h3>
            <div className="space-y-3">
              {funFacts.map((fact, index) => (
                <motion.div
                  key={fact.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 text-gray-400"
                >
                  <span className="text-xl">{fact.emoji}</span>
                  <span className="text-sm">{t(`funFactItems.${fact.key}`)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
