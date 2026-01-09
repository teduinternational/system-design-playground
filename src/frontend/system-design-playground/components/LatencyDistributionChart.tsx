import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface LatencyDistributionChartProps {
  /** Mảng các giá trị latency (ms) */
  latencies: number[];
  /** Số lượng bins (khoảng) để chia dữ liệu, mặc định 20 */
  binCount?: number;
}

interface BinData {
  range: string;
  count: number;
  rangeStart: number;
  rangeEnd: number;
}

/**
 * Tính percentile từ mảng số đã được sắp xếp
 */
const calculatePercentile = (sortedArray: number[], percentile: number): number => {
  if (sortedArray.length === 0) return 0;
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) return sortedArray[lower];
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
};

/**
 * Chia dữ liệu latency thành các bins (histogram)
 */
const createBins = (latencies: number[], binCount: number): BinData[] => {
  if (latencies.length === 0) return [];

  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  
  // Edge case: all latencies are the same
  if (min === max) {
    return [{
      range: `${min.toFixed(0)}`,
      count: latencies.length,
      rangeStart: min,
      rangeEnd: min,
    }];
  }
  
  const binSize = (max - min) / binCount;

  // Khởi tạo bins
  const bins: BinData[] = [];
  for (let i = 0; i < binCount; i++) {
    const rangeStart = min + i * binSize;
    const rangeEnd = min + (i + 1) * binSize;
    bins.push({
      range: `${rangeStart.toFixed(0)}-${rangeEnd.toFixed(0)}`,
      count: 0,
      rangeStart,
      rangeEnd,
    });
  }

  // Đếm số lượng latency trong mỗi bin
  latencies.forEach((latency) => {
    const binIndex = Math.min(
      Math.max(0, Math.floor((latency - min) / binSize)),
      binCount - 1
    );
    if (bins[binIndex]) {
      bins[binIndex].count++;
    }
  });

  return bins;
};

export const LatencyDistributionChart = ({
  latencies,
  binCount = 20,
}: LatencyDistributionChartProps) => {
  const { bins, p50, p95 } = useMemo(() => {
    if (latencies.length === 0) {
      return { bins: [], p50: 0, p95: 0 };
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const p50 = calculatePercentile(sorted, 50);
    const p95 = calculatePercentile(sorted, 95);
    const bins = createBins(latencies, binCount);

    return { bins, p50, p95 };
  }, [latencies, binCount]);

  if (latencies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu latency
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={bins}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="range"
            label={{
              value: 'Latency (ms)',
              position: 'insideBottom',
              offset: -5,
            }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            label={{
              value: 'Số lượng',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as BinData;
                return (
                  <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">
                      {data.rangeStart.toFixed(1)} - {data.rangeEnd.toFixed(1)} ms
                    </p>
                    <p className="text-blue-600">
                      Số lượng: <strong>{data.count}</strong>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#3b82f6" name="Phân bố latency" />

          {/* Đường P50 (màu xanh) */}
          {/* Chỉ hiển thị nếu P50 và P95 khác nhau đủ xa (>5% difference) */}
          {Math.abs(p95 - p50) > 0.05 * p50 && (
            <ReferenceLine
              x={bins.find((b) => p50 >= b.rangeStart && p50 <= b.rangeEnd)?.range}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: `P50: ${p50.toFixed(2)}ms`,
                position: 'top',
                fill: '#10b981',
                fontWeight: 'bold',
                offset: 10,
              }}
            />
          )}

          {/* Đường P95 (màu đỏ) */}
          <ReferenceLine
            x={bins.find((b) => p95 >= b.rangeStart && p95 <= b.rangeEnd)?.range}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: Math.abs(p95 - p50) <= 0.05 * p50 
                ? `P50/P95: ${p95.toFixed(2)}ms` 
                : `P95: ${p95.toFixed(2)}ms`,
              position: 'top',
              fill: '#ef4444',
              fontWeight: 'bold',
              offset: Math.abs(p95 - p50) <= 0.05 * p50 ? 10 : 25,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
