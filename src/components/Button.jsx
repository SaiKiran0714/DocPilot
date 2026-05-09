export function Button({ children, className = '', variant = 'primary', ...buttonProps }) {
  const variantClassNames = {
    primary: 'bg-civic text-neutral-950 hover:bg-emerald-200',
    secondary: 'bg-white/10 text-zinc-100 hover:bg-white/15',
    warning: 'bg-amberline text-neutral-950 hover:bg-amber-300'
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClassNames[variant]} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
