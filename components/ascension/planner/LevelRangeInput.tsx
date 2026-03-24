"use client";
import { STAGE_POINT_OPTIONS, MAX_LEVEL } from "./constants";

interface LevelRangeInputProps {
  currentLevel: number;
  targetLevel: number;
  currentStage: number;
  targetStage: number;
  onCurrentLevelChange: (v: number) => void;
  onTargetLevelChange: (v: number) => void;
  onCurrentStageChange: (v: number) => void;
  onTargetStageChange: (v: number) => void;
  disabled?: boolean;
}

const numCls =
  "w-14 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-sm font-mono text-zinc-800 text-center outline-none focus:border-yellow-400 transition-colors disabled:opacity-50 cursor-pointer";

const selectCls =
  "bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-sm font-mono text-zinc-800 outline-none focus:border-yellow-400 transition-colors disabled:opacity-50 cursor-pointer";

export default function LevelRangeInput({
  currentLevel,
  targetLevel,
  currentStage,
  targetStage,
  onCurrentLevelChange,
  onTargetLevelChange,
  onCurrentStageChange,
  onTargetStageChange,
  disabled = false,
}: LevelRangeInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Level row */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 w-12 shrink-0">
          Level
        </span>
        <input
          type="number"
          min={1}
          max={MAX_LEVEL}
          value={currentLevel}
          disabled={disabled}
          onChange={(e) =>
            onCurrentLevelChange(
              Math.min(MAX_LEVEL, Math.max(1, Number(e.target.value))),
            )
          }
          className={numCls}
        />
        <span className="text-zinc-800 font-mono text-xs">→</span>
        <input
          type="number"
          min={currentLevel}
          max={MAX_LEVEL}
          value={targetLevel}
          disabled={disabled}
          onChange={(e) =>
            onTargetLevelChange(
              Math.min(
                MAX_LEVEL,
                Math.max(currentLevel, Number(e.target.value)),
              ),
            )
          }
          className={numCls}
        />
      </div>

      {/* Stage row */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 w-12 shrink-0">
          Stage
        </span>

        {/* Current stage — all options */}
        <select
          value={currentStage}
          disabled={disabled}
          onChange={(e) => {
            const next = Number(e.target.value);
            onCurrentStageChange(next);
            // If target is now behind current, bump it forward
            if (targetStage < next) onTargetStageChange(next);
          }}
          className={selectCls}
        >
          {STAGE_POINT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <span className="text-zinc-800 font-mono text-xs">→</span>

        {/* Target stage — only options >= currentStage */}
        <select
          value={targetStage}
          disabled={disabled}
          onChange={(e) => onTargetStageChange(Number(e.target.value))}
          className={selectCls}
        >
          {STAGE_POINT_OPTIONS.filter((o) => o.value >= currentStage).map(
            (o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ),
          )}
        </select>
      </div>
    </div>
  );
}
