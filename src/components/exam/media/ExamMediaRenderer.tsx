'use client';

import type { ExamMedia } from '@/types/exam';
import PolylineDiagram from './PolylineDiagram';
import ShapeCountDiagram from './ShapeCountDiagram';
import ColumnArithmetic from './ColumnArithmetic';
import CountersRow from './CountersRow';
import ChoiceShapesGrid from './ChoiceShapesGrid';
import TextBox from './TextBox';
import ClockFaces from './ClockFaces';
import DictationPlayer from './DictationPlayer';

interface Props {
  media: ExamMedia;
  showAnswers?: boolean;
}

export default function ExamMediaRenderer({ media, showAnswers = false }: Props) {
  switch (media.kind) {
    case 'polyline':
      return <PolylineDiagram media={media} />;
    case 'shape-count':
      return <ShapeCountDiagram media={media} />;
    case 'column-arithmetic':
      return <ColumnArithmetic media={media} showAnswers={showAnswers} />;
    case 'counters':
      return <CountersRow media={media} />;
    case 'choice-shapes':
      return <ChoiceShapesGrid media={media} />;
    case 'text-box':
      return <TextBox media={media} />;
    case 'clock':
      return <ClockFaces media={media} />;
    case 'dictation':
      return <DictationPlayer media={media} showAnswers={showAnswers} />;
    default:
      return null;
  }
}
