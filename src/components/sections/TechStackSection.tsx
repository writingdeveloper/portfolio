"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface TechItem {
  name: string;
  icon: string;
  level: "expert" | "advanced" | "intermediate";
  years: number;
}

interface TechCategory {
  key: string;
  items: TechItem[];
}

const techStack: TechCategory[] = [
  {
    key: "frontend",
    items: [
      { name: "React", icon: "⚛️", level: "expert", years: 5 },
      { name: "Next.js", icon: "▲", level: "expert", years: 4 },
      { name: "TypeScript", icon: "🔷", level: "expert", years: 4 },
      { name: "Tailwind CSS", icon: "🎨", level: "expert", years: 3 },
      { name: "Vue.js", icon: "💚", level: "advanced", years: 2 },
    ],
  },
  {
    key: "backend",
    items: [
      { name: "Node.js", icon: "🟢", level: "expert", years: 5 },
      { name: "Python", icon: "🐍", level: "advanced", years: 3 },
      { name: "Go", icon: "🐹", level: "intermediate", years: 1 },
      { name: "Rust", icon: "🦀", level: "intermediate", years: 1 },
    ],
  },
  {
    key: "database",
    items: [
      { name: "PostgreSQL", icon: "🐘", level: "expert", years: 4 },
      { name: "MongoDB", icon: "🍃", level: "advanced", years: 3 },
      { name: "Redis", icon: "🔴", level: "advanced", years: 3 },
      { name: "Supabase", icon: "⚡", level: "advanced", years: 2 },
    ],
  },
  {
    key: "devops",
    items: [
      { name: "Docker", icon: "🐳", level: "advanced", years: 3 },
      { name: "AWS", icon: "☁️", level: "advanced", years: 3 },
      { name: "Vercel", icon: "▲", level: "expert", years: 3 },
      { name: "GitHub Actions", icon: "🔄", level: "advanced", years: 2 },
    ],
  },
  {
    key: "tools",
    items: [
      { name: "Git", icon: "📦", level: "expert", years: 6 },
      { name: "Figma", icon: "🎨", level: "advanced", years: 3 },
      { name: "VS Code", icon: "💻", level: "expert", years: 5 },
      { name: "Notion", icon: "📝", level: "expert", years: 3 },
    ],
  },
];

const levelColors = {
  expert: "from-emerald-500 to-emerald-600",
  advanced: "from-blue-500 to-blue-600",
  intermediate: "from-amber-500 to-amber-600",
};

const levelBgColors = {
  expert: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  advanced: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

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

export function TechStackSection() {
  const t = useTranslations("techStack");

  return (
    <div>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {techStack.map((category) => (
          <motion.div
            key={category.key}
            variants={itemVariants}
            className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden"
          >
            {/* Category Header */}
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {t(`categories.${category.key}`)}
              </h3>
            </div>

            {/* Tech Items Grid */}
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.items.map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-lg bg-gray-800/50 border border-gray-700 p-4 group hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tech.icon}</span>
                        <div>
                          <div className="font-medium text-white">
                            {tech.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t("yearsExp", { years: tech.years })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full border ${levelBgColors[tech.level]}`}
                    >
                      {t(`levels.${tech.level}`)}
                    </span>

                    {/* Progress Bar */}
                    <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width:
                            tech.level === "expert"
                              ? "100%"
                              : tech.level === "advanced"
                              ? "75%"
                              : "50%",
                        }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                        className={`h-full rounded-full bg-gradient-to-r ${levelColors[tech.level]}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
