"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  stats?: string;
}

export default function ToolCard({ name, description, icon: Icon, path, color, stats }: ToolCardProps) {
  return (
    <Link href={path}>
      <div className="tool-card group relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#141414] p-6">
        {/* Background Gradient */}
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
          style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 100%)` }}
        />

        {/* Icon */}
        <div
          className="mb-4 inline-flex rounded-xl p-3"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-8 w-8" style={{ color }} />
        </div>

        {/* Content */}
        <h3 className="mb-2 text-xl font-semibold text-white">{name}</h3>
        <p className="mb-4 text-sm text-[#a1a1aa]">{description}</p>

        {/* Stats or Action */}
        <div className="flex items-center justify-between">
          {stats && <span className="text-xs text-[#71717a]">{stats}</span>}
          <span
            className="text-sm font-medium transition-colors"
            style={{ color }}
          >
            Explore →
          </span>
        </div>

        {/* Hover Border Effect */}
        <div
          className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </Link>
  );
}