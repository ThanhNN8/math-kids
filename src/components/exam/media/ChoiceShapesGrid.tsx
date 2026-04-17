'use client';

import type { ChoiceShapesMedia } from '@/types/exam';

function shapeStyle(shape: string, color: string, borderColor?: string) {
  const base: React.CSSProperties = {
    background: color,
    border: `2px solid ${borderColor ?? '#999'}`,
    margin: '0 auto',
  };
  switch (shape) {
    case 'circle':
      return { ...base, width: 60, height: 60, borderRadius: '50%' };
    case 'square':
      return { ...base, width: 60, height: 60 };
    case 'rect':
      return { ...base, width: 80, height: 50, borderRadius: 8 };
    case 'cylinder':
      return { ...base, width: 50, height: 70, borderRadius: 10 };
    default:
      return base;
  }
}

export default function ChoiceShapesGrid({
  media,
  letters = ['A', 'B', 'C', 'D'],
}: {
  media: import('@/types/exam').ChoiceShapesMedia;
  letters?: string[];
}) {
  return (
    <div className="flex flex-wrap justify-center gap-5 my-3">
      {media.choices.map((c, i) => (
        <div key={i} className="text-center">
          <div style={shapeStyle(c.shape, c.color, c.borderColor)} />
          <div className="text-sm mt-1 text-gray-700">
            {letters[i]}. {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
