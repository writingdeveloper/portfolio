"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
        {title}
      </h1>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
    </motion.div>
  );
}
