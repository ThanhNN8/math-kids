import type { ExamSubjectInfo } from '@/types/exam';
import { toanExams } from './toan';
import { tiengVietExams } from './tieng-viet';
import { tiengAnhExams } from './tieng-anh';

export const EXAM_SUBJECTS: ExamSubjectInfo[] = [
  {
    slug: 'toan',
    name: 'Toán',
    icon: '🔢',
    color: 'blue',
    examCount: toanExams.length,
  },
  {
    slug: 'tieng-viet',
    name: 'Tiếng Việt',
    icon: '📝',
    color: 'green',
    examCount: tiengVietExams.length,
  },
  {
    slug: 'tieng-anh',
    name: 'Tiếng Anh',
    icon: '🌍',
    color: 'purple',
    examCount: tiengAnhExams.length,
  },
];
