import React from 'react';

interface GaugeChartProps {
  value: number;
  max?: number;
  min?: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const sizeConfig = {
  sm: { width: 120, height: 80, fontSize: 'text-xl' },
  md: { width: 160, height: 100, fontSize: 'text-2xl' },
  lg: { width: 200, height: 120, fontSize: 'text-3xl' },
};

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max = 100,
  min = 0,
  label,
  size = 'md',
  showValue = true,
}) => {
  const config = sizeConfig[size];
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Determine color based on value
  const getColor = (pct: number): string => {
    if (pct >= 85) return '#10b981'; // green-500
    if (pct >= 70) return '#3b82f6'; // blue-500
    if (pct >= 50) return '#f59e0b'; // orange-500
    return '#ef4444'; // red-500
  };

  const color = getColor(clampedPercentage);

  // Calculate arc path
  const radius = 50;
  const strokeWidth = 10;
  const centerX = 60;
  const centerY = 60;
  const startAngle = -180;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + (totalAngle * clampedPercentage) / 100;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad),
    };
  };

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(valueAngle);
  const largeArcFlag = valueAngle - startAngle > 180 ? 1 : 0;

  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={config.width}
        height={config.height}
        viewBox="0 0 120 80"
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${polarToCartesian(startAngle).x} ${polarToCartesian(startAngle).y} A ${radius} ${radius} 0 0 1 ${polarToCartesian(endAngle).x} ${polarToCartesian(endAngle).y}`}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-500"
        />

        {/* Value text */}
        {showValue && (
          <text
            x={centerX}
            y={centerY + 5}
            textAnchor="middle"
            className="fill-white font-bold"
            fontSize="20"
          >
            {Math.round(value)}
          </text>
        )}
      </svg>

      {/* Label */}
      <div className="text-sm text-gray-400 mt-1 text-center">{label}</div>
    </div>
  );
};
