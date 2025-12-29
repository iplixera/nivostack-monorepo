'use client'

type BarChartProps = {
  data: Array<{ label: string; value: number; color?: string }>
  height?: number
  showValues?: boolean
}

export default function BarChart({ data, height = 200, showValues = true }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {showValues && (
                <div className="text-xs text-gray-400 font-medium">{item.value}</div>
              )}
              <div
                className="w-full rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: item.color || '#3b82f6',
                  minHeight: item.value > 0 ? '4px' : '0',
                }}
                title={`${item.label}: ${item.value}`}
              />
              <div className="text-xs text-gray-500 text-center leading-tight">
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

