export type ExamSubject = 'toan' | 'tieng-viet' | 'tieng-anh';
export type QuestionType = 'multiple-choice' | 'fill-blank' | 'reading' | 'essay';
export type ExamSectionId = 'multiple-choice' | 'essay';

// ── Media types ──

export interface PolylinePoint {
  x: number;
  y: number;
  label: string;
}

export interface PolylineSegmentLabel {
  text: string;
  x: number;
  y: number;
  color?: string;
}

export interface PolylineMedia {
  kind: 'polyline';
  width?: number;
  height?: number;
  points: PolylinePoint[];
  segmentLabels?: PolylineSegmentLabel[];
}

export interface ColumnArithmeticItem {
  label?: string;
  operator: '+' | '-' | '×' | '÷';
  operands: string[];
  answer: string;
  note?: string;
}

export interface ColumnArithmeticMedia {
  kind: 'column-arithmetic';
  items: ColumnArithmeticItem[];
}

export interface ShapeCountMedia {
  kind: 'shape-count';
  width?: number;
  height?: number;
  rects?: { x: number; y: number; w: number; h: number }[];
  lines?: { x1: number; y1: number; x2: number; y2: number }[];
}

export interface CountersRowItem {
  emoji: string;
  count: number;
  caption?: string;
}

export interface CountersMedia {
  kind: 'counters';
  rows: CountersRowItem[];
}

export interface ChoiceShape {
  label: string;
  shape: 'circle' | 'square' | 'rect' | 'cylinder';
  color: string;
  borderColor?: string;
}

export interface ChoiceShapesMedia {
  kind: 'choice-shapes';
  choices: ChoiceShape[];
}

export interface TextBoxMedia {
  kind: 'text-box';
  lines: string[];
}

export interface ClockFace {
  label: string;
  hourDeg: number;
  minuteDeg: number;
}

export interface ClockMedia {
  kind: 'clock';
  clocks: ClockFace[];
}

export type ExamMedia =
  | PolylineMedia
  | ColumnArithmeticMedia
  | ShapeCountMedia
  | CountersMedia
  | ChoiceShapesMedia
  | TextBoxMedia
  | ClockMedia;

// ── Answer slot (for multi-blank questions) ──

export interface ExamAnswerSlot {
  id: string;
  label?: string;
  prompt?: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  points: number;
  placeholder?: string;
  unit?: string;
}

// ── Question ──

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  sectionId?: ExamSectionId;
  questionText: string;
  passage?: string;
  media?: ExamMedia;

  // Multiple-choice
  options?: string[];
  correctOptionIndex?: number;

  // Single fill-blank
  correctAnswer?: string;
  acceptableAnswers?: string[];

  // Multi-slot fill / essay
  answerSlots?: ExamAnswerSlot[];

  // Display + explanation
  pointsLabel?: string;
  points?: number;
  explanation?: string;
  solutionSteps?: string[];
  solutionResult?: string;
}

// ── Exam ──

export interface ExamSectionInfo {
  id: ExamSectionId;
  title: string;
  icon?: string;
  pointsLabel?: string;
}

export interface Exam {
  id: string;
  subject: ExamSubject;
  title: string;
  subtitle?: string;
  gradeLabel?: string;
  description: string;
  totalQuestions: number;
  totalPoints: number;
  timeMinutes: number;
  sections?: ExamSectionInfo[];
  questions: ExamQuestion[];
}

export interface ExamSubjectInfo {
  slug: ExamSubject;
  name: string;
  icon: string;
  color: string;
  examCount: number;
}

// ── Result ──

export interface ExamSlotAnswer {
  slotId: string;
  submitted: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ExamAnswer {
  questionId: string;
  selectedOptionIndex?: number;
  textAnswer?: string;
  slotAnswers?: ExamSlotAnswer[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ExamResult {
  examId: string;
  subject: ExamSubject;
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  starsEarned: number;
  completedAt: string;
  answers: ExamAnswer[];
}
