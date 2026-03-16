import { Character } from "@/lib/types";
import { motion } from "framer-motion";

export default function AvatarButton({
  char,
  absIndex,
  selectedIndex,
  onSelect,
}: {
  char: Character;
  absIndex: number;
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  const isSelected = absIndex === selectedIndex;
  return (
    <motion.button
      onClick={() => onSelect(absIndex)}
      className="relative flex items-center justify-center shrink-0"
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.93 }}
      style={{ outline: "none" }}
    >
      <div
        className="absolute rounded-full transition-all duration-300"
        style={{
          inset: "-7px",
          border: isSelected ? "2px dashed #EBBF00" : "1px solid #E0E0DC",
          opacity: isSelected ? 1 : 0.5,
        }}
      />
      {isSelected && (
        <motion.div
          className="absolute rounded-full"
          style={{ inset: "-12px", border: "1px solid rgba(235,191,0,0.22)" }}
          animate={{ opacity: [0.3, 0.85, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div
        className="rounded-full overflow-hidden flex items-center justify-center"
        style={{
          width: "56px",
          height: "56px",
          backgroundColor: "#DDD",
          border: isSelected ? "2px solid #EBBF00" : "2px solid #E0E0DC",
        }}
      >
        {char.icon ? (
          <img
            src={char.icon}
            alt={char.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-zinc-500 font-black text-xl">
            {char.name[0]}
          </span>
        )}
      </div>
    </motion.button>
  );
}
