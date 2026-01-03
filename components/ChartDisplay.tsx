'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDisplayProps {
  chartData: any;
}

export default function ChartDisplay({ chartData }: ChartDisplayProps) {
  if (!chartData || !chartData.data) {
    return null;
  }

  const data = Array.isArray(chartData.data) ? chartData.data : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Financial Trends</h3>
      <div className="space-y-6">
        {chartData.type === 'bar' ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.series?.map((series: string, index: number) => (
                <Bar
                  key={series}
                  dataKey={series}
                  fill={['#0284c7', '#10b981', '#8b5cf6', '#ef4444'][index % 4]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.series?.map((series: string, index: number) => (
                <Line
                  key={series}
                  type="monotone"
                  dataKey={series}
                  stroke={['#0284c7', '#10b981', '#8b5cf6', '#ef4444'][index % 4]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

