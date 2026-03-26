'use client'

import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: string | ReactNode
  title: string
  description: string
  className?: string
  delay?: number
}

export default function FeatureCard({
  icon,
  title,
  description,
  className = '',
  delay = 0,
}: FeatureCardProps) {
  return (
    <div
      className={`p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${className}`}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {typeof icon === 'string' ? (
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              {icon}
            </div>
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

