'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const variants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200',
  secondary: 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-200',
  success: 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
};

const sizes = {
  sm: 'px-4 py-2 text-base rounded-xl',
  md: 'px-6 py-3 text-lg rounded-2xl',
  lg: 'px-8 py-4 text-xl rounded-2xl',
  xl: 'px-10 py-5 text-2xl rounded-3xl',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-bold transition-colors min-h-[48px] select-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
