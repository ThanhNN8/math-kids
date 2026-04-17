'use client';

interface Props {
  number: number | string;
  titlePrefix?: string;
  pointsLabel?: string;
  questionText: string;
  children?: React.ReactNode;
  highlighted?: boolean;
  id?: string;
}

export default function ExamQuestionCard({
  number,
  titlePrefix = 'Câu',
  pointsLabel,
  questionText,
  children,
  highlighted,
  id,
}: Props) {
  return (
    <article
      id={id}
      className={`rounded-xl p-4 md:p-5 border-l-4 transition-colors ${
        highlighted
          ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300'
          : 'bg-indigo-50/60 border-indigo-500'
      }`}
    >
      <header className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="font-bold text-gray-800 text-base">
          {titlePrefix} {number}
        </h3>
        {pointsLabel && (
          <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
            {pointsLabel}
          </span>
        )}
      </header>
      <p className="text-gray-700 leading-relaxed">{questionText}</p>
      {children && <div className="mt-3">{children}</div>}
    </article>
  );
}
