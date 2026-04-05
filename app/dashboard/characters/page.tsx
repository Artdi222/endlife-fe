"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import { charactersApi } from "@/lib/api/ascension/character.api";
import type { Character } from "@/lib/types";

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charactersApi
      .getAll()
      .then((res: any) => {
        const sorted = (res.data as Character[]).sort(
          (a, b) => a.order_index - b.order_index,
        );
        setCharacters(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-yellow-500" />
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
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Characters
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-lg">
            Browse and access detailed intel on all registered Endfield operators.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="Search operator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-shadow"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {filtered.map((char, i) => (
            <Link key={char.id} href={`/dashboard/characters/${char.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:border-yellow-400 transition-colors"
              >
                {/* Image Container */}
                <div className="aspect-square bg-zinc-50 relative p-0 flex items-center justify-center">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                  />
                  {char.icon ? (
                    <img
                      src={char.icon}
                      alt={char.name}
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-zinc-300 font-black text-4xl">?</div>
                  )}

                  {/* Class Icon */}
                  {char.class && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-black/40 rounded-sm backdrop-blur-sm p-1">
                      <img
                        src={`/class/${char.class.toLowerCase()}.webp`}
                        alt={char.class}
                        className="w-full h-full object-contain filter brightness-200 opacity-80"
                      />
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 h-[100px] flex flex-col">
                  <h3 className="font-bold text-sm text-zinc-900 group-hover:text-yellow-600 transition-colors line-clamp-1">
                    {char.name}
                  </h3>
                  <div className="flex items-center gap-0.5 mt-1.5 mb-1.5">
                    {Array.from({ length: char.rarity }).map((_, i) => (
                      <img
                        key={i}
                        src="/icon/star-icon.png"
                        alt="star"
                        className="w-2.5 h-2.5"
                      />
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-1.5">
                    <span className="text-[10px] uppercase text-zinc-500 font-mono truncate mr-2">
                      {char.faction || "UNKNOWN"}
                    </span>
                    <span className="text-[10px] uppercase text-zinc-400 font-mono shrink-0">
                      [{String(i + 1).padStart(3, "0")}]
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
