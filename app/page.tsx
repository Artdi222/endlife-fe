"use client";

import Link from "next/link";
import { motion, AnimatePresence, Variants, useScroll, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";

  //  LOADING SCREEN
function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "done">("loading");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("done");
          setTimeout(onFinish, 700);
          return 100;
        }
        const increment =
          prev < 60
            ? Math.random() * 8 + 4
            : prev < 85
            ? Math.random() * 3 + 1
            : Math.random() * 10 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onFinish]);

  const hexVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i: number) => ({
      opacity: [0, 1, 0.4],
      scale: [0, 1.2, 1],
      transition: {
        delay: i * 0.15,
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 1.2,
      },
    }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-100 bg-zinc-950 flex flex-col items-center justify-center gap-10 overflow-hidden"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-yellow-300/5 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hex grid */}
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              custom={i}
              variants={hexVariants}
              initial="hidden"
              animate="visible"
              className="text-yellow-300 text-4xl"
            >
              ⬡
            </motion.span>
          ))}
        </div>
        <div className="flex gap-3 -mt-1 ml-6">
          {[3, 4].map((i) => (
            <motion.span
              key={i}
              custom={i}
              variants={hexVariants}
              initial="hidden"
              animate="visible"
              className="text-yellow-300/40 text-4xl"
            >
              ⬡
            </motion.span>
          ))}
        </div>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="text-3xl font-black text-white tracking-tight">
          End<span className="text-yellow-300">Life</span>
        </div>
        <div className="text-zinc-500 text-xs uppercase tracking-[0.3em] mt-1 overflow-hidden">
          {["I","n","i","t","i","a","l","i","z","i","n","g"," ","O","p","e","r","a","t","i","o","n","s"].map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.04, duration: 0.3 }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-64 flex flex-col gap-2"
      >
        <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-yellow-300 rounded-full relative"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-6 bg-white/40 blur-sm"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-600 text-xs uppercase tracking-widest">Loading</span>
          <span className="text-yellow-300 text-xs font-bold tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </motion.div>

      {/* Done */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-yellow-300 text-xl font-bold flex items-center gap-2"
          >
            <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 0.5 }}>
              ✓
            </motion.span>
            Ready
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

  //  FLOATING PARTICLES
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300/20 text-lg select-none"
          style={{
            left: `${10 + (i * 7.5) % 85}%`,
            top: `${15 + (i * 13) % 70}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + (i % 4),
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        >
          ⬡
        </motion.div>
      ))}
    </div>
  );
}

  //  MAIN PAGE
export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const smoothBgY = useSpring(bgY, { stiffness: 80, damping: 20 });

  const navVariants: Variants = {
    hidden: { y: -80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
    },
  };

  const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const fadeLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onFinish={() => setIsLoading(false)} />}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-zinc-950"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* nav */}
        <motion.nav
          variants={navVariants}
          initial="hidden"
          animate={isLoading ? "hidden" : "visible"}
          className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md bg-zinc-950/80"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <motion.span
                  className="text-4xl text-yellow-300 leading-none"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  ⬡
                </motion.span>
                <div className="text-xl font-extrabold text-white tracking-tight">
                  End<span className="text-yellow-300">Life</span>
                </div>
              </motion.div>

              {/* <div className="flex items-center gap-3">
                {[
                  { label: "Sign In", href: "/login" },
                  { label: "Sign Up", href: "/register" },
                ].map(({ label, href }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: isLoading ? 0 : 1, x: isLoading ? 20 : 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  >
                    <Link href={href}>
                      <motion.button
                        whileHover={{ scale: 1.06, boxShadow: "0 0 20px rgba(253,224,71,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-yellow-300 hover:bg-yellow-400 text-zinc-900 rounded-md font-semibold px-5 py-2 text-sm cursor-pointer transition-colors"
                      >
                        {label}
                      </motion.button>
                    </Link>
                  </motion.div>
                ))}
              </div> */}
            </div>
          </div>
        </motion.nav>

        {/* hero */}
        <section
          ref={heroRef}
          className="relative h-screen min-h-150 overflow-hidden flex items-center"
        >
          {/* Parallax BG */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{
              backgroundImage:
                "url('https://static0.dualshockersimages.com/wordpress/wp-content/uploads/2025/11/arknights-endfield-dualshockers-preview-screenshots.jpg?q=70&fit=crop&w=1600&h=900&dpr=1')",
              
            }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/65 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-transparent to-transparent" />

          <Particles />

          {/* Decorative hex */}
          <motion.div
            className="absolute right-8 top-1/2 -translate-y-1/2 text-yellow-300/8 text-[260px] select-none pointer-events-none"
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={isLoading ? {} : { opacity: 1, rotate: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            ⬡
          </motion.div>
          <motion.div
            className="absolute right-40 top-1/4 text-yellow-300/5 text-[120px] select-none pointer-events-none"
            animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            ⬡
          </motion.div>

          {/* Hero content */}
          <motion.div
            className="relative max-w-7xl mx-auto px-7 lg:px-8 w-full"
            style={{ y: contentY, opacity: heroOpacity }}
          >
            <motion.div
              className="max-w-2xl"
              variants={stagger}
              initial="hidden"
              animate={isLoading ? "hidden" : "visible"}
            >
              {/* Badge */}
              <motion.div variants={fadeLeft} className="mb-6 inline-flex">
                <motion.span
                  className="inline-flex items-center gap-2 bg-yellow-300/10 border border-yellow-300/30 text-yellow-300 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(253,224,71,0.15)" }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-yellow-300"
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Arknights: Endfield
                </motion.span>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight"
                variants={stagger}
              >
                {["Endfield", "Daily", "Operations"].map((word, wi) => (
                  <motion.span
                    key={word}
                    variants={fadeUp}
                    className={`inline-block mr-4 ${wi === 1 ? "text-yellow-300" : ""} ${wi === 2 ? "block mr-0" : ""}`}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="text-lg text-zinc-300 mb-10 leading-relaxed max-w-lg"
              >
                A simple daily checklist for Arknights: Endfield players to track
                missions, tasks, and progress — all in one place.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeUp} className="flex items-center gap-4 flex-wrap">
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.06, boxShadow: "0 0 35px rgba(253,224,71,0.4)" }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-yellow-300 hover:bg-yellow-400 text-zinc-900 px-8 py-3.5 text-base rounded-md font-bold cursor-pointer transition-colors shadow-lg shadow-yellow-300/20 relative overflow-hidden"
                  >
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.4 }}
                    />
                    Start Daily Check →
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.04, borderColor: "rgba(253,224,71,0.5)", backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.96 }}
                    className="border border-white/20 text-white px-8 py-3.5 text-base rounded-md font-semibold cursor-pointer transition-all backdrop-blur-sm"
                  >
                    Sign In
                  </motion.button>
                </Link>
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
            <span className="text-zinc-500 text-xs uppercase tracking-widest">Scroll</span>
            <motion.div
              className="w-px h-10 bg-linear-to-b from-zinc-400 to-transparent"
              animate={{ scaleY: [1, 0.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ originY: 0 }}
            />
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <motion.footer
          className="bg-zinc-950 border-t border-white/5 py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <motion.span
                className="text-yellow-300 text-2xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                ⬡
              </motion.span>
              <span className="text-zinc-500 text-sm">
                EndLife — Endfield Daily Tracker
              </span>
            </motion.div>
            <span className="text-zinc-600 text-xs">Not affiliated with Hypergryph</span>
          </div>
        </motion.footer>
      </motion.div>
    </>
  );
}