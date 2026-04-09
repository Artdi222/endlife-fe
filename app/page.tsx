"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

import LoadingScreen from "@/components/landing/LoadingScreen";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTASection from "@/components/landing/CTASection";
import OperatorSection from "@/components/operator/operatorSection";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Operators", href: "#operators" },
  { label: "About", href: "#cta" },
];

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  const scrollTo = useCallback((href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onFinish={() => setIsLoading(false)} />}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* ── Navigation ── */}
        <motion.nav
          initial={{ y: -80, opacity: 0 }}
          animate={isLoading ? { y: -80, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
          style={{
            backgroundColor: "rgba(250,250,248,0.92)",
            borderBottom: "1px solid #E8E8E4",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <button
                onClick={() => scrollTo("#hero")}
                className="flex items-center gap-2.5"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <span
                  className="text-3xl leading-none"
                  style={{ color: "#EBBF00" }}
                >
                  ⬡
                </span>
                <div className="font-black text-zinc-900 tracking-tight text-lg">
                  End<span style={{ color: "#EBBF00" }}>Life</span>
                </div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "8px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#AAAAAA",
                    marginLeft: "2px",
                  }}
                >
                  v0.1
                </span>
              </button>

              {/* Nav links */}
              <div className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map(({ label, href }) => (
                  <button
                    key={label}
                    onClick={() => scrollTo(href)}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#888",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 0",
                      position: "relative",
                    }}
                    className="hover:text-zinc-900 transition-colors duration-200 group"
                  >
                    {label}
                    {/* underline on hover */}
                    <span
                      className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                      style={{ backgroundColor: "#EBBF00" }}
                    />
                  </button>
                ))}
              </div>

              {/* Auth */}
              <div className="flex items-center gap-3">
                <a
                  href="/sign-in"
                  style={{ fontSize: "13px", fontWeight: 600, color: "#666" }}
                  className="hidden sm:block hover:text-zinc-900 transition-colors duration-200"
                >
                  Sign in
                </a>
                <a href="/sign-up">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      backgroundColor: "#EBBF00",
                      color: "#111",
                      fontWeight: 600,
                      fontSize: "12px",
                      letterSpacing: "0.04em",
                      padding: "8px 18px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Get Started
                  </motion.button>
                </a>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* ── Sections ── */}

        {/* Hero gets id inside HeroSection itself (id="hero") */}
        <HeroSection isLoading={isLoading} />

        {/* Features — id handled inside FeaturesSection (id="features") */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <FeaturesSection />
        </motion.div>

        <div id="operators">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <OperatorSection limit={4} />
          </motion.div>
        </div>

        {/* CTA */}
        <div id="cta">
          <CTASection />
        </div>

        {/* Footer */}
        <footer
          style={{
            backgroundColor: "#111111",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <motion.span
                style={{ color: "#EBBF00", fontSize: "18px" }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                ⬡
              </motion.span>
              <span style={{ color: "#555", fontSize: "13px" }}>
                EndLife — Endfield Daily Tracker
              </span>
            </div>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                color: "#444",
                letterSpacing: "0.1em",
              }}
            >
              Not affiliated with Hypergryph / Yostar
            </span>
          </div>
        </footer>
      </motion.div>
    </>
  );
}
