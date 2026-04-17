'use client';

import type { PolylineMedia } from '@/types/exam';

export default function PolylineDiagram({ media }: { media: PolylineMedia }) {
  const width = media.width ?? 320;
  const height = media.height ?? 100;
  const path = media.points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex justify-center my-3">
      <svg width={width} height={height} className="max-w-full h-auto">
        <polyline
          points={path}
          fill="none"
          stroke="#667eea"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {media.points.map((p, i) => (
          <g key={`pt-${i}`}>
            <circle cx={p.x} cy={p.y} r={5} fill="#667eea" />
            <text
              x={p.x - 5}
              y={p.y - 10}
              fill="#333"
              fontSize={14}
              fontWeight="bold"
            >
              {p.label}
            </text>
          </g>
        ))}
        {media.segmentLabels?.map((label, i) => (
          <text
            key={`seg-${i}`}
            x={label.x}
            y={label.y}
            fill={label.color ?? '#555'}
            fontSize={13}
            fontWeight="bold"
          >
            {label.text}
          </text>
        ))}
      </svg>
    </div>
  );
}
