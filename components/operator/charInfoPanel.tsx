import { Character } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";

export default function CharInfoPanel({
  selectedChar,
  compact = false,
  absolute = false,
}: {
  selectedChar: Character | null;
  compact?: boolean;
  absolute?: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {selectedChar && (
        <motion.div
          key={`info-${selectedChar.id}-${compact}`}
          className="flex flex-col"
          style={{
            maxWidth: compact ? "100%" : "380px",
            maxHeight: compact ? "auto" : "44%",
            ...(absolute
              ? {
                  position: "absolute",
                  bottom: "36px",
                  left: "28px",
                  zIndex: 20,
                }
              : {}),
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="flex items-center flex-wrap"
            style={{ gap: "8px", marginBottom: "10px" }}
          >
            {selectedChar.class && (
              <img
                src={`/class/${selectedChar.class.toLowerCase()}.webp`}
                alt={selectedChar.class}
                style={{
                  width: compact ? "28px" : "32px",
                  height: compact ? "28px" : "32px",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            {selectedChar.element && (
              <img
                src={`/element/${selectedChar.element.toLowerCase()}.webp`}
                alt={selectedChar.element}
                style={{
                  width: compact ? "28px" : "32px",
                  height: compact ? "28px" : "32px",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <span
              style={{
                color: "#AAA",
                fontWeight: 700,
                fontSize: compact ? "18px" : "22px",
                lineHeight: 1,
              }}
            >
              [
            </span>
            <span
              style={{
                fontSize: compact
                  ? "clamp(22px,6vw,32px)"
                  : "clamp(30px,4vw,46px)",
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
                fontSize: compact ? "18px" : "22px",
                lineHeight: 1,
              }}
            >
              ]
            </span>
          </div>

          <div
            style={{
              height: "2px",
              width: "100%",
              background:
                "linear-gradient(to right, #EBBF00 0%, #5CE5A0 45%, transparent 80%)",
              marginBottom: "12px",
              flexShrink: 0,
            }}
          />

          <div
            className="flex flex-wrap"
            style={{ gap: "8px", marginBottom: "12px", flexShrink: 0 }}
          >
            {selectedChar.faction && (
              <div
                className="flex items-stretch"
                style={{ fontSize: compact ? "11px" : "13px" }}
              >
                <span
                  style={{
                    backgroundColor: "#111",
                    color: "#FFF",
                    fontWeight: 700,
                    padding: "4px 9px",
                    letterSpacing: "0.06em",
                  }}
                >
                  Faction
                </span>
                <span
                  style={{
                    border: "1px solid #DDDDD8",
                    borderLeft: "none",
                    color: "#444",
                    padding: "4px 9px",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                >
                  {selectedChar.faction}
                </span>
              </div>
            )}
            {selectedChar.race && (
              <div
                className="flex items-stretch"
                style={{ fontSize: compact ? "11px" : "13px" }}
              >
                <span
                  style={{
                    backgroundColor: "#444",
                    color: "#FFF",
                    fontWeight: 700,
                    padding: "4px 9px",
                    letterSpacing: "0.06em",
                  }}
                >
                  Race
                </span>
                <span
                  style={{
                    border: "1px solid #DDDDD8",
                    borderLeft: "none",
                    color: "#444",
                    padding: "4px 9px",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                >
                  {selectedChar.race}
                </span>
              </div>
            )}
          </div>

          {selectedChar.description && (
            <div
              style={{
                overflowY: "auto",
                flex: compact ? "none" : 1,
                minHeight: 0,
                maxHeight: compact ? "72px" : undefined,
                paddingRight: "4px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {selectedChar.description.split(/\n\n+/).map((para, pi) =>
                para.trim() ? (
                  <p
                    key={pi}
                    style={{
                      fontSize: compact ? "11px" : "13px",
                      color: "#555",
                      lineHeight: 1.65,
                      margin: 0,
                      marginBottom:
                        pi ===
                        selectedChar.description!.split(/\n\n+/).length - 1
                          ? 0
                          : "8px",
                    }}
                  >
                    {para
                      .trim()
                      .split("\n")
                      .map((line, li, arr) => (
                        <span key={li}>
                          {line}
                          {li < arr.length - 1 && <br />}
                        </span>
                      ))}
                  </p>
                ) : null,
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
