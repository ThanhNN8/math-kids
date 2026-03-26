import { Exam, ExamSubject } from '@/types/exam';
import { toanExams } from './toan';
import { tiengVietExams } from './tieng-viet';
import { tiengAnhExams } from './tieng-anh';

const allExams: Record<ExamSubject, Exam[]> = {
  'toan': toanExams,
  'tieng-viet': tiengVietExams,
  'tieng-anh': tiengAnhExams,
};

export function getExamsBySubject(subject: ExamSubject): Exam[] {
  return allExams[subject] || [];
}

export function getExamById(subject: ExamSubject, examId: string): Exam | undefined {
  return allExams[subject]?.find((exam) => exam.id === examId);
}

export function getAllExams(): Exam[] {
  return [...toanExams, ...tiengVietExams, ...tiengAnhExams];
}
