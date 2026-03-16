interface AvatarProps {
  avatarId: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

import { AVATARS } from '@/types';

const sizes = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-14 h-14 text-3xl',
  lg: 'w-20 h-20 text-5xl',
  xl: 'w-28 h-28 text-7xl',
};

export default function Avatar({ avatarId, size = 'md', selected = false, onClick, className = '' }: AvatarProps) {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  return (
    <div
      onClick={onClick}
      className={`
        rounded-full flex items-center justify-center bg-gray-100
        ${sizes[size]}
        ${selected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
        ${onClick ? 'cursor-pointer hover:bg-gray-200 transition-colors active:scale-95' : ''}
        ${className}
      `}
      title={avatar.name}
    >
      {avatar.emoji}
    </div>
  );
}
