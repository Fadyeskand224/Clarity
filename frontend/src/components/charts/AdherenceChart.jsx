import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Same blue family as SavingsChart.jsx so the two read as one system (FR-6.3).
const SEQ_BAR = '#3987e5';
const GRIDLINE = '#1f2633';
const MUTED = '#6d7791';

export default function AdherenceChart({ data }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="adherenceBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7db4f2" />
              <stop offset="100%" stopColor={SEQ_BAR} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRIDLINE} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })}
            tick={{ fontSize: 11, fill: MUTED }}
            axisLine={{ stroke: GRIDLINE }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: MUTED }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value, _name, item) => [`${value}% (${item.payload.takenCount}/${item.payload.totalRegimens})`, 'Adherence']}
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
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="pct" fill="url(#adherenceBar)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
