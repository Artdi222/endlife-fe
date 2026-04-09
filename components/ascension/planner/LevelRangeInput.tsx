"use client";
import { useState, useEffect } from "react";
import { MAX_LEVEL, levelToPhase, PHASE_LABELS } from "./constants";
import { ArrowRight } from "lucide-react";

interface LevelRangeInputProps {
  currentLevel: number;
  targetLevel: number;
  onCurrentLevelChange: (v: number) => void;
  onTargetLevelChange: (v: number) => void;
  disabled?: boolean;
}

const numCls =
  "w-14 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-sm font-mono text-zinc-800 text-center outline-none focus:border-yellow-400 transition-colors disabled:opacity-50 cursor-pointer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function LevelRangeInput({
  currentLevel,
  targetLevel,
  onCurrentLevelChange,
  onTargetLevelChange,
  disabled = false,
}: LevelRangeInputProps) {
  const [localCurrent, setLocalCurrent] = useState(currentLevel);
  const [localTarget, setLocalTarget] = useState(targetLevel);

  useEffect(() => {
    setLocalCurrent(currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    setLocalTarget(targetLevel);
  }, [targetLevel]);

  const handleCurrentBlur = () => {
    let v = Math.min(MAX_LEVEL, Math.max(1, localCurrent));
    setLocalCurrent(v);
    if (v !== currentLevel) onCurrentLevelChange(v);
  };

  const handleTargetBlur = () => {
    let v = Math.min(MAX_LEVEL, Math.max(localCurrent, localTarget));
    setLocalTarget(v);
    if (v !== targetLevel) onTargetLevelChange(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: "current" | "target") => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const currentPhase = levelToPhase(localCurrent);
  const targetPhase = levelToPhase(localTarget);
  const phaseChanged = targetPhase > currentPhase;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Level row */}
      <div className="flex items-center gap-2 border-b border-transparent pb-0.5">
        <span
          title="Character Experience Level (1-90)"
          className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 w-14 shrink-0 cursor-help hover:text-zinc-600 transition-colors"
        >
          Level
        </span>
        <input
          type="number"
          min={1}
          max={MAX_LEVEL}
          value={localCurrent}
          disabled={disabled}
          onChange={(e) => setLocalCurrent(Number(e.target.value))}
          onBlur={handleCurrentBlur}
          onKeyDown={(e) => handleKeyDown(e, "current")}
          className={numCls}
        />
        <span className="text-zinc-800 font-mono text-[10px] shrink-0">→</span>
        <input
          type="number"
          min={localCurrent}
          max={MAX_LEVEL}
          value={localTarget}
          disabled={disabled}
          onChange={(e) => setLocalTarget(Number(e.target.value))}
          onBlur={handleTargetBlur}
          onKeyDown={(e) => handleKeyDown(e, "target")}
          className={numCls}
        />
      </div>

      {/* Auto-computed phase badge */}
      <div className="flex items-center gap-2">
        <div className="w-14 shrink-0" />
        <div className="flex items-center gap-2 -mt-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-mono text-zinc-400">
              {PHASE_LABELS[currentPhase]}
            </span>
            {phaseChanged && (
              <>
                <ArrowRight size={8} className="text-yellow-400" />
                <span className="text-[10px] font-mono text-yellow-600 font-semibold">
                  {PHASE_LABELS[targetPhase]}
                </span>
              </>
            )}
          </div>
          {phaseChanged && (
            <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-wider">
              +{targetPhase - currentPhase} asc{targetPhase - currentPhase > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
