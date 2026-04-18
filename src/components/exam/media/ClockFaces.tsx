'use client';

import type { ClockMedia } from '@/types/exam';

const CLOCK_RADIUS = 36;

function Clock({ hourDeg, minuteDeg }: { hourDeg: number; minuteDeg: number }) {
  const cx = 40;
  const cy = 40;
  const hourLen = 16;
  const minuteLen = 26;
  const hourRad = ((hourDeg - 90) * Math.PI) / 180;
  const minuteRad = ((minuteDeg - 90) * Math.PI) / 180;
  const hourX = cx + hourLen * Math.cos(hourRad);
  const hourY = cy + hourLen * Math.sin(hourRad);
  const minuteX = cx + minuteLen * Math.cos(minuteRad);
  const minuteY = cy + minuteLen * Math.sin(minuteRad);

  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={CLOCK_RADIUS} fill="white" stroke="#333" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const rad = ((i * 30 - 90) * Math.PI) / 180;
        const x1 = cx + (CLOCK_RADIUS - 4) * Math.cos(rad);
        const y1 = cy + (CLOCK_RADIUS - 4) * Math.sin(rad);
        const x2 = cx + CLOCK_RADIUS * Math.cos(rad);
        const y2 = cy + CLOCK_RADIUS * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth="1.5" />;
      })}
      <line x1={cx} y1={cy} x2={hourX} y2={hourY} stroke="#333" strokeWidth="4" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={minuteX} y2={minuteY} stroke="#f5576c" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3" fill="#333" />
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
