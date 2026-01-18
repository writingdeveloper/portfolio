"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function MetricCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  trend,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-xl bg-gray-900 border border-gray-800 p-5 overflow-hidden group"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-400">{title}</span>
          <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-blue-400 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-bold text-white">{value}</span>
          {unit && <span className="text-lg text-gray-500">{unit}</span>}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500">{description}</p>

        {/* Trend indicator */}
        {trend && (
          <div
            className={`mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
