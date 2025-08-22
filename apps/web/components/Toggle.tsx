'use client';

export default function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-3 cursor-pointer select-none"
    >
      <span
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-all ${
          checked ? 'bg-teal/60' : 'bg-white/10'
        } border border-white/10`}
      >
        <span
          className={`h-5 w-5 bg-white/90 rounded-full shadow transition-transform translate-x-0.5 ${
            checked ? 'translate-x-[18px]' : ''
          }`}
        />
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={() => onChange(!checked)}
        />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
