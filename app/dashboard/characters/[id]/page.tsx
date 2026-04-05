"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { charactersApi } from "@/lib/api/ascension/character.api";
import type { Character } from "@/lib/types";
import ToggleSwitch from "@/components/operator/toggleSwitch";
import VideoCanvas from "@/components/operator/videoCanvas";
import CharInfoPanel from "@/components/operator/charInfoPanel";

export default function CharacterDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    charactersApi
      .getById(Number(id))
      .then((res: any) => {
        setCharacter(res.data as Character);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-black text-zinc-800">Operator Not Found</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const has3D = !!(character.video_enter || character.video_idle);
  const toggleView = () => {
    if (!has3D && viewMode === "2d") return;
    setViewMode((v) => (v === "2d" ? "3d" : "2d"));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4 md:p-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-zinc-200"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Card */}
      <div
        className="relative overflow-hidden rounded-2xl bg-[#F7F7F5] border border-zinc-200 shadow-sm flex flex-col"
      >
        {/* Diagonal hatch */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(0,0,0,0.016) 14px, rgba(0,0,0,0.016) 15px)",
            zIndex: 1,
          }}
        />

        {/* Visual Showcase (Top) */}
        <div className="relative w-full h-[300px] md:h-[700px] overflow-hidden border-b border-zinc-200 shrink-0">
          {/* Yellow block fading to bg */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, #FFE600 40%, #F7F7F5 100%)",
              zIndex: 1,
            }}
          />

          {/* ENDFIELD watermark */}
          <div
            className="absolute pointer-events-none select-none bottom-8 left-4 right-4 overflow-hidden z-[2]"
          >
            <span
              style={{
                display: "block",
                fontSize: "clamp(40px, 10vw, 180px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                whiteSpace: "nowrap",
                userSelect: "none",
                color: "rgba(0,0,0,0.07)",
                mixBlendMode: "multiply",
              }}
            >
              ENDFIELD
            </span>
          </div>

          {/* 2D splash */}
          <AnimatePresence mode="wait">
            {viewMode === "2d" && (
              <motion.div
                key={`splash-${character.id}`}
                className="absolute inset-0 flex items-end justify-center pointer-events-none z-10"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {character.splash_art && !imgError ? (
                  <img
                    src={character.splash_art}
                    alt={character.name}
                    onError={() => setImgError(true)}
                    style={{
                      height: "90%",
                      width: "100%",
                      objectFit: "contain",
                      objectPosition: "center bottom",
                    }}
                  />
                ) : (
                  <span className="text-[120px] text-black/5 font-black pb-20">?</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D video */}
          <AnimatePresence mode="wait">
            {viewMode === "3d" && (
              <motion.div
                key={`video-${character.id}`}
                className="absolute inset-0 pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <VideoCanvas
                  enterSrc={character.video_enter}
                  idleSrc={character.video_idle}
                  characterKey={character.id}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded"
                style={{ border: "1px solid rgba(0,0,0,0.1)" }}
              >
                <motion.div
                  className="w-1.5 h-1.5 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span className="text-xs font-bold tracking-widest text-zinc-600">
                  REC
                </span>
              </div>
            </div>

            {/* View Toggle */}
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-black/5">
              <ToggleSwitch
                viewMode={viewMode}
                has3D={has3D}
                onToggle={toggleView}
                size="sm"
              />
            </div>
          </div>

          {/* Rarity Stars */}
          <div className="absolute top-12 md:top-16 left-4 z-20 flex gap-1">
            {Array.from({ length: character.rarity }).map((_, i) => (
              <motion.img
                key={i}
                src="/icon/star-icon.png"
                alt="★"
                className="w-4 h-4 md:w-6 md:h-6 drop-shadow-sm"
                initial={{ opacity: 0, scale: 0.4, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.25 }}
              />
            ))}
          </div>
        </div>

        {/* Info Panel (Bottom) */}
        <div className="w-full bg-white relative z-20 flex flex-col shrink-0 p-4 md:p-12 items-center">
          <div className="w-full max-w-3xl relative">
            <CharInfoPanel selectedChar={character} compact={false} absolute={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
