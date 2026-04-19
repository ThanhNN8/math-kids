'use client';

import { motion } from 'framer-motion';

interface Props {
  videoId: string;
  title?: string;
}

export default function ExamVideoSolution({ videoId, title = 'Video hướng dẫn giải đề' }: Props) {
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <motion.a
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      whileTap={{ scale: 0.98 }}
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎬</span>
        <h3 className="font-bold text-gray-800 flex-1 text-left">{title}</h3>
        <span className="text-xs text-indigo-500">YouTube ↗</span>
      </div>

      <div className="relative rounded-xl overflow-hidden aspect-video bg-black group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </motion.a>
  );
}
