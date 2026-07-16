export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-surface p-4 shadow-sm ${className}`}>{children}</div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-brand-600 text-white active:bg-brand-700',
    secondary: 'bg-brand-50 text-brand-700 active:bg-brand-100',
    ghost: 'bg-transparent text-ink-secondary active:bg-black/5',
    danger: 'bg-red-50 text-red-600 active:bg-red-100',
  };
  return (
    <button
      className={`rounded-full px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <header className="safe-top px-5 pb-2">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
    </header>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{children}</p>;
}

export function EmptyState({ children }) {
  return <p className="px-1 py-6 text-center text-sm text-ink-muted">{children}</p>;
}
