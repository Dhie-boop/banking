import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  hover?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  icon,
  hover = false 
}: CardProps) {
  return (
    <div 
      className={`
        card 
        ${hover ? 'hover:shadow-card-hover cursor-pointer' : ''} 
        ${className}
      `}
    >
      {(title || subtitle || icon) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
