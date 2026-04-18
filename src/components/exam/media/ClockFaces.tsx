'use client';

import type { ClockMedia } from '@/types/exam';

const CLOCK_RADIUS = 36;

function Clock({ hourDeg, minuteDeg }: { hourDeg: number; minuteDeg: number }) {
  const hourRad = ((hourDeg - 90) * Math.PI) / 180;
  const minuteRad = ((minuteDeg - 90) * Math.PI) / 180;
  const hourLen = 20;
  const minuteLen = 28;
  const hourX = CLOCK_RADIUS + 40 + hourLen * Math.cos(hourRad);
  const hourY = CLOCK_RADIUS + 4 + hourLen * Math.sin(hourRad);
  const minuteX = CLOCK_RADIUS + 40 + minuteLen * Math.cos(minuteRad);
  const minuteY = CLOCK_RADIUS + 4 + minuteLen * Math.sin(minuteRad);

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={CLOCK_RADIUS} fill="white" stroke="#333" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const rad = ((i * 30 - 90) * Math.PI) / 180;
        const x1 = 40 + (CLOCK_RADIUS - 4) * Math.cos(rad);
        const y1 = 40 + (CLOCK_RADIUS - 4) * Math.sin(rad);
        const x2 = 40 + CLOCK_RADIUS * Math.cos(rad);
        const y2 = 40 + CLOCK_RADIUS * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth="1.5" />;
      })}
      <line x1="40" y1="40" x2={hourX} y2={hourY} stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="40" x2={minuteX} y2={minuteY} stroke="#f5576c" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="3" fill="#333" />
    </svg>
  );
}

export default function ClockFaces({ media }: { media: ClockMedia }) {
  return (
    <div className="flex flex-wrap justify-center gap-5 my-3">
      {media.clocks.map((clock, i) => (
        <div key={i} className="text-center">
          <Clock hourDeg={clock.hourDeg} minuteDeg={clock.minuteDeg} />
          <div className="text-sm font-bold text-gray-700 mt-1">{clock.label}</div>
        </div>
      ))}
    </div>
  );
}
