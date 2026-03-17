"use client";

import { motion, Variants } from "framer-motion";
import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
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
      className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center gap-10 overflow-hidden"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-yellow-300/5 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hex icons */}
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
          {[..."Initializing Operations"].map((char, i) => (
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

      {/* Progress */}
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
          <span className="text-zinc-600 text-xs uppercase tracking-widest">
            Loading
          </span>
          <span className="text-yellow-300 text-xs font-bold tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
