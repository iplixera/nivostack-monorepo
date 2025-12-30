'use client'

type LineChartProps = {
  data: Array<{ label: string; value: number }>
  height?: number
  color?: string
}

export default function LineChart({ data, height = 200, color = '#3b82f6' }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value), 0)
  const range = maxValue - minValue || 1

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 100
    return { x, y, value: item.value, label: item.label }
  })

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`)
    .join(' ')

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#374151"
            strokeWidth="0.5"
            strokeDasharray="1,1"
          />
        ))}
        {/* Area fill */}
        <path
          d={`${pathData} L 100% 100% L 0% 100% Z`}
          fill={color}
          fillOpacity="0.1"
        />
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="1.5"
            fill={color}
            className="hover:r-2 transition-all"
          >
            <title>{`${point.label}: ${point.value}`}</title>
          </circle>
        ))}
      </svg>
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
        {data.map((item, index) => (
          <span key={index} className="truncate max-w-[60px]">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

