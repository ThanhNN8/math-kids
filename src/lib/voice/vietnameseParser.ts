// Vietnamese voice command parser for exam answers.
// Handles commands like:
//   "câu 1 chọn B" / "câu một B" / "câu 1 đáp án C"
//   "câu 2 là 15" / "câu hai bằng 15" / "câu 2 kết quả 15"
//   "bài 1 a là 474" / "bài một a bằng 474"

export type VoiceCommand =
  | { kind: 'select-option'; questionNumber: number; optionIndex: number }
  | { kind: 'fill-answer'; questionNumber: number; slotLetter?: string; value: string }
  | { kind: 'submit' }
  | { kind: 'noop' };

export type AnswerOnlyResult =
  | { kind: 'option'; optionIndex: number }
  | { kind: 'value'; value: string }
  | { kind: 'noop' };

const NUMBER_WORDS: Record<string, number> = {
  'không': 0, 'mot': 1, 'một': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'bon': 4,
  'năm': 5, 'nam': 5, 'sáu': 6, 'sau': 6, 'bảy': 7, 'bay': 7,
  'tám': 8, 'tam': 8, 'chín': 9, 'chin': 9, 'mười': 10, 'muoi': 10,
};

const LETTER_WORDS: Record<string, number> = {
  'a': 0, 'á': 0, 'ây': 0, 'ay': 0,
  'b': 1, 'bê': 1, 'be': 1, 'bờ': 1, 'bo': 1,
  'c': 2, 'cê': 2, 'ce': 2, 'xê': 2, 'xe': 2,
  'd': 3, 'dê': 3, 'de': 3, 'đê': 3, 'đe': 3,
};

const SUBMIT_PHRASES = ['nộp bài', 'nop bai', 'nộp', 'kết thúc', 'ket thuc', 'hoàn thành'];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'(){}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordToNumber(word: string): number | null {
  const clean = word.toLowerCase().trim();
  if (/^\d+$/.test(clean)) return parseInt(clean, 10);
  if (NUMBER_WORDS[clean] !== undefined) return NUMBER_WORDS[clean];
  // "mười một" = 11, etc.
  const parts = clean.split(/\s+/);
  if (parts.length === 2 && parts[0] === 'mười' && NUMBER_WORDS[parts[1]] !== undefined) {
    return 10 + NUMBER_WORDS[parts[1]];
  }
  return null;
}

function wordsToNumber(words: string[]): number | null {
  const joined = words.join(' ').trim();
  if (/^\d+$/.test(joined)) return parseInt(joined, 10);

  // Try direct word lookup
  const single = wordToNumber(joined);
  if (single !== null) return single;

  // Try digit-by-digit ("ba bảy bảy" → 377)
  if (words.length > 1 && words.every((w) => wordToNumber(w) !== null && wordToNumber(w)! < 10)) {
    const digits = words.map((w) => wordToNumber(w)!).join('');
    const num = parseInt(digits, 10);
    if (!isNaN(num)) return num;
  }

  return null;
}

function extractFirstNumber(text: string): { value: number; end: number } | null {
  const tokens = text.split(' ');
  for (let start = 0; start < tokens.length; start++) {
    for (let len = 1; len <= 4 && start + len <= tokens.length; len++) {
      const slice = tokens.slice(start, start + len);
      const num = wordsToNumber(slice);
      if (num !== null) {
        return { value: num, end: start + len };
      }
    }
  }
  return null;
}

export function parseAnswerOnly(
  rawTranscript: string,
  expect: 'option' | 'value' | 'auto' = 'auto'
): AnswerOnlyResult {
  const text = normalizeText(rawTranscript);
  if (!text) return { kind: 'noop' };

  const stripped = text.replace(
    /^(chọn|chon|đáp án|dap an|đáp|dap|là|la|bằng|bang|kết quả|ket qua|=|câu trả lời|cau tra loi|trả lời|tra loi)\s+/,
    ''
  );
  const tokens = stripped.split(' ');

  if (expect === 'option' || expect === 'auto') {
    for (const token of tokens) {
      const idx = LETTER_WORDS[token];
      if (idx !== undefined) {
        return { kind: 'option', optionIndex: idx };
      }
    }
  }

  if (expect === 'value' || expect === 'auto') {
    const num = extractFirstNumber(stripped);
    if (num) {
      return { kind: 'value', value: String(num.value) };
    }
    // Fallback: use the stripped text as-is
    if (expect === 'value' && stripped) {
      return { kind: 'value', value: stripped };
    }
  }

  return { kind: 'noop' };
}

