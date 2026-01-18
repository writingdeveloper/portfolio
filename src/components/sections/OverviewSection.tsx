"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Briefcase, FolderKanban, Rocket, Layers } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricCard } from "@/components/ui/MetricCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function OverviewSection() {
  const t = useTranslations("overview");

  const metrics = [
    {
      key: "experience",
      icon: Briefcase,
    },
    {
      key: "projects",
      icon: FolderKanban,
    },
    {
      key: "ventures",
      icon: Rocket,
    },
    {
      key: "techStack",
      icon: Layers,
    },
  ];

  const activities = [
    {
      actionKey: "deployed",
      targetKey: "portfolioV2",
      timeKey: "hoursAgo",
      hours: 2,
    },
    {
      actionKey: "pushed",
      targetKey: "featureUpdate",
      timeKey: "hoursAgo",
      hours: 5,
    },
    {
      actionKey: "merged",
      targetKey: "pr",
      timeKey: "dayAgo",
    },
  ];

  const skills = [
    { name: "React / Next.js", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "System Design", level: 80 },
  ];

  return (
    <div>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.key}
            title={t(`cards.${metric.key}.title`)}
            value={t(`cards.${metric.key}.value`)}
            unit={t(`cards.${metric.key}.unit`)}
            description={t(`cards.${metric.key}.description`)}
            icon={metric.icon}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Recent Activity Card */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("recentActivity")}
          </h3>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-300">
                    {t(`activities.${activity.actionKey}`)}{" "}
                    <span className="text-white font-medium">
                      {t(`activities.${activity.targetKey}`)}
                    </span>
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {activity.hours
                    ? t(`activities.${activity.timeKey}`, { hours: activity.hours })
                    : t(`activities.${activity.timeKey}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Overview Card */}
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("topSkills")}
          </h3>
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{skill.name}</span>
                  <span className="text-gray-500">{skill.level}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
