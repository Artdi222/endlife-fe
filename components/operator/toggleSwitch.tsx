import { motion } from "framer-motion";

export default function ToggleSwitch({
  viewMode,
  has3D,
  onToggle,
  size = "md",
}: {
  viewMode: "2d" | "3d";
  has3D: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  const is3D = viewMode === "3d";
  const disabled = !has3D && !is3D;
  // Tighter track — labels are visually closer together
  const trackW = size === "sm" ? 72 : 84;
  const trackH = size === "sm" ? 28 : 32;
  const knobSize = size === "sm" ? 20 : 24;
  const knobOff = size === "sm" ? 3 : 4;
  const knobOn = trackW - knobSize - knobOff;
  // Label centers (mid-point of each half)
  const labelLeft = Math.round(trackW / 4);
  const labelRight = Math.round((trackW * 3) / 4);
  const fontSize = size === "sm" ? 9 : 11;

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label="Toggle 2D/3D"
      style={{
        position: "relative",
        width: `${trackW}px`,
        height: `${trackH}px`,
        borderRadius: `${trackH / 2}px`,
        backgroundColor: is3D ? "#1A1A1A" : "rgba(255,255,255,0.92)",
        border: is3D ? "1px solid #555" : "1px solid #C8C8C4",
        boxShadow: is3D
          ? "0 3px 14px rgba(0,0,0,0.30)"
          : "0 2px 8px rgba(0,0,0,0.12)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.35 : 1,
        backdropFilter: "blur(8px)",
        transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* 2D label active when not in 3D */}
      <span
        style={{
          position: "absolute",
          left: `${labelLeft}px`,
          transform: "translateX(-50%)",
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: is3D ? "rgba(255,255,255,0.5)" : "#FFF",
          transition: "color 0.3s",
          userSelect: "none",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        2D
      </span>
      {/* 3D label active when in 3D */}
      <span
        style={{
          position: "absolute",
          left: `${labelRight}px`,
          transform: "translateX(-50%)",
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: is3D ? "#111" : "rgba(0,0,0,0.45)",
          transition: "color 0.3s",
          userSelect: "none",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        3D
      </span>
      {/* Sliding knob */}
      <motion.div
        animate={{ x: is3D ? knobOn : knobOff }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        style={{
          position: "absolute",
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          borderRadius: "50%",
          backgroundColor: is3D ? "#EBBF00" : "#333",
          boxShadow: "0 1px 5px rgba(0,0,0,0.28)",
          zIndex: 2,
        }}
      />
    </button>
  );
}
