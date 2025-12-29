'use client'

type PieChartProps = {
  data: Array<{ label: string; value: number; color: string }>
  size?: number
  showLegend?: boolean
}

export default function PieChart({ data, size = 200, showLegend = true }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-gray-400 text-sm">No data</div>
      </div>
    )
  }

  let currentAngle = -90 // Start from top
  const radius = size / 2 - 10
  const centerX = size / 2
  const centerY = size / 2

  const paths = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z',
    ].join(' ')

    currentAngle += angle

    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="#1f2937"
        strokeWidth="2"
        className="hover:opacity-80 transition-opacity"
        title={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
      />
    )
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths}
      </svg>
      {showLegend && (
        <div className="flex flex-wrap gap-3 justify-center">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-400">
                {item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

