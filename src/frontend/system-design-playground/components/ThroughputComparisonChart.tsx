import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

interface NodeThroughput {
  nodeId: string;
  throughput: number;
  capacity: number;
  isBottleneck?: boolean;
}

interface ThroughputComparisonChartProps {
  /** Dữ liệu throughput của các nodes */
  nodes: NodeThroughput[];
}

export const ThroughputComparisonChart = ({ nodes }: ThroughputComparisonChartProps) => {
  const chartData = useMemo(() => {
    if (nodes.length === 0) return [];

    // Sort theo throughput tăng dần (bottleneck ở trên)
    const sorted = [...nodes].sort((a, b) => a.throughput - b.throughput);

    return sorted.map((node) => ({
      name: node.nodeId,
      throughput: node.throughput,
      capacity: node.capacity,
      utilization: (node.throughput / node.capacity) * 100,
      isBottleneck: node.isBottleneck,
    }));
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu throughput
      </div>
    );
  }

  // Tìm bottleneck (throughput thấp nhất)
  const minThroughput = Math.min(...nodes.map((n) => n.throughput));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{
            top: 10,
            right: 30,
            left: 80,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            label={{
              value: 'Throughput (req/s)',
              position: 'insideBottom',
              offset: -10,
              style: { fill: '#9ca3af' },
            }}
            stroke="#6b7280"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={75}
            stroke="#6b7280"
            tick={{ fill: '#e5e7eb', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-gray-800 p-3 border border-gray-600 rounded shadow-lg">
                    <p className="font-semibold text-white mb-2">{data.name}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-400">
                        Throughput: <strong>{data.throughput.toFixed(1)}</strong> req/s
                      </p>
                      <p className="text-gray-300">
                        Capacity: <strong>{data.capacity.toFixed(1)}</strong> req/s
                      </p>
                      <p className="text-yellow-400">
                        Utilization: <strong>{data.utilization.toFixed(1)}%</strong>
                      </p>
                      {data.isBottleneck && (
                        <p className="text-red-400 font-semibold mt-2">
                          ⚠ Bottleneck detected!
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="throughput" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.isBottleneck || entry.throughput === minThroughput
                    ? '#ef4444' // Red for bottleneck
                    : entry.utilization > 80
                    ? '#f59e0b' // Orange for high utilization
                    : '#3b82f6' // Blue for normal
                }
              />
            ))}
            <LabelList
              dataKey="throughput"
              position="right"
              style={{ fill: '#e5e7eb', fontSize: 11, fontWeight: 'bold' }}
              formatter={(value: number) => `${value.toFixed(0)}`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
