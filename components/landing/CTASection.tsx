"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

export default function CTASection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#111111" }}
    >
      {/* Diagonal hatch */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 18px, rgba(255,255,255,0.015) 18px, rgba(255,255,255,0.015) 19px)",
        }}
      />

      {/* Yellow glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] pointer-events-none"
        style={{
          width: "400px",
          height: "200px",
          backgroundColor: "rgba(235,191,0,0.08)",
        }}
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, #EBBF00 30%, transparent)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          {/* Left copy */}
          <div className="max-w-xl">
            <SectionLabel variant="dark" className="mb-6">
              Ready to Deploy
            </SectionLabel>

            <motion.h2
              className="text-4xl lg:text-5xl font-black text-white leading-[1.05] tracking-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Stop forgetting.{" "}
              <span style={{ color: "#EBBF00" }}>Start tracking.</span>
            </motion.h2>

            <motion.p
              className="text-zinc-400 leading-relaxed text-base"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Free to use. No setup needed. Sign up and your dashboard is ready
              in seconds — daily checklist loaded, operators synced.
            </motion.p>
          </div>

          {/* Right CTA card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.03)",
              padding: "32px",
              minWidth: "300px",
              backdropFilter: "blur(8px)",
              position: "relative",
            }}
          >
            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderRight: "none", borderBottom: "none" },
              { top: 0, right: 0, borderLeft: "none", borderBottom: "none" },
              { bottom: 0, left: 0, borderRight: "none", borderTop: "none" },
              { bottom: 0, right: 0, borderLeft: "none", borderTop: "none" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "16px",
                  height: "16px",
                  border: "1px solid #EBBF00",
                  ...s,
                }}
              />
            ))}

            <div
              style={{
                fontFamily: "monospace",
                fontSize: "9px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                marginBottom: "20px",
              }}
            >
              Free — No credit card
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/sign-up">
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 30px rgba(235,191,0,0.3)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full relative overflow-hidden"
                  style={{
                    backgroundColor: "#EBBF00",
                    color: "#111",
                    fontWeight: 600,
                    fontSize: "14px",
                    letterSpacing: "0.04em",
                    padding: "14px 24px",
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
                  Create Free Account →
                </motion.button>
              </Link>

              <Link href="/sign-in">
                <motion.button
                  whileHover={{
                    borderColor: "rgba(255,255,255,0.3)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                  style={{
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 600,
                    fontSize: "13px",
                    padding: "12px 24px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "border-color 0.2s, background-color 0.2s",
                  }}
                >
                  Already have an account? Sign in
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.05) 30%, transparent)",
        }}
      />
    </section>
  );
}
