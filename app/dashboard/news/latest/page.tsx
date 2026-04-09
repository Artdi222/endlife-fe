"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, ChevronRight, Loader2, Calendar } from "lucide-react";
import { newsBannersApi } from "@/lib/api/newsBanner.api";
import type { NewsBanner } from "@/lib/types";

export default function LatestNewsPage() {
  const [banners, setBanners] = useState<NewsBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await newsBannersApi.getActive();
        setBanners(res.data);
      } catch (err) {
        console.error("Failed to fetch latest news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 opacity-50">
        <Loader2 className="animate-spin text-yellow-500" size={32} />
        <span className="text-xs font-mono tracking-widest uppercase">Intelizing...</span>
      </div>
    );
  }

  const filteredBanners = banners.filter(b => filter === "all" || b.type === filter);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
              Latest Intel
            </h1>
            <p className="text-zinc-500 mt-2 font-medium text-sm md:text-base">
              Stay informed on the latest Endfield developments and tactical reports.
            </p>
          </div>
          
          <div className="flex bg-zinc-100/80 p-1.5 rounded-2xl md:w-auto w-full overflow-x-auto">
            {["all", "news", "event", "notices"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none capitalize px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                  ${
                    filter === f
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {filteredBanners.length === 0 ? (
        <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
           <Newspaper size={48} className="text-zinc-200 mb-4" />
           <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">No active communications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBanners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/dashboard/news/${banner.id}`} className="group block">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-200 mb-4 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-yellow-500/10 group-hover:border-yellow-500/30">
                  {banner.image_url ? (
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center">
                      <Newspaper size={40} className="text-zinc-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linrar-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-3 p-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                      {banner.type || "News"}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      <Calendar size={12} />
                      {new Date(banner.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-yellow-600 transition-colors">
                    {banner.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-yellow-600 uppercase tracking-widest pt-2">
                    Read Report <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
