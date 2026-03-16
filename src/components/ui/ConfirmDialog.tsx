'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Thoát trò chơi?',
  message = 'Con đang chơi dở, nếu thoát sẽ mất tiến trình hiện tại. Con có chắc muốn thoát không?',
  confirmText = 'Thoát',
  cancelText = 'Tiếp tục chơi',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  // Auto focus "Tiếp tục chơi" button when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to wait for animation
      const timer = setTimeout(() => {
        continueRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
          >
            <div className="text-5xl text-center mb-3">⚠️</div>
            <h2 className="text-xl font-black text-gray-800 text-center mb-2">{title}</h2>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">{message}</p>

            <div className="flex gap-3">
              <button
                ref={continueRef}
                onClick={onCancel}
                className="flex-1 min-h-[48px] px-8 py-4 text-xl rounded-2xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300 active:scale-95"
              >
                {cancelText}
              </button>
              <Button onClick={onConfirm} variant="danger" fullWidth size="lg">
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
