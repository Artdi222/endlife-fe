interface ToastProps {
  msg: string;
  type: "success" | "error";
}

export default function Toast({ msg, type }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border animate-in fade-in slide-in-from-bottom-2
      ${
        type === "success"
          ? "bg-lime-400/10 border-lime-400/30 text-lime-400"
          : "bg-red-400/10 border-red-400/30 text-red-400"
      }`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {msg}
    </div>
  );
}