export function parseVoiceCommand(rawTranscript: string): VoiceCommand {
  const text = normalizeText(rawTranscript);
  if (!text) return { kind: 'noop' };

  if (SUBMIT_PHRASES.some((p) => text.includes(p))) {
    return { kind: 'submit' };
  }

  // Match "câu|bài N ..." or just "N chọn/là ..."
  const qNumMatch = text.match(/(?:câu|bài|cau|bai)\s+([^\s]+(?:\s+[^\s]+)?)/);
  let questionNumber: number | null = null;
  let afterQ = text;

  if (qNumMatch) {
    const candidate = qNumMatch[1];
    const n = wordsToNumber(candidate.split(' '));
    if (n !== null) {
      questionNumber = n;
      afterQ = text.slice(qNumMatch.index! + qNumMatch[0].length).trim();
    } else {
      // Try single token
      const singleToken = candidate.split(' ')[0];
      const n1 = wordToNumber(singleToken);
      if (n1 !== null) {
        questionNumber = n1;
        const idx = text.indexOf(singleToken, qNumMatch.index!) + singleToken.length;
        afterQ = text.slice(idx).trim();
      }
    }
  } else {
    // Fallback: starts with a number
    const first = extractFirstNumber(text);
    if (first) {
      questionNumber = first.value;
      afterQ = text.split(' ').slice(first.end).join(' ').trim();
    }
  }

  if (questionNumber === null) return { kind: 'noop' };

  // Check for multi-slot letter (a/b/c/d after question number)
  let slotLetter: string | undefined;
  const slotMatch = afterQ.match(/^(a|b|c|d|á|ây|bê|xê|cê|dê|đê)\b/i);
  if (slotMatch) {
    const letterWord = slotMatch[1].toLowerCase();
    if (LETTER_WORDS[letterWord] !== undefined) {
      slotLetter = ['a', 'b', 'c', 'd'][LETTER_WORDS[letterWord]];
      afterQ = afterQ.slice(slotMatch[0].length).trim();
    }
  }

  // "chọn X" / "đáp án X" / "chon X" → select option
  const selectMatch = afterQ.match(/(?:chọn|chon|đáp án|dap an|đáp|dap)\s+(.+)/);
  if (selectMatch) {
    const optWord = selectMatch[1].trim().split(' ')[0];
    const optIdx = LETTER_WORDS[optWord];
    if (optIdx !== undefined) {
      return { kind: 'select-option', questionNumber, optionIndex: optIdx };
    }
  }

  // "là X" / "bằng X" / "kết quả X" / "= X" → fill answer
  const fillMatch = afterQ.match(/(?:là|la|bằng|bang|kết quả|ket qua|=)\s*(.+)/);
  if (fillMatch) {
    const value = fillMatch[1].trim();
    // Try to parse as number
    const numResult = extractFirstNumber(value);
    if (numResult) {
      return {
        kind: 'fill-answer',
        questionNumber,
        slotLetter,
        value: String(numResult.value),
      };
    }
    return { kind: 'fill-answer', questionNumber, slotLetter, value };
  }

  // Fallback: if afterQ starts with just a letter (A/B/C/D), treat as MC select
  const bareLetter = afterQ.trim().split(' ')[0];
  if (bareLetter && LETTER_WORDS[bareLetter] !== undefined) {
    return {
      kind: 'select-option',
      questionNumber,
      optionIndex: LETTER_WORDS[bareLetter],
    };
  }

  // Fallback: if afterQ is just a number → fill answer
  const numFallback = extractFirstNumber(afterQ);
  if (numFallback) {
    return {
      kind: 'fill-answer',
      questionNumber,
      slotLetter,
      value: String(numFallback.value),
    };
  }

  return { kind: 'noop' };
}
