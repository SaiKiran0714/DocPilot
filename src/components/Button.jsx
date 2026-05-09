export function Button({ children, className = '', variant = 'primary', ...buttonProps }) {
  const variantClassNames = {
    primary: 'bg-civic text-white hover:bg-teal-800',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    warning: 'bg-amberline text-white hover:bg-amber-800'
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
