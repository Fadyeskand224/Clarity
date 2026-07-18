// Fixed, decorative, behind everything. Purely visual — no state, no effect
// on functionality. Respects prefers-reduced-motion via index.css.
export default function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div
        className="aurora-blob animate-drift-a"
        style={{
          width: '60vmax',
          height: '60vmax',
          top: '-15%',
          left: '-20%',
          background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)',
        }}
      />
      <div
        className="aurora-blob animate-drift-b"
        style={{
          width: '55vmax',
          height: '55vmax',
          bottom: '-20%',
          right: '-15%',
          background: 'radial-gradient(circle, #7c5cff 0%, transparent 70%)',
        }}
      />
      <div
        className="aurora-blob animate-drift-c"
        style={{
          width: '45vmax',
          height: '45vmax',
          top: '30%',
          left: '30%',
          background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
