export function Card({ children, className = '' }) {
  return (
    <div
      className={`glass-panel rounded-2xl p-4 transition-all duration-300 hover:border-white/20 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary:
      'bg-gradient-to-r from-brand-400 to-cyan-glow text-[#01201d] shadow-[0_0_24px_-6px_rgba(45,212,191,0.7)] hover:shadow-[0_0_32px_-4px_rgba(45,212,191,0.85)] hover:brightness-110 active:scale-[0.97]',
    secondary: 'glass-panel text-brand-300 hover:border-brand-400/40 hover:text-brand-200 active:scale-[0.97]',
    ghost: 'bg-transparent text-ink-secondary hover:bg-white/5 active:scale-[0.97]',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/15 active:scale-[0.97]',
  };
  return (
    <button
      className={`rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:hover:shadow-none disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <header className="safe-top animate-fade-up px-5 pb-2">
      <h1 className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-2xl font-bold text-transparent">
        {title}
      </h1>
      {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
    </header>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{children}</p>
  );
}

export function EmptyState({ children }) {
  return <p className="px-1 py-6 text-center text-sm text-ink-muted">{children}</p>;
}
