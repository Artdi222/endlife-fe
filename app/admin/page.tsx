"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Typed from "typed.js";
import { categoriesApi, groupsApi, subGroupsApi, tasksApi } from "@/lib/api";

const statDefs = [
  { label: "Categories", icon: "◈", key: "categories" },
  { label: "Groups", icon: "◫", key: "groups" },
  { label: "Sub Groups", icon: "◧", key: "subGroups" },
  { label: "Tasks", icon: "✦", key: "tasks" },
] as const;

// Hexagon SVG path for a flat-top hex
function HexPath({ size }: { size: number }) {
  const r = size / 2;
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${r + r * Math.cos(angle)},${r + r * Math.sin(angle)}`;
  }).join(" ");
  return <polygon points={points} />;
}

// Animated hexagons scattered in the background
function HexGrid() {
  const hexes = [
    { x: 5, y: 8, size: 90, delay: 0.1, opacity: 0.07 },
    { x: 88, y: 5, size: 60, delay: 0.3, opacity: 0.06 },
    { x: 15, y: 78, size: 120, delay: 0.2, opacity: 0.05 },
    { x: 80, y: 70, size: 80, delay: 0.4, opacity: 0.08 },
    { x: 50, y: 3, size: 50, delay: 0.5, opacity: 0.06 },
    { x: 92, y: 40, size: 70, delay: 0.15, opacity: 0.07 },
    { x: 3, y: 42, size: 55, delay: 0.35, opacity: 0.05 },
    { x: 60, y: 85, size: 100, delay: 0.25, opacity: 0.06 },
    { x: 35, y: 90, size: 45, delay: 0.45, opacity: 0.09 },
    { x: 72, y: 18, size: 65, delay: 0.1, opacity: 0.05 },
    { x: 25, y: 20, size: 40, delay: 0.55, opacity: 0.08 },
    { x: 45, y: 55, size: 200, delay: 0.05, opacity: 0.03 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hexes.map((h, i) => (
        <motion.svg
          key={i}
          width={h.size}
          height={h.size}
          viewBox={`0 0 ${h.size} ${h.size}`}
          className="absolute"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: h.opacity, scale: 1 }}
          transition={{ delay: h.delay, duration: 1.2, ease: "easeOut" }}
        >
          <HexPath size={h.size} />
          <polygon
            suppressHydrationWarning
            points={Array.from({ length: 6 }, (_, j) => {
              const r = h.size / 2;
              const angle = (Math.PI / 180) * (60 * j - 30);
              return `${r + r * Math.cos(angle)},${r + r * Math.sin(angle)}`;
            }).join(" ")}
            fill="none"
            stroke="#fde047"
            strokeWidth="1"
          />
        </motion.svg>
      ))}
    </div>
  );
}

// Diagonal angular slash lines — Endfield's signature UI chrome
function AngularLines() {
  const lines = [
    { x1: "0%", y1: "30%", x2: "20%", y2: "0%", delay: 0.6 },
    { x1: "100%", y1: "70%", x2: "80%", y2: "100%", delay: 0.7 },
    { x1: "0%", y1: "65%", x2: "12%", y2: "100%", delay: 0.8 },
    { x1: "100%", y1: "35%", x2: "88%", y2: "0%", delay: 0.65 },
    { x1: "20%", y1: "0%", x2: "35%", y2: "0%", delay: 0.9 },
    { x1: "65%", y1: "100%", x2: "80%", y2: "100%", delay: 0.85 },
  ];

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {lines.map((l, i) => (
        <motion.line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#fde047"
          strokeWidth="1"
          strokeOpacity="0.15"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: l.delay, duration: 0.8, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

// Data stream columns (vertical scrolling glyphs)
function DataStreams() {
  const glyphs = "01ABCDEF◈◫✦△▽◇◆▸◂⬡⬢■□●○▪▫";
  const columns = [
    { left: "8%", delay: 0, dur: 3 },
    { left: "18%", delay: 0.4, dur: 4 },
    { left: "82%", delay: 0.2, dur: 3.5 },
    { left: "92%", delay: 0.6, dur: 2.8 },
    { left: "50%", delay: 1.0, dur: 4.2 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {columns.map((col, ci) => {
        const chars = Array.from(
          { length: 18 },
          (_, i) => glyphs[Math.floor((ci * 7 + i * 3) % glyphs.length)],
        );
        return (
          <motion.div
            key={ci}
            className="absolute top-0 flex flex-col gap-1 font-mono text-xs text-yellow-300/20"
            style={{ left: col.left }}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "110%", opacity: [0, 0.6, 0.6, 0] }}
            transition={{
              delay: col.delay + 0.5,
              duration: col.dur,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          >
            {chars.map((c, i) => (
              <span key={i} style={{ opacity: 1 - i * 0.05 }}>
                {c}
              </span>
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}

// Rotating outer ring + inner diamond — center focus element
function CenterOrbit() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer rotating hex ring */}
      <motion.svg
        width="420"
        height="420"
        viewBox="0 0 420 420"
        className="absolute opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 12;
          const r = 180;
          const cx = 210 + r * Math.cos(angle);
          const cy = 210 + r * Math.sin(angle);
          return (
            <polygon
              key={i}
              suppressHydrationWarning
              points={Array.from({ length: 6 }, (_, j) => {
                const a = (Math.PI / 180) * (60 * j - 30);
                return `${cx + 12 * Math.cos(a)},${cy + 12 * Math.sin(a)}`;
              }).join(" ")}
              fill="none"
              stroke="#fde047"
              strokeWidth="1.5"
            />
          );
        })}
        <circle
          cx="210"
          cy="210"
          r="178"
          fill="none"
          stroke="#fde047"
          strokeWidth="0.5"
          strokeDasharray="4 8"
        />
      </motion.svg>

      {/* Inner counter-rotating ring */}
      <motion.svg
        width="260"
        height="260"
        viewBox="0 0 260 260"
        className="absolute opacity-15"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="130"
          cy="130"
          r="120"
          fill="none"
          stroke="#fde047"
          strokeWidth="0.8"
          strokeDasharray="2 6"
        />
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 8;
          const r = 120;
          const cx = 130 + r * Math.cos(angle);
          const cy = 130 + r * Math.sin(angle);
          return <circle key={i} cx={cx} cy={cy} r="3" fill="#fde047" />;
        })}
      </motion.svg>

      {/* Center diamond */}
      <motion.svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        className="absolute"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: "backOut" }}
      >
        <polygon
          points="30,2 58,30 30,58 2,30"
          fill="none"
          stroke="#fde047"
          strokeWidth="1.5"
        />
        <polygon
          points="30,10 50,30 30,50 10,30"
          fill="none"
          stroke="#fde047"
          strokeWidth="0.8"
        />
      </motion.svg>
    </div>
  );
}

// Horizontal scan bar that sweeps top-to-bottom
function ScanBar() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(253,224,71,0.5) 50%, transparent 100%)",
        boxShadow: "0 0 12px 2px rgba(253,224,71,0.3)",
      }}
      initial={{ top: "0%" }}
      animate={{ top: ["0%", "100%"] }}
      transition={{
        duration: 3,
        delay: 0.4,
        ease: "linear",
        repeat: 1,
        repeatDelay: 0.5,
      }}
    />
  );
}

// Corner bracket pairs — extended with tick marks
function CornerBrackets() {
  const corners = [
    { top: "2rem", left: "2rem", rotate: "0deg" },
    { top: "2rem", right: "2rem", rotate: "90deg" },
    { bottom: "2rem", right: "2rem", rotate: "180deg" },
    { bottom: "2rem", left: "2rem", rotate: "270deg" },
  ];

  return (
    <>
      {corners.map((style, i) => (
        <motion.svg
          key={i}
          width="56"
          height="56"
          viewBox="0 0 56 56"
          className="absolute"
          style={style as React.CSSProperties}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: "easeOut" }}
        >
          <path
            d="M2,22 L2,2 L22,2"
            fill="none"
            stroke="#fde047"
            strokeWidth="1.5"
          />
          <line
            x1="2"
            y1="30"
            x2="2"
            y2="26"
            stroke="#fde047"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="30"
            y1="2"
            x2="26"
            y2="2"
            stroke="#fde047"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx="2" cy="2" r="2" fill="#fde047" opacity="0.6" />
        </motion.svg>
      ))}
    </>
  );
}

// Side panel UI chrome — left and right vertical bars
function SidePanels() {
  return (
    <>
      {/* Left panel */}
      <motion.div
        className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="w-px bg-yellow-300"
            style={{ height: i % 3 === 0 ? "12px" : "6px" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: i % 3 === 0 ? 0.3 : 0.1 }}
            transition={{ delay: 1.0 + i * 0.06 }}
          />
        ))}
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 opacity-50 mt-1" />
        <div className="font-mono text-yellow-300/30 text-[8px] tracking-widest [writing-mode:vertical-lr] mt-2">
          SYS·INIT
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-center"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="w-px bg-yellow-300"
            style={{ height: i % 2 === 0 ? "10px" : "5px" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: i % 2 === 0 ? 0.25 : 0.1 }}
            transition={{ delay: 1.1 + i * 0.06 }}
          />
        ))}
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 opacity-50 mt-1" />
        <div className="font-mono text-yellow-300/30 text-[8px] tracking-widest [writing-mode:vertical-lr] mt-2">
          AUTH·OK
        </div>
      </motion.div>
    </>
  );
}

// Bottom status bar
function StatusBar() {
  const items = ["TERRA·NET", "NODE::07", "ENCRYPT·ON", "LAT:24.3°N"];
  return (
    <motion.div
      className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 font-mono text-[9px] tracking-[0.3em] text-yellow-300/25 uppercase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-yellow-300/40 inline-block" />
          {item}
        </span>
      ))}
    </motion.div>
  );
}

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

  useEffect(() => {
    if (!showGreeting) return;
    const timeout = setTimeout(() => {
      if (!typedRef.current) return;
      typedInstance.current = new Typed(typedRef.current, {
        strings: ["Endministrator"],
        typeSpeed: 120,
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
            {/* Scanlines overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
              }}
            />

            {/* Radial vignette + center glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(253,224,71,0.04) 0%, transparent 70%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0,0,0,0.7) 100%)",
              }}
            />

            {/* Background hexagons */}
            <HexGrid />

            {/* Angular slash lines */}
            <AngularLines />

            {/* Data streams */}
            <DataStreams />

            {/* Center orbit rings */}
            <CenterOrbit />

            {/* Horizontal scan bar */}
            <ScanBar />

            {/* Extended corner brackets */}
            <CornerBrackets />

            {/* Side panels */}
            <SidePanels />

            {/* Status bar */}
            <StatusBar />

            {/* Horizontal light streak */}
            <motion.div
              className="absolute h-px left-0"
              style={{
                top: "50%",
                background:
                  "linear-gradient(90deg, transparent, rgba(253,224,71,0.4) 50%, transparent)",
              }}
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 1.4, ease: "easeInOut", delay: 0.2 }}
            />

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center gap-8 text-center px-8">
              {/* ACCESS GRANTED label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-3 font-mono text-[10px] tracking-[0.6em] text-yellow-300/60 uppercase"
              >
                <span className="w-8 h-px bg-yellow-300/40" />
                ACCESS GRANTED
                <span className="w-8 h-px bg-yellow-300/40" />
              </motion.div>

              {/* Welcome Back */}
              <motion.div
                initial={{ opacity: 0, y: 40, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.15em" }}
                transition={{ duration: 1.1, ease: "easeOut", delay: 0.4 }}
                className="text-5xl md:text-7xl font-extrabold text-white tracking-[0.15em] uppercase"
                style={{ textShadow: "0 0 40px rgba(253,224,71,0.15)" }}
              >
                Welcome Back
              </motion.div>

              {/* Typed username */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="flex items-center mt-16 gap-2 text-2xl md:text-4xl font-mono font-black text-yellow-300 tracking-widest uppercase"
                style={{ textShadow: "0 0 20px rgba(253,224,71,0.5)" }}
              >
                <span ref={typedRef} />
              </motion.div>

              {/* Underline reveal */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: typingDone ? 1 : 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="h-px w-96 origin-left"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(253,224,71,0.6) 50%, transparent)",
                }}
              />

              {/* Entering System */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: typingDone ? 0.4 : 0 }}
                transition={{ duration: 0.6 }}
                className="text-zinc-500 text-xs font-mono tracking-[0.4em] uppercase"
              >
                Entering System...
              </motion.p>

              {/* Progress bar */}
              <motion.div
                className="w-64 h-px bg-zinc-800 relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: typingDone ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-yellow-300"
                  initial={{ width: "0%" }}
                  animate={{ width: typingDone ? "100%" : "0%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
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
