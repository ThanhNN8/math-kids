import { ExamSubject } from '@/types/exam';
import SubjectExamsClient from './SubjectExamsClient';

export function generateStaticParams() {
  return [
    { subject: 'toan' },
    { subject: 'tieng-viet' },
    { subject: 'tieng-anh' },
  ];
}

export default async function SubjectExamsPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  return <SubjectExamsClient subject={subject as ExamSubject} />;
}
