import { useEffect, useState } from "react";
import AvatarButton from "./avatarButton";
import { Character } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import VideoCanvas from "./videoCanvas";
import CharInfoPanel from "./charInfoPanel";
import ToggleSwitch from "./toggleSwitch";

export default function OperatorSection() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [listOffset, setListOffset] = useState(0);
  const [imgErrorId, setImgErrorId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const VISIBLE_DESKTOP = 4;
  const VISIBLE_MOBILE = 4;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/characters`)
      .then((r) => r.json())
      .then((data) => {
        const chars: Character[] = data.data || [];
        chars.sort((a, b) => a.order_index - b.order_index);
        setCharacters(chars.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const selectedChar = characters[selectedIndex] ?? null;
  const imgError = imgErrorId === (selectedChar?.id ?? -1);
  const has3D = !!(selectedChar?.video_enter || selectedChar?.video_idle);

  // Desktop vertical list window
  const rawOffset = Math.min(
    Math.max(listOffset, selectedIndex - VISIBLE_DESKTOP + 1),
    selectedIndex,
  );
  const effectiveOffset = Math.max(
    0,
    Math.min(rawOffset, Math.max(0, characters.length - VISIBLE_DESKTOP)),
  );
  const canScrollUp = effectiveOffset > 0;
  const canScrollDown = effectiveOffset + VISIBLE_DESKTOP < characters.length;
  const visibleCharsDesktop = characters.slice(
    effectiveOffset,
    effectiveOffset + VISIBLE_DESKTOP,
  );

  // Mobile horizontal list window
  const mobileOffset = Math.max(
    0,
    Math.min(
      Math.min(
        Math.max(listOffset, selectedIndex - Math.floor(VISIBLE_MOBILE / 2)),
        selectedIndex,
      ),
      Math.max(0, characters.length - VISIBLE_MOBILE),
    ),
  );
  const canScrollLeft = mobileOffset > 0;
  const canScrollRight = mobileOffset + VISIBLE_MOBILE < characters.length;
  const visibleCharsMobile = characters.slice(
    mobileOffset,
    mobileOffset + VISIBLE_MOBILE,
  );

  const selectChar = (i: number) => setSelectedIndex(i);
  const scrollUp = () => {
    if (canScrollUp) setListOffset((p) => Math.max(0, p - 1));
  };
  const scrollDown = () => {
    if (canScrollDown) setListOffset((p) => p + 1);
  };
  const scrollLeft = () => {
    if (canScrollLeft) setListOffset((p) => Math.max(0, p - 1));
  };
  const scrollRight = () => {
    if (canScrollRight) setListOffset((p) => p + 1);
  };

  const toggleView = () => {
    if (!has3D && viewMode === "2d") return;
    setViewMode((v) => (v === "2d" ? "3d" : "2d"));
  };

  // if (characters.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#F7F7F5" }}
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

      {/* Desktop */}
      <div
        className="hidden md:block"
        style={{ height: "100vh", minHeight: "700px", position: "relative" }}
      >
        {/* Left sidebar */}
        <div
          className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center"
          style={{
            width: "190px",
            zIndex: 30,
            backgroundColor: "#F7F7F5",
            borderRight: "1px solid #E8E8E5",
          }}
        >
          {/* Scroll buttons */}
          <button
            onClick={scrollUp}
            disabled={!canScrollUp}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 mb-3"
            style={{
              color: canScrollUp ? "#444" : "#CCC",
              backgroundColor: canScrollUp ? "rgba(0,0,0,0.06)" : "transparent",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2L12.5 10.5H1.5L7 2Z" fill="currentColor" />
            </svg>
          </button>
          {/* Avatar stack — fixed 4 slots */}
          <div className="flex flex-col gap-6 items-center">
            {visibleCharsDesktop.map((char, i) => (
              <AvatarButton
                key={char.id}
                char={char}
                absIndex={effectiveOffset + i}
                selectedIndex={selectedIndex}
                onSelect={selectChar}
              />
            ))}
          </div>
          <button
            onClick={scrollDown}
            disabled={!canScrollDown}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 mt-3"
            style={{
              color: canScrollDown ? "#444" : "#CCC",
              backgroundColor: canScrollDown
                ? "rgba(0,0,0,0.06)"
                : "transparent",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12L12.5 3.5H1.5L7 12Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Main showcase */}
        <div
          className="absolute top-0 bottom-0 overflow-hidden"
          style={{ left: "190px", right: 0, zIndex: 2 }}
        >
          {/* Yellow block fading to bg */}
          <div
            className="absolute"
            style={{
              top: 0,
              left: "28%",
              right: "28%",
              height: "70%",
              background:
                "linear-gradient(to bottom, #FFE600 60%, #F7F7F5 100%)",
              zIndex: 1,
            }}
          />

          {/* ENDFIELD watermark just above divider */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              bottom: "46%",
              left: 0,
              right: 0,
              overflow: "hidden",
              zIndex: 3,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "clamp(110px, 17vw, 240px)",
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

          {/* Horizontal divider */}
          <div
            className="absolute left-0 right-0"
            style={{ top: "54%", zIndex: 5 }}
          >
            <div
              className="relative w-full"
              style={{ height: "1px", backgroundColor: "#D8D8D4" }}
            >
              <div
                className="absolute left-0 top-0"
                style={{
                  width: "160px",
                  height: "1px",
                  background: "linear-gradient(to right, #EBBF00, transparent)",
                }}
              />
              <div
                className="absolute"
                style={{
                  left: "calc(28% + 40px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderLeft: "1px solid #BBB",
                      borderBottom: "1px solid #BBB",
                      transform: "rotate(-45deg)",
                      opacity: 1 - i * 0.18,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2D splash */}
          <AnimatePresence mode="wait">
            {viewMode === "2d" && selectedChar && (
              <motion.div
                key={`splash-${selectedChar.id}`}
                className="absolute"
                style={{
                  inset: 0,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: [0, 1, 0, 1, 0, 1, 0, 1, 0], x: -0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], opacity: { duration: 0.35 } }}
              >
                {selectedChar.splash_art && !imgError ? (
                  <img
                    src={selectedChar.splash_art}
                    alt={selectedChar.name}
                    onError={() => setImgErrorId(selectedChar?.id ?? null)}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                      objectPosition: "center bottom",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "80px",
                      color: "rgba(0,0,0,0.07)",
                      fontWeight: 900,
                    }}
                  >
                    ?
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D video */}
          <AnimatePresence mode="wait">
            {viewMode === "3d" && selectedChar && (
              <motion.div
                key={`video-${selectedChar.id}`}
                className="absolute"
                style={{ inset: 0, zIndex: 10, pointerEvents: "none" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {selectedChar.video_enter || selectedChar.video_idle ? (
                  <VideoCanvas
                    enterSrc={selectedChar.video_enter}
                    idleSrc={selectedChar.video_idle}
                    characterKey={selectedChar.id}
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "32px",
                        color: "rgba(0,0,0,0.07)",
                        fontWeight: 900,
                      }}
                    >
                      No video
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top info bar */}
          <div
            className="absolute flex items-start gap-6"
            style={{ top: "22px", left: "28px", zIndex: 20 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1"
                style={{ border: "1px solid #BBBBB5" }}
              >
                <motion.div
                  className="rounded-full"
                  style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: "#E03030",
                    flexShrink: 0,
                  }}
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    color: "#555",
                  }}
                >
                  REC
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: "2px" }}>
                <span
                  style={{
                    fontSize: "9px",
                    color: "#AAAAA5",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontFamily: "monospace",
                  }}
                >
                  MISSION-DEPENDENT PAYLOAD
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    color: "#AAAAA5",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontFamily: "monospace",
                  }}
                >
                  SYSTEM INTERFACES
                </span>
              </div>
            </div>
            {selectedChar && (
              <div
                className="flex items-center gap-2"
                style={{ paddingTop: "3px" }}
              >
                <span
                  style={{ fontSize: "14px", color: "#666", fontWeight: 600 }}
                >
                  {selectedChar.name}
                </span>
                <span style={{ fontSize: "13px", color: "#BBBBBB" }}>
                  {selectedIndex + 1} / {characters.length}
                </span>
              </div>
            )}
          </div>

          {/* Rarity stars */}
          <AnimatePresence mode="wait">
            {selectedChar && (
              <motion.div
                key={`stars-${selectedChar.id}`}
                className="absolute flex gap-1.5"
                style={{ top: "64px", left: "28px", zIndex: 20 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {Array.from({ length: selectedChar.rarity }).map((_, i) => (
                  <motion.img
                    key={i}
                    src="/icon/star-icon.png"
                    alt="★"
                    style={{ width: "26px", height: "26px" }}
                    initial={{ opacity: 0, scale: 0.4, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character info panel */}
          <CharInfoPanel
            selectedChar={selectedChar}
            compact={false}
            absolute={true}
          />

          {/* Toggle switch */}
          <div
            className="absolute"
            style={{
              right: "28px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
            }}
          >
            <ToggleSwitch
              viewMode={viewMode}
              has3D={has3D}
              onToggle={toggleView}
              size="md"
            />
          </div>

          {/* Decorative system text */}
          <div
            className="absolute"
            style={{
              bottom: "18px",
              right: "24px",
              zIndex: 20,
              opacity: 0.22,
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                color: "#888",
                fontFamily: "monospace",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                lineHeight: 1.9,
              }}
            >
              <div>
                [{selectedChar?.id?.toString().padStart(3, "0") ?? "---"}]
              </div>
              <div>OPERATOR DATA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col md:hidden" style={{ minHeight: "100svh" }}>
        {/* Portrait area */}
        <div
          className="relative flex-1"
          style={{ minHeight: "55svh", overflow: "hidden" }}
        >
          {/* Yellow block fading to bg */}
          <div
            className="absolute"
            style={{
              top: 0,
              left: "20%",
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to bottom, #FFE600 55%, #F7F7F5 100%)",
              zIndex: 1,
            }}
          />

          {/* ENDFIELD watermark */}
          <div
            className="absolute pointer-events-none select-none"
            style={{
              bottom: 0,
              left: 0,
              right: 0,
              overflow: "hidden",
              zIndex: 3,
              lineHeight: 1,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "clamp(72px, 22vw, 130px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
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
            {viewMode === "2d" && selectedChar && (
              <motion.div
                key={`msplash-${selectedChar.id}`}
                className="absolute"
                style={{
                  inset: 0,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {selectedChar.splash_art && !imgError ? (
                  <img
                    src={selectedChar.splash_art}
                    alt={selectedChar.name}
                    onError={() => setImgErrorId(selectedChar?.id ?? null)}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "contain",
                      objectPosition: "center bottom",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "60px",
                      color: "rgba(0,0,0,0.07)",
                      fontWeight: 900,
                    }}
                  >
                    ?
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D video */}
          <AnimatePresence mode="wait">
            {viewMode === "3d" && selectedChar && (
              <motion.div
                key={`mvideo-${selectedChar.id}`}
                className="absolute"
                style={{ inset: 0, zIndex: 10, pointerEvents: "none" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {selectedChar.video_enter || selectedChar.video_idle ? (
                  <VideoCanvas
                    enterSrc={selectedChar.video_enter}
                    idleSrc={selectedChar.video_idle}
                    characterKey={selectedChar.id}
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "22px",
                        color: "rgba(0,0,0,0.07)",
                        fontWeight: 900,
                      }}
                    >
                      No video
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top info bar */}
          <div
            className="absolute flex items-start gap-3"
            style={{ top: "14px", left: "14px", zIndex: 20 }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2 py-0.5"
                style={{ border: "1px solid #BBBBB5" }}
              >
                <motion.div
                  className="rounded-full"
                  style={{
                    width: "5px",
                    height: "5px",
                    backgroundColor: "#E03030",
                    flexShrink: 0,
                  }}
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    color: "#555",
                  }}
                >
                  REC
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: "1px" }}>
                <span
                  style={{
                    fontSize: "7px",
                    color: "#AAAAAA",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontFamily: "monospace",
                  }}
                >
                  MISSION-DEPENDENT PAYLOAD
                </span>
                <span
                  style={{
                    fontSize: "7px",
                    color: "#AAAAAA",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontFamily: "monospace",
                  }}
                >
                  SYSTEM INTERFACES
                </span>
              </div>
            </div>
          </div>

          {/* Toggle switch at bottom-left of portrait */}
          <div
            className="absolute"
            style={{ bottom: "16px", left: "14px", zIndex: 20 }}
          >
            <ToggleSwitch
              viewMode={viewMode}
              has3D={has3D}
              onToggle={toggleView}
              size="sm"
            />
          </div>
        </div>

        {/* Divider + info */}
        <div
          style={{
            backgroundColor: "#F7F7F5",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            className="relative"
            style={{ height: "1px", backgroundColor: "#D8D8D4" }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100px",
                height: "1px",
                background: "linear-gradient(to right, #EBBF00, transparent)",
              }}
            />
          </div>

          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-2">
              {selectedChar?.class && (
                <img
                  src={`/class/${selectedChar.class.toLowerCase()}.webp`}
                  alt={selectedChar.class}
                  style={{ width: "28px", height: "28px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              {selectedChar?.element && (
                <img
                  src={`/element/${selectedChar.element.toLowerCase()}.webp`}
                  alt={selectedChar.element}
                  style={{ width: "24px", height: "24px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
            {selectedChar && (
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "11px", color: "#888" }}>
                  {selectedChar.name}
                </span>
                <span style={{ fontSize: "11px", color: "#CCC" }}>{`//`}</span>
                <span style={{ fontSize: "11px", color: "#AAA" }}>
                  {String(selectedIndex + 1).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          <div className="px-4 pb-2">
            <AnimatePresence mode="wait">
              {selectedChar && (
                <motion.div
                  key={`mname-${selectedChar.id}`}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    style={{
                      color: "#AAA",
                      fontWeight: 700,
                      fontSize: "18px",
                      lineHeight: 1,
                    }}
                  >
                    [
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(28px,8vw,40px)",
                      fontWeight: 900,
                      color: "#111",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    {selectedChar.name}
                  </span>
                  <span
                    style={{
                      color: "#AAA",
                      fontWeight: 700,
                      fontSize: "18px",
                      lineHeight: 1,
                    }}
                  >
                    ]
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              style={{
                height: "2px",
                width: "100%",
                background:
                  "linear-gradient(to right, #EBBF00 0%, #5CE5A0 40%, transparent 75%)",
                marginTop: "8px",
                marginBottom: "10px",
              }}
            />

            <AnimatePresence mode="wait">
              {selectedChar && (
                <motion.div
                  key={`mstars-${selectedChar.id}`}
                  className="flex gap-1 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {Array.from({ length: selectedChar.rarity }).map((_, i) => (
                    <motion.img
                      key={i}
                      src="/icon/star-icon.png"
                      alt="★"
                      style={{ width: "20px", height: "20px" }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-2 mb-3">
              {selectedChar?.faction && (
                <div
                  className="flex items-stretch"
                  style={{ fontSize: "11px" }}
                >
                  <span
                    style={{
                      backgroundColor: "#111",
                      color: "#FFF",
                      fontWeight: 700,
                      padding: "3px 8px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Faction
                  </span>
                  <span
                    style={{
                      border: "1px solid #DDDDD8",
                      borderLeft: "none",
                      color: "#444",
                      padding: "3px 8px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {selectedChar.faction}
                  </span>
                </div>
              )}
              {selectedChar?.race && (
                <div
                  className="flex items-stretch"
                  style={{ fontSize: "11px" }}
                >
                  <span
                    style={{
                      backgroundColor: "#444",
                      color: "#FFF",
                      fontWeight: 700,
                      padding: "3px 8px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Race
                  </span>
                  <span
                    style={{
                      border: "1px solid #DDDDD8",
                      borderLeft: "none",
                      color: "#444",
                      padding: "3px 8px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {selectedChar.race}
                  </span>
                </div>
              )}
            </div>

            {selectedChar?.description && (
              <div
                style={{
                  maxHeight: "72px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    color: "#555",
                    lineHeight: 1.65,
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedChar.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal avatar list */}
        <div
          style={{
            backgroundColor: "#F7F7F5",
            borderTop: "1px solid #E8E8E5",
            padding: "16px 12px 20px",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-all duration-200"
              style={{
                color: canScrollLeft ? "#444" : "#CCC",
                backgroundColor: canScrollLeft
                  ? "rgba(0,0,0,0.06)"
                  : "transparent",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M10 2L4 7L10 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex gap-5 items-center flex-1 justify-center">
              {visibleCharsMobile.map((char, i) => (
                <AvatarButton
                  key={char.id}
                  char={char}
                  absIndex={mobileOffset + i}
                  selectedIndex={selectedIndex}
                  onSelect={selectChar}
                />
              ))}
            </div>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-all duration-200"
              style={{
                color: canScrollRight ? "#444" : "#CCC",
                backgroundColor: canScrollRight
                  ? "rgba(0,0,0,0.06)"
                  : "transparent",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M4 2L10 7L4 12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="flex justify-center mt-3">
            <span
              style={{
                fontSize: "11px",
                color: "#AAA",
                letterSpacing: "0.15em",
              }}
            >
              {String(selectedIndex + 1).padStart(2, "0")} /{" "}
              {String(characters.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
