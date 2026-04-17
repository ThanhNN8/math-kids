'use client';

import type { ExamSectionInfo } from '@/types/exam';

interface Props {
  section: ExamSectionInfo;
  children: React.ReactNode;
}

export default function ExamSection({ section, children }: Props) {
  return (
    <section className="bg-white rounded-2xl p-5 md:p-7 shadow-md">
      <header className="flex items-center gap-3 border-b-[3px] border-indigo-500 pb-2 mb-5">
        {section.icon && <span className="text-xl">{section.icon}</span>}
        <h2 className="text-lg md:text-xl font-bold text-indigo-600 flex-1">
          {section.title}
          {section.pointsLabel && (
            <span className="text-sm font-semibold text-gray-500 ml-2">
              ({section.pointsLabel})
            </span>
          )}
        </h2>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
