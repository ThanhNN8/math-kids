'use client';

import { useEffect, useRef, useState } from 'react';
import type { DictationMedia } from '@/types/exam';

interface Props {
  media: DictationMedia;
  showAnswers: boolean;
}

export default function DictationPlayer({ media, showAnswers }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(media.passage);
    utter.lang = 'vi-VN';
    utter.rate = media.rate ?? 0.8;
    utter.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi'));
    if (viVoice) utter.voice = viVoice;

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className="my-3 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
      {media.title && (
        <div className="text-center font-bold text-amber-700 mb-2">{media.title}</div>
      )}
      <div className="text-center space-x-2 mb-3">
        {supported ? (
          <>
            <button
              type="button"
              onClick={speak}
              disabled={speaking}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-bold rounded-lg shadow"
            >
              {speaking ? '🔊 Đang đọc…' : '▶️ Phát đoạn văn'}
            </button>
            {speaking && (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow"
              >
                ⏹ Dừng
              </button>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">
            Trình duyệt không hỗ trợ đọc. Dưới đây là đoạn văn:
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600 italic text-center">
        {speaking
          ? 'Nghe và gõ lại vào ô bên dưới…'
          : supported
            ? 'Nhấn nút để nghe đoạn văn. Có thể nhấn lại nếu cần nghe lại.'
            : ''}
      </div>

      {(showAnswers || !supported) && (
        <div className="mt-3 p-3 bg-white rounded border border-amber-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
          <div className="text-xs font-bold text-amber-700 mb-1">
            {showAnswers ? 'Đoạn văn gốc:' : 'Đoạn văn (trình duyệt không đọc được):'}
          </div>
          {media.passage}
        </div>
      )}
    </div>
  );
}
