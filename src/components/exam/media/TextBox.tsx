'use client';

import type { TextBoxMedia } from '@/types/exam';

export default function TextBox({ media }: { media: TextBoxMedia }) {
  return (
    <div className="flex justify-center my-3">
      <div className="inline-block text-left bg-orange-50 border-l-4 border-orange-300 px-5 py-3 rounded-lg">
        {media.lines.map((line, i) => (
          <div key={i} className="text-gray-700">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
