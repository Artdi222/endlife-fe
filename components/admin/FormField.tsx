interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400 transition-colors w-full";
export const selectCls =
  "bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-400 transition-colors w-full";
