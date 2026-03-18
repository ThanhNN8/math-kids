'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type PlayState = 'idle' | 'playing' | 'paused';

interface TableItem {
  table: number;
  multiplier: number;
  result: number;
}

const SPEEDS = [
  { label: 'Chậm', value: 0.7, delay: 3000 },
  { label: 'Vừa', value: 0.9, delay: 2200 },
  { label: 'Nhanh', value: 1.1, delay: 1500 },
];

function generateItems(tables: number[]): TableItem[] {
  const items: TableItem[] = [];
  for (const table of tables) {
    for (let m = 1; m <= 10; m++) {
      items.push({ table, multiplier: m, result: table * m });
    }
  }
  return items;
}

export default function ListenPage() {
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5, 6, 7, 8, 9]);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [speedIdx, setSpeedIdx] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [items, setItems] = useState<TableItem[]>([]);

  const playStateRef = useRef<PlayState>('idle');
  const currentIdxRef = useRef(0);
  const speedIdxRef = useRef(1);
  const repeatRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => { playStateRef.current = playState; }, [playState]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { speedIdxRef.current = speedIdx; }, [speedIdx]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const toggleTable = (t: number) => {
    setSelectedTables((prev) =>
      prev.includes(t)
        ? prev.length > 1 ? prev.filter((x) => x !== t) : prev
        : [...prev, t].sort()
    );
  };

  const selectAll = () => setSelectedTables([2, 3, 4, 5, 6, 7, 8, 9]);

  const speakItem = useCallback((item: TableItem, rate: number): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();

      const text = `${item.table} nhân ${item.multiplier} bằng ${item.result}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = rate;
      utterance.pitch = 1.1;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.startsWith('vi'));
      if (viVoice) utterance.voice = viVoice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const playNext = useCallback(async (itemList: TableItem[], idx: number) => {
    if (idx >= itemList.length) {
      if (repeatRef.current) {
        setCurrentIdx(0);
        currentIdxRef.current = 0;
        // Small pause before repeating
        timeoutRef.current = setTimeout(() => {
          if (playStateRef.current === 'playing') {
            playNext(itemList, 0);
          }
        }, 1000);
        return;
      }
      setPlayState('idle');
      return;
    }

    if (playStateRef.current !== 'playing') return;

    setCurrentIdx(idx);
    currentIdxRef.current = idx;

    const speed = SPEEDS[speedIdxRef.current];
    await speakItem(itemList[idx], speed.value);

    // Wait a bit before next item
    if (playStateRef.current === 'playing') {
      timeoutRef.current = setTimeout(() => {
        if (playStateRef.current === 'playing') {
          playNext(itemList, idx + 1);
        }
      }, speed.delay);
    }
  }, [speakItem]);

  const handlePlay = useCallback(() => {
    const itemList = generateItems(selectedTables);
    setItems(itemList);

    if (playState === 'paused') {
      setPlayState('playing');
      playNext(itemList, currentIdxRef.current);
    } else {
      setCurrentIdx(0);
      setPlayState('playing');
      playNext(itemList, 0);
    }
  }, [selectedTables, playState, playNext]);

  const handlePause = useCallback(() => {
    setPlayState('paused');
    window.speechSynthesis?.cancel();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleStop = useCallback(() => {
    setPlayState('idle');
    setCurrentIdx(0);
    window.speechSynthesis?.cancel();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleJump = useCallback((idx: number) => {
    if (playState === 'playing') {
      window.speechSynthesis?.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setCurrentIdx(idx);
      currentIdxRef.current = idx;
      playNext(items, idx);
    } else {
      setCurrentIdx(idx);
    }
  }, [playState, items, playNext]);

  const handleJumpTable = useCallback((table: number) => {
    const idx = items.findIndex((it) => it.table === table);
    if (idx >= 0) handleJump(idx);
  }, [items, handleJump]);

  // Cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const currentItem = items[currentIdx] || null;
  const progress = items.length > 0 ? ((currentIdx + 1) / items.length) * 100 : 0;
  const currentTable = currentItem?.table;

  // Playing / Paused view
  if (playState !== 'idle' && items.length > 0) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-black text-white text-center">Nghe Bảng Cửu Chương 🔊</h1>

        {/* Current item highlight */}
        <Card className="text-center py-6">
          <motion.div
            key={currentIdx}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-2"
          >
            <div className="text-5xl font-black text-gray-800">
              {currentItem?.table} <span className="text-blue-500">×</span> {currentItem?.multiplier} <span className="text-gray-400">=</span>{' '}
              <span className="text-green-500">{currentItem?.result}</span>
            </div>
          </motion.div>
          <p className="text-gray-400 text-sm mt-2">
            Bảng {currentTable} — Câu {currentIdx + 1}/{items.length}
          </p>
        </Card>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Controls */}
        <Card>
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleJump(Math.max(0, currentIdx - 1))}
              className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl hover:bg-gray-200"
            >
              ⏮
            </motion.button>

            {playState === 'playing' ? (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handlePause}
                className="w-18 h-18 rounded-full bg-yellow-500 flex items-center justify-center text-3xl text-white shadow-lg hover:bg-yellow-600"
                style={{ width: 72, height: 72 }}
              >
                ⏸️
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handlePlay}
                className="w-18 h-18 rounded-full bg-green-500 flex items-center justify-center text-3xl text-white shadow-lg hover:bg-green-600"
                style={{ width: 72, height: 72 }}
              >
                ▶️
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleJump(Math.min(items.length - 1, currentIdx + 1))}
              className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl hover:bg-gray-200"
            >
              ⏭
            </motion.button>
          </div>

          {/* Speed + repeat + stop */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Tốc độ:</span>
              {SPEEDS.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSpeedIdx(i)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    speedIdx === i ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setRepeat(!repeat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  repeat ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                🔁 Lặp
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleStop}
                className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500 hover:bg-red-200"
              >
                ⏹ Dừng
              </motion.button>
            </div>
          </div>
        </Card>

        {/* Quick jump to table */}
        <Card>
          <h3 className="font-bold text-gray-700 text-sm mb-2">Chuyển đến bảng:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTables.map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleJumpTable(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  currentTable === t
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Bảng {t}
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Scrollable table content */}
        <Card>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {items.map((item, idx) => {
              const isActive = idx === currentIdx;
              const isPast = idx < currentIdx;
              const isNewTable = idx === 0 || items[idx - 1].table !== item.table;

              return (
                <div key={idx}>
                  {isNewTable && (
                    <div className="text-xs font-bold text-blue-500 mt-2 mb-1 uppercase">
                      Bảng nhân {item.table}
                    </div>
                  )}
                  <motion.button
                    onClick={() => handleJump(idx)}
                    animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                    transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : isPast
                          ? 'text-gray-400'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.table} × {item.multiplier} = {item.result}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-2xl font-black text-white text-center">Nghe Bảng Cửu Chương 🔊</h1>

      <Card className="text-center">
        <div className="text-6xl mb-3">🎧</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Nghe và nhẩm theo</h2>
        <p className="text-gray-500 text-sm mb-4">
          Chọn các bảng nhân muốn nghe, rồi bấm phát. Bé vừa nghe vừa nhẩm theo để thuộc nhanh hơn!
        </p>

        <h3 className="font-bold text-gray-700 mb-3">Chọn bảng:</h3>
        <div className="grid grid-cols-4 gap-3 mb-3">
          {[2, 3, 4, 5, 6, 7, 8, 9].map((t) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleTable(t)}
              className={`h-14 rounded-2xl text-xl font-black transition-all ${
                selectedTables.includes(t)
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>

        <button
          onClick={selectAll}
          className="text-sm text-blue-500 font-bold mb-4 hover:underline"
        >
          Chọn tất cả
        </button>

        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <p className="text-sm text-blue-700 font-medium">
            Sẽ đọc: <span className="font-bold">Bảng {selectedTables.join(', ')}</span>
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Tổng {selectedTables.length * 10} phép nhân
          </p>
        </div>

        {/* Speed selection */}
        <h3 className="font-bold text-gray-700 mb-3">Tốc độ đọc:</h3>
        <div className="flex gap-3 mb-4">
          {SPEEDS.map((s, i) => (
            <motion.button
              key={s.label}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSpeedIdx(i)}
              className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                speedIdx === i
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="text-sm">{s.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Repeat toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRepeat(!repeat)}
          className={`w-full py-3 rounded-2xl font-bold mb-4 transition-all ${
            repeat ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          🔁 {repeat ? 'Lặp lại: BẬT' : 'Lặp lại: TẮT'}
        </motion.button>

        <Button onClick={handlePlay} variant="primary" fullWidth size="lg">
          Phát bảng cửu chương 🔊
        </Button>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="font-bold text-gray-700 mb-2">💡 Mẹo học thuộc nhanh</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Nghe đi nghe lại nhiều lần, mỗi lần <span className="font-bold text-blue-600">nhẩm theo</span></li>
          <li>• Bắt đầu từ tốc độ <span className="font-bold text-green-600">Chậm</span>, tăng dần khi đã quen</li>
          <li>• Mỗi ngày nghe 2-3 bảng, không cần vội!</li>
          <li>• Kết hợp với <span className="font-bold text-pink-600">luyện tập</span> để nhớ lâu hơn</li>
        </ul>
      </Card>
    </div>
  );
}
