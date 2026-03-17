"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
  index?: number;
  /** "soon" shows a coming-soon badge */
  status?: "live" | "soon";
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  tag,
  index = 0,
  status = "live",
}: FeatureCardProps) {
  const isSoon = status === "soon";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={!isSoon ? { y: -4 } : {}}
      className="group relative flex flex-col"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E8E4",
        padding: "28px 24px 24px",
        opacity: isSoon ? 0.65 : 1,
        transition: "box-shadow 0.25s, border-color 0.25s",
        height: "100%",
      }}
    >
      {/* Top accent line — animates in on hover */}
      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "2px",
          backgroundColor: "#EBBF00",
          transformOrigin: "left",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 + 0.3 }}
      />

      {/* Corner bracket decoration */}
      <div
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ width: "12px", height: "12px" }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "8px",
            height: "1px",
            backgroundColor: "#EBBF00",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "1px",
            height: "8px",
            backgroundColor: "#EBBF00",
          }}
        />
      </div>

      {/* Tag */}
      {tag && (
        <span
          className="mb-4 self-start"
          style={{
            fontFamily: "monospace",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#AAAAAA",
          }}
        >
          {tag}
        </span>
      )}

      {/* Icon */}
      <div
        className="mb-5"
        style={{
          width: "42px",
          height: "42px",
          backgroundColor: "#F5F5F2",
          border: "1px solid #E8E8E4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "2px",
        }}
      >
        <Icon size={20} style={{ color: "#1A1A1A" }} strokeWidth={1.75} />
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: "#111111",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        {isSoon && (
          <span
            style={{
              fontSize: "8px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              backgroundColor: "#F0F0EC",
              color: "#999",
              padding: "2px 6px",
              fontFamily: "monospace",
            }}
          >
            Soon
          </span>
        )}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "13px",
          color: "#666",
          lineHeight: 1.65,
          margin: 0,
          flex: 1,
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}
