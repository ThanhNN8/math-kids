'use client';

import type { ShapeCountMedia } from '@/types/exam';

export default function ShapeCountDiagram({ media }: { media: ShapeCountMedia }) {
  const width = media.width ?? 200;
  const height = media.height ?? 140;

  return (
    <div className="flex justify-center my-3">
      <svg width={width} height={height} className="max-w-full h-auto">
        {media.rects?.map((r, i) => (
          <rect
            key={`r-${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            fill="none"
            stroke="#333"
            strokeWidth={2}
          />
        ))}
        {media.lines?.map((l, i) => (
          <line
            key={`l-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="#333"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
}
