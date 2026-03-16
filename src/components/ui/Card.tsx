import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export default function Card({ children, className = '', onClick, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-3xl shadow-lg border-2 border-gray-100
        ${paddings[padding]}
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
