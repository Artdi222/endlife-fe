"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  CalendarCheck,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Newspaper,
  Zap,
} from "lucide-react";
import { dailyApi } from "@/lib/api";
import { newsBannersApi } from "@/lib/api/newsBanner.api";
import { userPlannerApi } from "@/lib/api/ascension/userPlanner.api";
import type { GlobalProgressResult, NewsBanner } from "@/lib/types";
import type { PlannerSummary } from "@/lib/types/ascension/userPlanner.types";
import { getUserId, getTodayDate } from "@/lib/utils/auth.utils";
import OperatorSection from "@/components/operator/operatorSection";
import { useAuth } from "@/lib/hooks/useAuth";

// ── News Banner Carousel ────────────────────────────────────
function NewsBannerCarousel({ banners }: { banners: NewsBanner[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll, banners]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (banners.length === 0) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.1 }}
      className="relative"
    >
      {/* Section Label */}
      <div className="flex items-center gap-3 mb-4">
        <Newspaper size={14} style={{ color: "#EBBF00" }} />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#999",
          }}
        >
          Latest News
        </span>
        <div className="flex-1 h-px bg-zinc-200" />
        {/* Scroll arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {banners.map((banner, i) => (
          <Link
            key={banner.id}
            href={`/dashboard/news/${banner.id}`}
            className="shrink-0 snap-start"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="relative w-80 lg:w-[420px] aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-zinc-200 bg-white"
            >
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <Newspaper size={32} className="text-zinc-300" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-5 pt-12">
                <p className="text-white text-base lg:text-lg font-bold leading-snug line-clamp-2 group-hover:text-[#EBBF00] transition-colors">
                  {banner.title}
                </p>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "9px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {new Date(banner.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Hover highlight border */}
              <div
                className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-yellow-400/50 transition-colors duration-300"
                style={{ pointerEvents: "none" }}
              />
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ── Daily Progress Card ─────────────────────────────────────
function DailyProgressCard({
  data,
}: {
  data: GlobalProgressResult | null;
}) {
  if (!data) return null;
  const pct = Math.round(data.progress * 100);

  return (
    <Link href="/dashboard/daily" className="block group h-full">
      <motion.div
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl p-6 bg-white border border-zinc-200 shadow-sm transition-all duration-300 hover:shadow-lg flex flex-col h-full"
      >
        <div className="absolute top-0 right-2 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-105 duration-700">
          <CalendarCheck size={120} />
        </div>

        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: "linear-linear(to right, #EBBF00 30%, transparent)",
          }}
        />

        {/* Technical hatch overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-linear(-45deg, transparent, transparent 8px, rgba(0,0,0,0.012) 8px, rgba(0,0,0,0.012) 9px)",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck size={14} style={{ color: "#EBBF00" }} />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#999",
              }}
            >
              Daily Checklist
            </span>
          </div>

          <div className="mt-auto pt-6">
            <div className="flex items-end justify-between mb-3">
              <div>
                <span className="text-4xl font-black text-zinc-900 tracking-tight">
                  {pct}
                  <span className="text-xl text-zinc-400 font-normal">%</span>
                </span>
              </div>
              <span
                className="text-zinc-400"
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                }}
              >
                {data.completed_categories}/{data.total_categories} categories
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-2.5 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ backgroundColor: "#EBBF00" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            </div>

            {/* Hover arrow */}
            <div className="flex items-center justify-end mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-[#EBBF00] transition-colors flex items-center gap-1">
                View checklist
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Planner Summary Card ────────────────────────────────────
function PlannerSummaryCard({
  summary,
  charsCount,
  weapsCount,
}: {
  summary: PlannerSummary | null;
  charsCount: number;
  weapsCount: number;
}) {
  if (!summary) return null;

  const totalMats = summary.materials.length;
  const completedMats = summary.materials.filter(
    (m) => m.have >= m.total_needed,
  ).length;
  const matPct = totalMats === 0 ? 0 : Math.round((completedMats / totalMats) * 100);

  return (
    <Link href="/dashboard/planner" className="block group h-full">
      <motion.div
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl p-6 bg-white border border-zinc-200 shadow-sm transition-all duration-300 hover:shadow-lg flex flex-col h-full"
      >
        <div className="absolute top-0 right-2 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-105 duration-700">
          <TrendingUp size={120} />
        </div>

        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              "linear-linear(to right, transparent, #EBBF00 70%, transparent)",
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-linear(rgba(0,0,0,0.03) 1px, transparent 1px), linear-linear(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: "#EBBF00" }} />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#999",
              }}
            >
              Ascension Planner
            </span>
          </div>

          <div className="mt-auto pt-6">
            <div className="flex items-end justify-between mb-3">
              <div className="flex items-baseline gap-5">
                <div>
                  <span className="text-4xl font-black text-zinc-900 tracking-tight">
                    {charsCount}
                  </span>
                  <span
                    className="text-zinc-400 ml-1 font-mono text-[10px] tracking-widest uppercase"
                  >
                    Ops
                  </span>
                </div>
                <div>
                  <span className="text-4xl font-black text-zinc-900 tracking-tight">
                    {weapsCount}
                  </span>
                  <span
                    className="text-zinc-400 ml-1 font-mono text-[10px] tracking-widest uppercase"
                  >
                    Wpns
                  </span>
                </div>
              </div>
              <span
                className="text-zinc-400 font-mono text-[11px] tracking-widest"
              >
                {completedMats}/{totalMats} materials
              </span>
            </div>

            {/* Materials progress bar */}
            <div className="relative h-2.5 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ backgroundColor: "#EBBF00" }}
                initial={{ width: 0 }}
                animate={{ width: `${matPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              />
            </div>

            {/* Hover arrow */}
            <div className="flex items-center justify-end mt-4">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-[#EBBF00] transition-colors flex items-center gap-1">
                View planner
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Quick Link Card ─────────────────────────────────────────
function QuickLinkCard({
  href,
  icon: Icon,
  tag,
  title,
  description,
  index,
  image,
}: {
  href: string;
  icon: React.ElementType;
  tag: string;
  title: string;
  description: string;
  index: number;
  image?: string;
}) {
  return (
    <Link href={href} className="block group h-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.08 }}
        className="relative overflow-hidden flex flex-col h-full rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group"
      >
        {/* Image Display */}
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* linear overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Card Icon & Tag */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
            <div className="p-2.5 bg-[#EBBF00] shadow-lg rounded-lg">
              <Icon size={16} className="text-zinc-900" />
            </div>
            <span
              className="text-white text-xs font-bold tracking-[0.2em] uppercase drop-shadow-md"
              style={{ fontFamily: 'monospace' }}
            >
              {tag}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight group-hover:text-yellow-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed flex-1">
            {description}
          </p>

          <div className="flex items-center gap-1 mt-6 text-xs font-extrabold text-zinc-400 group-hover:text-[#EBBF00] transition-colors uppercase tracking-widest">
            <span>Explore</span>
            <ChevronRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Main Home Page ──────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const [newsBanners, setNewsBanners] = useState<NewsBanner[]>([]);
  const [dailyProgress, setDailyProgress] =
    useState<GlobalProgressResult | null>(null);
  const [plannerSummary, setPlannerSummary] = useState<PlannerSummary | null>(
    null,
  );
  const [charCount, setCharCount] = useState(0);
  const [weapCount, setWeapCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const userId = getUserId();
        const date = getTodayDate();

        const results = await Promise.allSettled([
          newsBannersApi.getActive(),
          userId ? dailyApi.getGlobalProgress(userId, date) : null,
          userPlannerApi.getSummary(),
          userPlannerApi.getCharacters(),
          userPlannerApi.getWeapons(),
        ]);

        if (results[0].status === "fulfilled" && results[0].value) {
          setNewsBanners(results[0].value.data);
        }
        if (results[1].status === "fulfilled" && results[1].value) {
          setDailyProgress(
            (results[1].value as { data: GlobalProgressResult }).data,
          );
        }
        if (results[2].status === "fulfilled" && results[2].value) {
          setPlannerSummary(
            (results[2].value as { data: PlannerSummary }).data,
          );
        }
        if (results[3].status === "fulfilled" && results[3].value) {
          setCharCount((results[3].value as any).data.length);
        }
        if (results[4].status === "fulfilled" && results[4].value) {
          setWeapCount((results[4].value as any).data.length);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] pt-10 ">
      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} style={{ color: "#EBBF00" }} />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#888",
                }}
              >
                {today} — System Online
              </span>
            </div>
            <h1
              className="font-black tracking-tight leading-none"
              style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#111" }}
            >
              Welcome back,{" "}
              <span style={{ color: "#EBBF00" }}>{user?.username || "Endmin"}</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-3 max-w-xl" style={{ fontFamily: "monospace" }}>
              All systems nominal. Daily operations overview and field intelligence synchronized.
            </p>
          </div>

          <div className="hidden md:flex gap-8 items-center text-right">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase mb-1">Network</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-zinc-800">CONNECTED</span>
              </div>
            </div>
            <div className="w-px h-10 bg-zinc-200" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase mb-1">Version</span>
              <span className="text-sm font-bold text-zinc-800">ENDFIELD [v0.1]</span>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.2,
          }}
          className="mb-12"
          style={{
            transformOrigin: "left",
            height: "1px",
            backgroundColor: "#E8E8E4",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "120px",
              height: "1px",
              background: "linear-gradient(to right, #EBBF00, transparent)",
            }}
          />
        </motion.div>

        {/* ── Operations Section ── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={14} style={{ color: "#EBBF00" }} />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#111",
              }}
            >
              Operational Overview
            </span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <DailyProgressCard data={dailyProgress} />
            <PlannerSummaryCard summary={plannerSummary} charsCount={charCount} weapsCount={weapCount} />
          </div>
        </div>

        {/* ── News / Intelligence Section ── */}
        <div className="mb-12">
          <NewsBannerCarousel banners={newsBanners} />
        </div>

        {/* ── Quick Links ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#999",
              }}
            >
              Quick Access
            </span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                href: "/dashboard/daily",
                icon: CalendarCheck,
                tag: "01 — Daily",
                title: "Daily Checklist",
                description:
                  "Track your daily and weekly missions. Stay on schedule with automated progress tracking.",
                image: "/Dashboard/daily.webp"
              },
              {
                href: "/dashboard/planner",
                icon: TrendingUp,
                tag: "02 — Planning",
                title: "Ascension Planner",
                description:
                  "Map out material farming for operators and weapons. See exactly what you need.",
                image: "/Dashboard/Ascension.webp"
              },
              {
                href: "/dashboard/news/latest",
                icon: Newspaper,
                tag: "03 — News",
                title: "News & Updates",
                description:
                  "Stay informed with the latest game news, patch notes, and community updates.",
                image: "/Dashboard/News.webp"
              },
            ].map((item, i) => (
              <QuickLinkCard key={item.href} {...item} index={i} />
            ))}
          </div>
        </div>

        {/* ── Operator Section ── */}
        <div className="mb-10 block">
          <div className="flex items-center gap-3 mb-4">
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#999",
              }}
            >
              Operator Directory
            </span>
            <div className="flex-1 h-px bg-zinc-200" />
            <Link href="/dashboard/characters" className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors flex items-center font-bold tracking-wider uppercase">
              View All <ChevronRight size={14} className="ml-0.5" />
            </Link>
          </div>
          <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative group">
            {/* Limit OperatorSection container height to match its standard view without fully blowing up dashboard */}
            <div className="w-full relative bg-zinc-50 rounded-2xl overflow-hidden">
               <OperatorSection />
            </div>
          </div>
        </div>

        {/* ── Bottom Meta ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4 pb-8"
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              color: "#CCC",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            EndLife — Endfield QoL Companion
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#EBEBEB" }} />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              color: "#CCC",
              letterSpacing: "0.18em",
            }}
          >
            [ v0.1 ]
          </span>
        </motion.div>
      </div>
    </div>
  );
}