import { ExamSubject } from '@/types/exam';
import { getAllExams } from '@/data/exams';
import ExamDetailClient from './ExamDetailClient';

export function generateStaticParams() {
  return getAllExams().map((exam) => ({
    subject: exam.subject,
    examId: exam.id,
  }));
}

export default async function ExamDetailPage({ params }: { params: Promise<{ subject: string; examId: string }> }) {
  const { subject, examId } = await params;
  return <ExamDetailClient subject={subject as ExamSubject} examId={examId} />;
}
