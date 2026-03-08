"use client";
import { useState, useEffect, useRef } from "react";
import { dailyApi } from "@/lib/api";
import type { UpdateSanityDTO } from "@/lib/types";

interface SanityBarProps {
  userId: number;
  dark?: boolean;
}

const REGEN_SECONDS = 7 * 60 + 12;

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function SanityBar({ userId, dark = false }: SanityBarProps) {
  const [current, setCurrent] = useState(0);
  const [max, setMax] = useState(0);
  const [fullIn, setFullIn] = useState(0);
  const [cycleIn, setCycleIn] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentInput, setCurrentInput] = useState("0");
  const [maxInput, setMaxInput] = useState("0");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTick = (initFullIn: number, initCycleIn: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (initFullIn <= 0) return;
    let f = initFullIn;
    let c = initCycleIn;
    intervalRef.current = setInterval(() => {
      f = Math.max(0, f - 1);
      c = Math.max(0, c - 1);
      setFullIn(f);
      setCycleIn(c);
      if (c <= 0 && f > 0) {
        setCurrent((prev) => {
          const next = prev + 1;
          setCurrentInput(String(next));
          return next;
        });
        c = REGEN_SECONDS;
        setCycleIn(c);
      }
      if (f <= 0) clearInterval(intervalRef.current!);
    }, 1000);
  };

  const applyResult = (cur: number, mx: number, fullInSecs: number) => {
    setCurrent(cur);
    setMax(mx);
    setCurrentInput(String(cur));
    setMaxInput(String(mx));
    setFullIn(fullInSecs);
    const cycleRemaining =
      fullInSecs <= 0 ? 0 : fullInSecs % REGEN_SECONDS || REGEN_SECONDS;
    setCycleIn(cycleRemaining);
    startTick(fullInSecs, cycleRemaining);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dailyApi.getSanity(userId);
        applyResult(
          res.data.current_sanity,
          res.data.max_sanity,
          res.data.full_in_seconds,
        );
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);

  const submitUpdate = async (newCurrent: number, newMax: number) => {
    const clampedMax = Math.max(0, newMax);
    const clampedCurrent = Math.max(0, Math.min(newCurrent, clampedMax));
    try {
      const res = await dailyApi.updateSanity({
        user_id: userId,
        current_sanity: clampedCurrent,
        max_sanity: clampedMax,
      } as UpdateSanityDTO);
      applyResult(
        res.data.current_sanity,
        res.data.max_sanity,
        res.data.full_in_seconds,
      );
    } catch {
      setCurrentInput(String(current));
      setMaxInput(String(max));
    }
  };

  const handleEmpty = async () => {
    try {
      const res = await dailyApi.emptySanity(userId);
      applyResult(
        res.data.current_sanity,
        res.data.max_sanity,
        res.data.full_in_seconds,
      );
    } catch {}
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "current" | "max",
  ) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (type === "current") {
        const n = (parseInt(currentInput, 10) || 0) + 1;
        setCurrentInput(String(n));
        submitUpdate(n, max);
      } else {
        const n = (parseInt(maxInput, 10) || 0) + 1;
        setMaxInput(String(n));
        submitUpdate(current, n);
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (type === "current") {
        const n = Math.max(0, (parseInt(currentInput, 10) || 0) - 1);
        setCurrentInput(String(n));
        submitUpdate(n, max);
      } else {
        const n = Math.max(0, (parseInt(maxInput, 10) || 0) - 1);
        setMaxInput(String(n));
        submitUpdate(current, n);
      }
    }
  };

  const overallPct = max === 0 ? 0 : Math.min((current / max) * 100, 100);
  const cyclePct =
    fullIn <= 0
      ? 100
      : Math.min(((REGEN_SECONDS - cycleIn) / REGEN_SECONDS) * 100, 100);
  const overallColor =
    overallPct >= 80
      ? "bg-yellow-300"
      : overallPct >= 40
        ? "bg-yellow-400"
        : "bg-pink-400";
  const isFull = fullIn <= 0 && current >= max;

  if (loading) return null;

  // Dark mode 
  if (dark) {
    return (
      <div className="flex flex-col gap-3">
        {/* Current / Max display */}
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-yellow-300">{current}</span>
          <span className="text-xl text-zinc-500 font-mono mb-1">/ {max}</span>
        </div>

        {/* Overall bar */}
        <div>
          <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden mb-1">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${overallColor}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Regen cycle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Next +1
            </span>
            <span className="text-sm font-bold text-yellow-300">
              {isFull ? (
                <span className="text-cyan-400">FULL</span>
              ) : (
                formatTime(cycleIn)
              )}
            </span>
          </div>
          <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-cyan-400 transition-all duration-1000"
              style={{ width: `${cyclePct}%` }}
            />
          </div>
          <p className="text-xs font-mono text-zinc-600 mt-1">
            Full in{" "}
            <span className="text-zinc-400 font-bold">
              {isFull ? "—" : formatTime(fullIn)}
            </span>
          </p>
        </div>

        {/* Inputs */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
              Current
            </label>
            <input
              type="number"
              min={0}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onBlur={() => submitUpdate(parseInt(currentInput, 10) || 0, max)}
              onKeyDown={(e) => handleKeyDown(e, "current")}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-base font-bold text-white outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20 transition-all text-center"
            />
          </div>
          <span className="text-zinc-600 font-bold mt-5">/</span>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
              Max
            </label>
            <input
              type="number"
              min={0}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={() => submitUpdate(current, parseInt(maxInput, 10) || 0)}
              onKeyDown={(e) => handleKeyDown(e, "max")}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-base font-bold text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-center"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-transparent select-none">
              .
            </label>
            <button
              onClick={handleEmpty}
              className="text-xs font-mono font-bold text-pink-400 hover:text-pink-300 border border-pink-800 hover:border-pink-500 px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              EMPTY
            </button>
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 font-mono">
          Enter or click away to save · ↑↓ to nudge
        </p>
      </div>
    );
  }

  // Light mode (default)
  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-zinc-800">Sanity</span>
        <span className="text-xs font-bold text-zinc-700">
          {current}
          <span className="text-zinc-400 font-normal"> / {max}</span>
        </span>
      </div>
      <div className="relative h-3 bg-zinc-100 rounded-full overflow-hidden mb-1">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${overallColor}`}
          style={{ width: `${overallPct}%` }}
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Next +1
          </span>
          <span className="text-[10px] font-mono font-bold text-zinc-500">
            {isFull ? (
              <span className="text-cyan-400">FULL</span>
            ) : (
              formatTime(cycleIn)
            )}
          </span>
        </div>
        <div className="relative h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-cyan-300 transition-all duration-1000"
            style={{ width: `${cyclePct}%` }}
          />
        </div>
        <div className="mt-1 text-[10px] font-mono text-zinc-400">
          Full in{" "}
          <span className="text-zinc-500 font-bold">
            {isFull ? "—" : formatTime(fullIn)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Current
          </label>
          <input
            type="number"
            min={0}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onBlur={() => submitUpdate(parseInt(currentInput, 10) || 0, max)}
            onKeyDown={(e) => handleKeyDown(e, "current")}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20 transition-all text-center"
          />
        </div>
        <span className="text-zinc-300 font-bold mt-5">/</span>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Max
          </label>
          <input
            type="number"
            min={0}
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={() => submitUpdate(current, parseInt(maxInput, 10) || 0)}
            onKeyDown={(e) => handleKeyDown(e, "max")}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-900 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 transition-all text-center"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase tracking-widest text-transparent select-none">
            .
          </label>
          <button
            onClick={handleEmpty}
            className="text-[10px] font-mono text-pink-400 hover:text-pink-600 border border-pink-200 hover:border-pink-400 px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            EMPTY
          </button>
        </div>
      </div>
      <p className="text-[10px] text-zinc-400 font-mono mt-2">
        Enter or click away to save · ↑↓ to nudge
      </p>
    </div>
  );
}
