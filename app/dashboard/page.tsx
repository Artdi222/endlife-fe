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
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative w-72 lg:w-80 aspect-[16/9] rounded-xl overflow-hidden cursor-pointer group"
              style={{ border: "1px solid #E8E8E4" }}
            >
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <Newspaper size={32} className="text-zinc-300" />
                </div>
              )}

              {/* Bottom gradient + title */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-8">
                <p className="text-white text-sm font-bold leading-snug line-clamp-2">
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
    <Link href="/dashboard/daily" className="block group">
      <motion.div

        initial="hidden"
        animate="visible"
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-xl p-5"
        style={{
          backgroundColor: "#FAFAF8",
          border: "1px solid #E8E8E4",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(to right, #EBBF00 30%, transparent)",
          }}
        />

        {/* Technical hatch overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(0,0,0,0.012) 8px, rgba(0,0,0,0.012) 9px)",
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

          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-3xl font-black text-zinc-900 tracking-tight">
                {pct}
                <span className="text-lg text-zinc-400 font-normal">%</span>
              </span>
            </div>
            <span
              className="text-zinc-400"
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.1em",
              }}
            >
              {data.completed_categories}/{data.total_categories} categories
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-zinc-200/60 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ backgroundColor: "#EBBF00" }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            />
          </div>

          {/* Hover arrow */}
          <div className="flex items-center justify-end mt-3">
            <span className="text-xs text-zinc-400 group-hover:text-zinc-700 transition-colors flex items-center gap-1">
              View checklist
              <ChevronRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
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
    <Link href="/dashboard/planner" className="block group">
      <motion.div

        initial="hidden"
        animate="visible"
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-xl p-5"
        style={{
          backgroundColor: "#FAFAF8",
          border: "1px solid #E8E8E4",
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, #EBBF00 70%, transparent)",
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
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

          <div className="flex items-end justify-between mb-3">
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-3xl font-black text-zinc-900 tracking-tight">
                  {charsCount}
                </span>
                <span
                  className="text-zinc-400 ml-1"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Ops
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-zinc-900 tracking-tight">
                  {weapsCount}
                </span>
                <span
                  className="text-zinc-400 ml-1"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Wpns
                </span>
              </div>
            </div>
            <span
              className="text-zinc-400"
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "0.1em",
              }}
            >
              {completedMats}/{totalMats} materials
            </span>
          </div>

          {/* Materials progress bar */}
          <div className="relative h-2 bg-zinc-200/60 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ backgroundColor: "#EBBF00" }}
              initial={{ width: 0 }}
              animate={{ width: `${matPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            />
          </div>

          {/* Hover arrow */}
          <div className="flex items-center justify-end mt-3">
            <span className="text-xs text-zinc-400 group-hover:text-zinc-700 transition-colors flex items-center gap-1">
              View planner
              <ChevronRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
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
}: {
  href: string;
  icon: React.ElementType;
  tag: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <Link href={href} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.08 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden p-6 flex flex-col h-full"
        style={{
          backgroundColor: "#FAFAF8",
          border: "1px solid #E8E8E4",
        }}
      >
        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{
            background: "linear-gradient(to bottom, #EBBF00, transparent)",
          }}
        />

        <div className="flex items-center gap-2 mb-4">
          <Icon size={14} style={{ color: "#EBBF00" }} />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#BBB",
            }}
          >
            {tag}
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-900 mb-1 tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 leading-relaxed flex-1">
          {description}
        </p>

        <div className="flex items-center gap-1 mt-4 text-xs text-zinc-400 group-hover:text-yellow-600 transition-colors">
          <span>Open</span>
          <ChevronRight
            size={12}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </div>
      </motion.div>
    </Link>
  );
}

// ── Main Home Page ──────────────────────────────────────────
export default function HomePage() {
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
    <div className="relative w-full min-h-[calc(100vh-80px)] p-10">
      {/* Technical grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={10} style={{ color: "#EBBF00" }} />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#AAA",
              }}
            >
              {today}
            </span>
          </div>
          <h1
            className="font-black tracking-tight leading-none"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#111" }}
          >
            Welcome back,{" "}
            <span style={{ color: "#EBBF00" }}>Endmin</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2 max-w-md" style={{ fontFamily: "monospace" }}>
            Your daily operations overview and latest field intelligence.
          </p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
            className="mt-6"
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
                width: "80px",
                height: "1px",
                background: "linear-gradient(to right, #EBBF00, transparent)",
              }}
            />
          </motion.div>
        </motion.div>

        {/* ── News Banners ── */}
        <div className="mb-10">
          <NewsBannerCarousel banners={newsBanners} />
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <DailyProgressCard data={dailyProgress} />
          <PlannerSummaryCard summary={plannerSummary} charsCount={charCount} weapsCount={weapCount} />
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

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ backgroundColor: "#E8E8E4" }}
          >
            {[
              {
                href: "/dashboard/daily",
                icon: CalendarCheck,
                tag: "01 — Daily",
                title: "Daily Checklist",
                description:
                  "Track your daily and weekly missions. Stay on schedule with automated progress tracking.",
              },
              {
                href: "/dashboard/planner",
                icon: TrendingUp,
                tag: "02 — Planning",
                title: "Ascension Planner",
                description:
                  "Map out material farming for operators and weapons. See exactly what you need.",
              },
              {
                href: "/dashboard/news/latest",
                icon: Newspaper,
                tag: "03 — Intel",
                title: "News & Updates",
                description:
                  "Stay informed with the latest game news, patch notes, and community updates.",
              },
            ].map((item, i) => (
              <div
                key={item.href}
                style={{ backgroundColor: "#FAFAF8", display: "flex" }}
              >
                <QuickLinkCard {...item} index={i} />
              </div>
            ))}
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