/** Apple-style toggle switch. */
export function IOSwitch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full transition-colors duration-300 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/50 ${
        checked ? "bg-[#34C759]" : "bg-[#E9E9EA] dark:bg-[#39393D]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)] transform transition-transform duration-300 ease-out ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        } translate-y-[2px]`}
      />
    </button>
  );
}
