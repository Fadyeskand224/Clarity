import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Same blue family as SavingsChart.jsx so the two read as one system (FR-6.3).
const SEQ_BAR = '#2a78d6';
const GRIDLINE = '#e1e0d9';
const MUTED = '#898781';

export default function AdherenceChart({ data }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
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
            contentStyle={{ borderRadius: 12, border: '1px solid #e1e0d9', fontSize: 12 }}
          />
          <Bar dataKey="pct" fill={SEQ_BAR} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
