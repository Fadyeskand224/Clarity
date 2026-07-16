import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const SEQ_LINE = '#2a78d6';
const SEQ_FILL = '#9ec5f4';
const GRIDLINE = '#e1e0d9';
const MUTED = '#898781';

export default function SavingsChart({ data }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SEQ_FILL} stopOpacity={0.55} />
              <stop offset="100%" stopColor={SEQ_FILL} stopOpacity={0.05} />
            </linearGradient>
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
            contentStyle={{ borderRadius: 12, border: '1px solid #e1e0d9', fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="saved"
            stroke={SEQ_LINE}
            strokeWidth={2}
            fill="url(#savingsFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
