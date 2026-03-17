"use client";

import { motion } from "framer-motion";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  /** "light" = for white backgrounds, "dark" = for dark backgrounds */
  variant?: "light" | "dark";
  animate?: boolean;
}

export default function SectionLabel({
  children,
  className = "",
  variant = "light",
  animate = true,
}: SectionLabelProps) {
  const isLight = variant === "light";

  const inner = (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      style={{
        fontFamily: "monospace",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: isLight ? "#888" : "rgba(255,255,255,0.5)",
      }}
    >
      <span style={{ color: "#EBBF00", fontWeight: 900 }}>[</span>
      {children}
      <span style={{ color: "#EBBF00", fontWeight: 900 }}>]</span>
    </span>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  );
}
