'use client';

import { motion } from 'framer-motion';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function StarRating({ stars, maxStars = 3, size = 'md', animated = true }: StarRatingProps) {
  const sizeClass = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';

  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {Array.from({ length: maxStars }, (_, i) => (
        animated ? (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.2, type: 'spring', stiffness: 300 }}
          >
            {i < stars ? '⭐' : '☆'}
          </motion.span>
        ) : (
          <span key={i}>{i < stars ? '⭐' : '☆'}</span>
        )
      ))}
    </div>
  );
}
