"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { weaponsApi } from "@/lib/api/ascension/weapon.api";
import type { Weapon } from "@/lib/types";

export default function WeaponDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [weapon, setWeapon] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    weaponsApi
      .getById(Number(id))
      .then((res: any) => {
        setWeapon(res.data as Weapon);
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

  if (!weapon) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-black text-zinc-800">Armament Not Found</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4 md:p-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-zinc-200"
      >
        <ArrowLeft size={16} /> Directory
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
        <div className="relative w-full h-[250px] md:h-[450px] overflow-hidden border-b border-zinc-200 flex items-center justify-center p-6 md:p-12 shrink-0">
          {/* Yellow block fading to bg */}
          <div
            className="absolute inset-x-0 top-0 bottom-1/2"
            style={{
              background: "linear-gradient(to bottom, #FFE600 0%, transparent 100%)",
              opacity: 0.1,
              zIndex: 1,
            }}
          />

          {/* Icon */}
          <motion.div
            className="relative w-full max-w-32 md:max-w-48 aspect-square"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {weapon.icon ? (
              <img
                src={weapon.icon}
                alt={weapon.name}
                className="object-contain filter drop-shadow-2xl w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 rounded-full">
                <span className="text-[120px] text-black/10 font-black">?</span>
              </div>
            )}
          </motion.div>

          {/* Rarity Stars */}
          <div className="absolute top-12 md:top-16 left-4 md:left-8 z-20 flex gap-1">
            {Array.from({ length: weapon.rarity }).map((_, i) => (
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

          <div className="absolute top-4 md:top-8 left-4 md:left-8 gap-3 flex items-center">
             <div
              className="flex items-center gap-2 px-2 py-0.5 bg-white/50 backdrop-blur-md rounded border border-black/5"
            >
               <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                 Armament File
               </span>
            </div>
          </div>
        </div>

        {/* Info Panel (Bottom) */}
        <div className="w-full bg-white relative z-20 flex flex-col shrink-0 p-4 md:p-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                WPN-{String(weapon.id).padStart(3, "0")}
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider rounded">
                {weapon.type}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight leading-loose md:leading-none mb-6">
              {weapon.name}
            </h1>

            <div className="w-full h-px bg-gradient-to-r from-yellow-400 via-yellow-400/50 to-transparent mb-6" />

            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-zinc-100 py-3">
                 <span className="text-sm font-bold text-zinc-400">Rarity Level</span>
                 <span className="text-sm font-black text-zinc-800">{weapon.rarity} Stars</span>
               </div>
               <div className="flex items-center justify-between border-b border-zinc-100 py-3">
                 <span className="text-sm font-bold text-zinc-400">Weapon Class</span>
                 <span className="text-sm font-black text-zinc-800 uppercase">{weapon.type}</span>
               </div>
            </div>
          </motion.div>
        
        </div>
      </div>
    </div>
  );
}
