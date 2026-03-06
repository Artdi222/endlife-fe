"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Typed from "typed.js";
import {
  categoriesApi,
  groupsApi,
  subGroupsApi,
  tasksApi,
} from "@/lib/api/index";

const statDefs = [
  { label: "Categories", icon: "◈", key: "categories" },
  { label: "Groups", icon: "◫", key: "groups" },
  { label: "Sub Groups", icon: "◧", key: "subGroups" },
  { label: "Tasks", icon: "✦", key: "tasks" },
] as const;

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    categories: 0,
    groups: 0,
    subGroups: 0,
    tasks: 0,
  });
  const [showGreeting, setShowGreeting] = useState(true);
  const [typingDone, setTypingDone] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);
  const typedInstance = useRef<Typed | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const catRes = await categoriesApi.getAll();
        const cats = catRes.data ?? [];
        const groupArrays = await Promise.all(
          cats.map((c) => groupsApi.getByCategoryId(c.id)),
        );
        const allGroups = groupArrays.flatMap((r) => r.data ?? []);
        const subArrays = await Promise.all(
          allGroups.map((g) => subGroupsApi.getByGroupId(g.id)),
        );
        const allSubs = subArrays.flatMap((r) => r.data ?? []);
        const taskArrays = await Promise.all(
          allGroups.map((g) => tasksApi.getByGroupId(g.id)),
        );
        const allTasks = taskArrays.flatMap((r) => r.data ?? []);
        setCounts({
          categories: cats.length,
          groups: allGroups.length,
          subGroups: allSubs.length,
          tasks: allTasks.length,
        });
      } catch (e) {
        console.error("Failed to load dashboard counts", e);
      }
    };
    fetchAll();
  }, []);

  // Typed.js starts after "Welcome Back" fades in (~1.8s)
  useEffect(() => {
    if (!showGreeting) return;
    const timeout = setTimeout(() => {
      if (!typedRef.current) return;
      typedInstance.current = new Typed(typedRef.current, {
        strings: ["Endministrator"],
        typeSpeed: 120, // slow — each character takes 120ms
        startDelay: 0,
        showCursor: true,
        cursorChar: "▌",
        onComplete: () => {
          setTimeout(() => setTypingDone(true), 1200);
          setTimeout(() => setShowGreeting(false), 2800);
        },
      });
    }, 1800);

    return () => {
      clearTimeout(timeout);
      typedInstance.current?.destroy();
    };
  }, [showGreeting]);

  return (
    <>
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {/* Scanlines */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)",
              }}
            />

            {/* Light streak */}
            <motion.div
              className="absolute h-px bg-yellow-300/30 w-0 left-0"
              style={{ top: "50%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.4, ease: "easeInOut", delay: 0.2 }}
            />

            <div className="relative flex flex-col items-center gap-8 text-center px-8">
              {/* Welcome Back */}
              <motion.div
                initial={{ opacity: 0, y: 40, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.15em" }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                className="text-5xl md:text-7xl font-extrabold text-white tracking-[0.15em] uppercase"
              >
                Welcome Back
              </motion.div>

              {/* Typed */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="flex items-center mt-16 gap-2 text-2xl md:text-4xl font-mono font-black text-yellow-300 tracking-widest uppercase"
              >
                <span ref={typedRef} />
              </motion.div>

              {/* Underline reveal */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: typingDone ? 1 : 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-0.5 w-96 bg-yellow-300/40 origin-left"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: typingDone ? 0.4 : 0 }}
                transition={{ duration: 0.6 }}
                className="text-zinc-500 text-xs font-mono tracking-[0.4em] uppercase"
              >
                Entering System...
              </motion.p>
            </div>

            {/* Corner decorations */}
            {[
              "top-8 left-8 border-t border-l",
              "top-8 right-8 border-t border-r",
              "bottom-8 left-8 border-b border-l",
              "bottom-8 right-8 border-b border-r",
            ].map((cls, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                className={`absolute w-10 h-10 border-yellow-300 ${cls}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showGreeting ? 0 : 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1 font-mono">
            Endfield checklist data overview
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {statDefs.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: showGreeting ? 0 : 1,
                y: showGreeting ? 20 : 0,
              }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-300" />
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                {s.label}
              </div>
              <div className="text-5xl font-extrabold text-yellow-300">
                {counts[s.key]}
              </div>
              <div className="absolute top-4 right-4 text-3xl opacity-10">
                {s.icon}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-zinc-600 text-sm font-mono">
          Use the sidebar to manage your checklist data.
        </p>
      </motion.div>
    </>
  );
}
