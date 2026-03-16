'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ResultFeedbackProps {
  isCorrect: boolean | null;
  score?: number;
  onComplete?: () => void;
}

export default function ResultFeedback({ isCorrect, score, onComplete }: ResultFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isCorrect !== null) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  return (
    <AnimatePresence>
      {visible && isCorrect !== null && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="text-center">
            {isCorrect ? (
              <>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl mb-2"
                >
                  🎉
                </motion.div>
                <motion.p
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-4xl font-bold text-green-500 drop-shadow-lg"
                >
                  Đúng rồi!
                </motion.p>
                {score !== undefined && score > 0 && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-yellow-500 mt-1"
                  >
                    +{score} điểm
                  </motion.p>
                )}
              </>
            ) : (
              <>
                <motion.div
                  animate={{ x: [-10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                  className="text-8xl mb-2"
                >
                  😢
                </motion.div>
                <motion.p
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-4xl font-bold text-red-500 drop-shadow-lg"
                >
                  Sai rồi!
                </motion.p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
