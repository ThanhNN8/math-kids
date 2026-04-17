'use client';

interface Props {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  title?: string;
}

export default function MicButton({
  active,
  disabled,
  onClick,
  size = 'sm',
  title = 'Trả lời bằng giọng nói',
}: Props) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${sizeClass} flex-shrink-0 rounded-full flex items-center justify-center shadow-sm transition-all ${
        active
          ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-300'
          : disabled
            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
      }`}
    >
      🎤
    </button>
  );
}
