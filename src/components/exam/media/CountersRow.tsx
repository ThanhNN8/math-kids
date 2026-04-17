'use client';

import type { CountersMedia } from '@/types/exam';

export default function CountersRow({ media }: { media: CountersMedia }) {
  return (
    <div className="flex flex-wrap justify-center gap-6 my-3">
      {media.rows.map((row, i) => (
        <div key={i} className="text-center">
          <div className="flex flex-wrap gap-1 max-w-[180px]">
            {Array.from({ length: row.count }).map((_, j) => (
              <span key={j} className="text-xl">
                {row.emoji}
              </span>
            ))}
          </div>
          {row.caption && (
            <div className="text-xs text-gray-500 mt-1">{row.caption}</div>
          )}
        </div>
      ))}
    </div>
  );
}
