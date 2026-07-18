import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Dark-surface sequential blue (categorical slot 1, dark step) — same family
// AdherenceChart.jsx uses, per the dataviz skill's dark palette.
const SEQ_LINE = '#3987e5';
const SEQ_FILL = '#3987e5';
const GRIDLINE = '#1f2633';
const MUTED = '#6d7791';

export default function SavingsChart({ data }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SEQ_FILL} stopOpacity={0.45} />
              <stop offset="100%" stopColor={SEQ_FILL} stopOpacity={0.02} />
            </linearGradient>
            <filter id="savingsGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid stroke={GRIDLINE} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 11, fill: MUTED }}
            axisLine={{ stroke: GRIDLINE }}
            tickLine={false}
            minTickGap={32}
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fontSize: 11, fill: MUTED }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            formatter={(value) => [`$${value.toFixed(2)}`, 'Saved']}
            labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(16,21,31,0.92)',
              color: '#f2f5f9',
              fontSize: 12,
              backdropFilter: 'blur(8px)',
            }}
            itemStyle={{ color: '#f2f5f9' }}
            labelStyle={{ color: '#a3aec2' }}
          />
          <Area
            type="monotone"
            dataKey="saved"
            stroke={SEQ_LINE}
            strokeWidth={2.5}
            fill="url(#savingsFill)"
            dot={false}
            activeDot={{ r: 4, fill: SEQ_LINE, stroke: '#06080d', strokeWidth: 2 }}
            filter="url(#savingsGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
