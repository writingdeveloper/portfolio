"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ExternalLink, Github, Rocket } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type VentureStatus = "active" | "building" | "acquired" | "archived";

interface Venture {
  id: string;
  name: string;
  description: string;
  status: VentureStatus;
  tags: string[];
  metrics?: {
    users?: string;
    revenue?: string;
    growth?: string;
  };
  links: {
    website?: string;
    github?: string;
  };
  image?: string;
}

const ventures: Venture[] = [
  {
    id: "1",
    name: "SaaS Dashboard",
    description:
      "Analytics dashboard for SaaS metrics tracking. Real-time data visualization with customizable widgets.",
    status: "active",
    tags: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
    metrics: {
      users: "2.5K+",
      revenue: "$12K MRR",
      growth: "+25%",
    },
    links: {
      website: "#",
      github: "#",
    },
  },
  {
    id: "2",
    name: "DevTools CLI",
    description:
      "Command-line toolkit for developers. Automates common development tasks and workflows.",
    status: "active",
    tags: ["Rust", "CLI", "Open Source"],
    metrics: {
      users: "500+",
      growth: "+40%",
    },
    links: {
      github: "#",
    },
  },
  {
    id: "3",
    name: "AI Writing Assistant",
    description:
      "AI-powered writing tool for content creators. Helps with grammar, style, and tone.",
    status: "building",
    tags: ["Python", "GPT-4", "React", "FastAPI"],
    links: {
      website: "#",
    },
  },
  {
    id: "4",
    name: "E-commerce Platform",
    description:
      "Full-stack e-commerce solution with inventory management and payment processing.",
    status: "acquired",
    tags: ["Node.js", "React", "MongoDB", "Stripe"],
    metrics: {
      users: "10K+",
    },
    links: {},
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function VenturesSection() {
  const t = useTranslations("ventures");

  return (
    <div>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {ventures.map((venture) => (
          <motion.div
            key={venture.id}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group rounded-xl bg-gray-900 border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-blue-400 transition-colors">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{venture.name}</h3>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full status-${venture.status}`}
                    >
                      {t(`status.${venture.status}`)}
                    </span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex items-center gap-2">
                  {venture.links.website && (
                    <a
                      href={venture.links.website}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {venture.links.github && (
                    <a
                      href={venture.links.github}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed">
                {venture.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Metrics */}
              {venture.metrics && (
                <div className="flex gap-4 mb-4">
                  {venture.metrics.users && (
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {venture.metrics.users}
                      </div>
                      <div className="text-xs text-gray-500">{t("metrics.users")}</div>
                    </div>
                  )}
                  {venture.metrics.revenue && (
                    <div>
                      <div className="text-lg font-semibold text-emerald-400">
                        {venture.metrics.revenue}
                      </div>
                      <div className="text-xs text-gray-500">{t("metrics.revenue")}</div>
                    </div>
                  )}
                  {venture.metrics.growth && (
                    <div>
                      <div className="text-lg font-semibold text-blue-400">
                        {venture.metrics.growth}
                      </div>
                      <div className="text-xs text-gray-500">{t("metrics.growth")}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {venture.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-gray-800 text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
