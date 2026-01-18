"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Rocket, Award } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type TimelineType = "work" | "education" | "venture" | "achievement";

interface TimelineItem {
  id: string;
  type: TimelineType;
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  description: string;
  highlights?: string[];
}

const timelineItems: TimelineItem[] = [
  {
    id: "1",
    type: "work",
    title: "Senior Software Engineer",
    organization: "Tech Company",
    startDate: "2023-01",
    description:
      "Leading frontend architecture and mentoring junior developers. Building scalable web applications with React and Next.js.",
    highlights: [
      "Led migration to Next.js App Router",
      "Reduced bundle size by 40%",
      "Mentored 3 junior developers",
    ],
  },
  {
    id: "2",
    type: "venture",
    title: "Founder & CEO",
    organization: "SaaS Startup",
    startDate: "2022-06",
    description:
      "Founded and bootstrapped a SaaS product for analytics dashboards. Managing product, engineering, and customer success.",
    highlights: [
      "Reached $12K MRR",
      "2,500+ active users",
      "Featured on Product Hunt",
    ],
  },
  {
    id: "3",
    type: "work",
    title: "Software Engineer",
    organization: "Startup Inc",
    startDate: "2021-03",
    endDate: "2022-12",
    description:
      "Full-stack development with React, Node.js, and PostgreSQL. Implemented core features and improved system performance.",
    highlights: [
      "Built real-time notification system",
      "Improved API response time by 60%",
    ],
  },
  {
    id: "4",
    type: "achievement",
    title: "AWS Solutions Architect",
    organization: "Amazon Web Services",
    startDate: "2021-08",
    endDate: "2021-08",
    description: "Achieved AWS Solutions Architect Associate certification.",
  },
  {
    id: "5",
    type: "education",
    title: "B.S. Computer Science",
    organization: "University",
    startDate: "2017-03",
    endDate: "2021-02",
    description:
      "Major in Computer Science with focus on software engineering and algorithms.",
    highlights: ["GPA 3.8/4.0", "Dean's List", "CS Club President"],
  },
];

const typeIcons = {
  work: Briefcase,
  education: GraduationCap,
  venture: Rocket,
  achievement: Award,
};

const typeColors = {
  work: "bg-blue-500",
  education: "bg-purple-500",
  venture: "bg-emerald-500",
  achievement: "bg-amber-500",
};

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
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export function TimelineSection() {
  const t = useTranslations("timeline");

  return (
    <div>
      <SectionHeader title={t("title")} subtitle={t("subtitle")} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800 hidden md:block" />

        <div className="space-y-6">
          {timelineItems.map((item, index) => {
            const Icon = typeIcons[item.type];

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="relative md:pl-16"
              >
                {/* Icon */}
                <div
                  className={`absolute left-0 top-0 hidden md:flex w-12 h-12 rounded-xl items-center justify-center ${typeColors[item.type]}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ x: 4 }}
                  className="rounded-xl bg-gray-900 border border-gray-800 p-5 hover:border-gray-700 transition-colors"
                >
                  {/* Mobile Icon */}
                  <div className="md:hidden mb-4">
                    <div
                      className={`inline-flex w-10 h-10 rounded-lg items-center justify-center ${typeColors[item.type]}`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.organization}</p>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(item.startDate)} -{" "}
                      {item.endDate ? formatDate(item.endDate) : t("present")}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Highlights */}
                  {item.highlights && (
                    <div className="flex flex-wrap gap-2">
                      {item.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-md bg-gray-800 text-gray-400"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
