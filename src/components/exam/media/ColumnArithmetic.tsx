'use client';

import type { ColumnArithmeticMedia } from '@/types/exam';

interface Props {
  media: ColumnArithmeticMedia;
  showAnswers: boolean;
}

export default function ColumnArithmetic({ media, showAnswers }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 my-3">
      {media.items.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border-2 border-indigo-100 py-3 px-4 text-center font-mono text-base leading-snug"
        >
          {item.label && (
            <div className="text-xs text-gray-500 text-left mb-1">{item.label}</div>
          )}
          <div>{item.operands[0]}</div>
          <div className="flex justify-center gap-1">
            <span>{item.operator}</span>
            <span>{item.operands.slice(1).join(' ')}</span>
          </div>
          <div className="border-t-2 border-gray-700 mt-1 pt-1">
            {showAnswers ? (
              <>
                {item.note && (
                  <div className="text-xs text-red-600 font-bold">{item.note}</div>
                )}
                <div className="text-green-700 font-bold">{item.answer}</div>
              </>
            ) : (
              <div className="text-gray-400">?</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
