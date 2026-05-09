export function Card({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-white/10 bg-surface p-5 shadow-sm shadow-black/20 ${className}`}>
      {children}
    </section>
  );
}
