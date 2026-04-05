"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";

import { newsBannersApi } from "@/lib/api/newsBanner.api";
import type { NewsBanner } from "@/lib/types";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [banner, setBanner] = useState<NewsBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await newsBannersApi.getById(Number(params.id));
        setBanner(res.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-zinc-400 text-sm font-mono">News not found</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-yellow-400 hover:underline"
        >
          ← Back to Home
        </button>
      </div>
    );
  }

  const date = new Date(banner.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-10">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition-colors mb-6 group"
      >
        <ArrowLeft
          size={14}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Back to Home
      </motion.button>

      {/* Banner image */}
      {banner.image_url && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-zinc-200 mb-8"
        >
          <img
            src={banner.image_url}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>
      )}

      {/* Title + meta */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={12} className="text-zinc-400" />
          <span
            className="text-zinc-400"
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {date}
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
          {banner.title}
        </h1>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="mb-8"
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
            width: "60px",
            height: "1px",
            background: "linear-gradient(to right, #EBBF00, transparent)",
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="prose prose-zinc max-w-none"
      >
        {banner.content ? (
          <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap text-sm lg:text-base">
            {banner.content}
          </div>
        ) : (
          <p className="text-zinc-400 text-sm italic">
            No additional content available for this news item.
          </p>
        )}
      </motion.div>
    </div>
  );
}
