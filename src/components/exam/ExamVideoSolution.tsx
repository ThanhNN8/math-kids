'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  videoId: string;
  title?: string;
}

export default function ExamVideoSolution({ videoId, title = 'Video hướng dẫn giải đề' }: Props) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl p-4 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🎬</span>
        <h3 className="font-bold text-gray-800 flex-1 text-left">{title}</h3>
      </div>

      {playing ? (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="relative w-full rounded-xl overflow-hidden aspect-video bg-black group cursor-pointer"
        >
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
        </button>
      )}

      <div className="mt-3 text-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:underline"
        >
          Mở trên YouTube ↗
        </a>
      </div>
    </motion.div>
  );
}
