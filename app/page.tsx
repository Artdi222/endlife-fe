"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const navVariants = {
    hidden: { y: -80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      {/* NAV */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md bg-zinc-950/80"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <motion.span
                className="text-4xl text-yellow-300 leading-none"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                ⬡
              </motion.span>
              <div className="text-xl font-extrabold text-white tracking-tight">
                End<span className="text-yellow-300">Life</span>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {["Sign In", "Sign Up"].map((label, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={i === 0 ? "/login" : "/register"}>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#fde047" }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-yellow-300 text-zinc-900 rounded-md font-semibold px-5 py-2 text-sm cursor-pointer transition-colors"
                    >
                      {label}
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative h-screen min-h-[600px] overflow-hidden flex items-center"
      >
        {/* Parallax background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage:
              "url('https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arknights-endfield-dualshockers-preview-screenshots.jpg?q=70&fit=crop&w=1600&h=900&dpr=1')",
            y: bgY,
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

        {/* Animated scanline effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
          animate={{ backgroundPositionY: ["0px", "4px"] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Decorative hex accents */}
        <motion.div
          className="absolute right-16 top-1/3 text-yellow-300/10 text-[200px] select-none pointer-events-none"
          initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ delay: 1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          ⬡
        </motion.div>
        <motion.div
          className="absolute right-32 top-1/4 text-yellow-300/5 text-[100px] select-none pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { delay: 1.4, duration: 0.8 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          ⬡
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative max-w-7xl mx-auto px-7 lg:px-8 w-full"
          style={{ y: textY, opacity }}
        >
          <motion.div
            className="max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={badgeVariants} className="mb-6 inline-flex">
              <span className="inline-flex items-center gap-2 bg-yellow-300/10 border border-yellow-300/30 text-yellow-300 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
                Arknights: Endfield
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight"
            >
              Endfield
              <br />
              <span className="text-yellow-300">Daily</span>{" "}
              Operations
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-zinc-300 mb-10 leading-relaxed max-w-lg"
            >
              A simple daily checklist for Arknights: Endfield players to track
              missions, tasks, and progress — all in one place.
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 flex-wrap">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(253,224,71,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-yellow-300 hover:bg-yellow-400 text-zinc-900 px-8 py-3.5 text-base rounded-md font-bold cursor-pointer transition-colors shadow-lg shadow-yellow-300/20"
                >
                  Start Daily Check →
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.03, borderColor: "rgba(253,224,71,0.6)" }}
                  whileTap={{ scale: 0.97 }}
                  className="border border-white/20 text-white px-8 py-3.5 text-base rounded-md font-semibold cursor-pointer hover:bg-white/5 transition-all backdrop-blur-sm"
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={itemVariants}
              className="mt-14 flex items-center gap-8 border-t border-white/10 pt-8"
            >
              {[
                { value: "Daily", label: "Mission Tracking" },
                { value: "Free", label: "Always" },
                { value: "Fast", label: "& Lightweight" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="text-yellow-300 font-black text-xl">{stat.value}</span>
                  <span className="text-zinc-400 text-xs uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          <span className="text-zinc-500 text-xs uppercase tracking-widest">Scroll</span>
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-zinc-500 to-transparent"
            animate={{ scaleY: [1, 0.4, 1], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      <footer className="bg-zinc-950 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-yellow-300 text-2xl">⬡</span>
            <span className="text-zinc-500 text-sm">
              EndLife — Endfield Daily Tracker
            </span>
          </div>
          <span className="text-zinc-600 text-xs">
            Not affiliated with Hypergryph
          </span>
        </div>
      </footer>
    </div>
  );
}