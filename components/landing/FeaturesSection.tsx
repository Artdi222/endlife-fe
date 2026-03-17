"use client";

import { motion } from "framer-motion";
import { CalendarCheck, TrendingUp, Users, LayoutGrid } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import FeatureCard from "@/components/ui/FeatureCard";

const FEATURES = [
  {
    icon: CalendarCheck,
    tag: "01 — Daily",
    title: "Daily Checklist",
    description:
      "Never miss daily or weekly missions again. Track your progress, reset timers, and stay on top of every recurring task.",
    status: "live" as const,
  },
  {
    icon: TrendingUp,
    tag: "02 — Planning",
    title: "Ascension Planner",
    description:
      "Map out material farming for characters and weapons. See exactly what you need and how far you are from your next breakthrough.",
    status: "soon" as const,
  },
  {
    icon: Users,
    tag: "03 — Combat",
    title: "Team Builder",
    description:
      "Compose and save team formations. Try combinations, compare synergies, and build for every content type in the game.",
    status: "soon" as const,
  },
  {
    icon: LayoutGrid,
    tag: "04 — Base",
    title: "Base Blueprints",
    description:
      "Browse community-shared base layouts. Share your own designs, rate the best ones, and find builds optimized for your playstyle.",
    status: "soon" as const,
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      {/* Technical grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{
          width: "3px",
          background: "linear-gradient(to bottom, #EBBF00, transparent)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        {/* Header */}
        <div className="mb-16">
          <SectionLabel variant="light" className="mb-4">
            Features
          </SectionLabel>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <motion.h2
              className="text-4xl lg:text-5xl font-black text-zinc-900 leading-[1.05] tracking-tight max-w-lg"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1,
              }}
            >
              Everything you need.{" "}
              <span style={{ color: "#EBBF00" }}>Nothing you don&apos;t.</span>
            </motion.h2>

            <motion.p
              className="text-sm text-zinc-400 max-w-xs leading-relaxed"
              style={{ fontFamily: "monospace" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Built for operators who want to focus on the game, not
              spreadsheets.
            </motion.p>
          </div>

          {/* Divider */}
          <motion.div
            className="mt-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{
              transformOrigin: "left",
              height: "1px",
              backgroundColor: "#E8E8E4",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "80px",
                height: "1px",
                background: "linear-gradient(to right, #EBBF00, transparent)",
              }}
            />
          </motion.div>
        </div>

        {/* Cards grid — seamless with 1px gaps */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ backgroundColor: "#E8E8E4" }}
        >
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              style={{ backgroundColor: "#FAFAF8", display: "flex" }}
            >
              <FeatureCard {...feat} index={i} />
            </div>
          ))}
        </div>

        {/* Bottom meta row */}
        <motion.div
          className="mt-8 flex items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              color: "#BBBBBB",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            1 live &middot; 3 coming soon
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#EBEBEB" }} />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              color: "#BBBBBB",
              letterSpacing: "0.18em",
            }}
          >
            [ ENDLIFE v0.1 ]
          </span>
        </motion.div>
      </div>
    </section>
  );
}
