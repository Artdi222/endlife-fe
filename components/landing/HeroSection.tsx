"use client";

import Link from "next/link";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Zap } from "lucide-react";

interface HeroSectionProps {
  isLoading: boolean;
}

export default function HeroSection({ isLoading }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 32, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative overflow-hidden flex items-center"
      style={{
        minHeight: "100svh",
        backgroundColor: "#FAFAF8",
      }}
    >
      {/* Technical grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.032) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Diagonal hatch — right half only */}
      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          width: "50%",
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(0,0,0,0.018) 12px, rgba(0,0,0,0.018) 13px)",
        }}
      />

      {/* Yellow accent block — right side geometric */}
      <motion.div
        className="absolute"
        style={{
          top: "8%",
          right: "6%",
          width: "38%",
          height: "72%",
          backgroundColor: "#EBBF00",
          zIndex: 0,
        }}
        initial={{ opacity: 0, scale: 0.9, x: 40 }}
        animate={isLoading ? {} : { opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />

      {/* Game screenshot inside the yellow box */}
      <motion.div
        className="absolute overflow-hidden"
        style={{
          top: "8%",
          right: "6%",
          width: "38%",
          height: "72%",
          zIndex: 1,
        }}
        initial={{ opacity: 0 }}
        animate={isLoading ? {} : { opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <img
          src="/landing/ArknightsEndfield.webp"
          alt="Arknights Endfield"
          className="w-full h-full object-cover"
          style={{
            mixBlendMode: "multiply",
            filter: "contrast(1.05) saturate(0.9)",
          }}
        />
        {/* Overlay gradient on image edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, #FAFAF8 0%, transparent 12%, transparent 95%, #FAFAF8 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #FAFAF8 0%, transparent 5%, transparent 85%, #FAFAF8 100%)",
          }}
        />
      </motion.div>

      {/* Big decorative text behind */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: "-2%",
          left: 0,
          right: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "clamp(80px, 14vw, 200px)",
            fontWeight: 900,
            color: "rgba(0,0,0,0.04)",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          ENDFIELD
        </span>
      </div>

      {/* Left accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{
          width: "3px",
          background: "linear-gradient(to bottom, #EBBF00 40%, transparent)",
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-20 pb-24"
        style={{ y: contentY, opacity: heroOpacity }}
      >
        <motion.div
          className="max-w-xl"
          variants={stagger}
          initial="hidden"
          animate={isLoading ? "hidden" : "visible"}
        >
          {/* Status badge */}
          <motion.div variants={fadeUp} className="mb-8 inline-flex">
            <span
              className="inline-flex items-center gap-2"
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#888",
              }}
            >
              <Zap size={10} style={{ color: "#EBBF00" }} />
              Arknights: Endfield — QoL Companion
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="font-black leading-none tracking-tight mb-6"
            style={{ fontSize: "clamp(44px, 7vw, 80px)", color: "#111111" }}
            variants={stagger}
          >
            {[
              { text: "Endfield", color: "#111111" },
              { text: "Daily", color: "#EBBF00" },
              { text: "Operations", color: "#111111" },
            ].map(({ text, color }, wi) => (
              <motion.span
                key={text}
                variants={fadeUp}
                style={{
                  display: wi === 2 ? "block" : "inline-block",
                  marginRight: wi === 2 ? 0 : "0.28em",
                  color,
                }}
              >
                {text}
              </motion.span>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: "16px",
              color: "#555",
              lineHeight: 1.7,
              maxWidth: "440px",
              marginBottom: "40px",
            }}
          >
            Your Endfield companion — daily missions, ascension planning, team
            builds, and base blueprints. All in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 flex-wrap"
          >
            <Link href="/sign-up">
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 6px 24px rgba(235,191,0,0.35)",
                }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden inline-flex items-center gap-2"
                style={{
                  backgroundColor: "#EBBF00",
                  color: "#111",
                  fontWeight: 600,
                  fontSize: "14px",
                  letterSpacing: "0.02em",
                  padding: "13px 28px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <motion.span
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.4 }}
                />
                Get Started
                <ArrowRight size={14} />
              </motion.button>
            </Link>
            <Link href="/sign-in">
              <motion.button
                whileHover={{ borderColor: "#EBBF00", color: "#111" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  backgroundColor: "transparent",
                  color: "#666",
                  fontWeight: 600,
                  fontSize: "14px",
                  padding: "13px 28px",
                  border: "1px solid #D8D8D4",
                  cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s",
                }}
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-6 mt-12 pt-8"
            style={{ borderTop: "1px solid #E8E8E4" }}
          >
            {[
              { value: "4+", label: "Features" },
              { value: "26", label: "Operators" },
              { value: "Free", label: "Always" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#111",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "9px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#AAA",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={isLoading ? {} : { opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "9px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#BBB",
          }}
        >
          Scroll
        </span>
        <motion.div
          className="w-px h-8"
          style={{
            background: "linear-gradient(to bottom, #BBBBB8, transparent)",
            originY: 0,
          }}
          animate={{ scaleY: [1, 0.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
