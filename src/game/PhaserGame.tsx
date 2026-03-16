'use client';

import { useEffect, useRef } from 'react';

interface PhaserGameProps {
  config: Phaser.Types.Core.GameConfig;
  onReady?: (game: Phaser.Game) => void;
  className?: string;
}

export default function PhaserGame({ config, onReady, className = '' }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: Phaser.Game | null = null;

    const initPhaser = async () => {
      const Phaser = (await import('phaser')).default;

      if (!containerRef.current) return;

      game = new Phaser.Game({
        ...config,
        parent: containerRef.current,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          ...config.scale,
        },
        input: {
          touch: true,
          ...(config.input as object),
        },
      });

      gameRef.current = game;
      onReady?.(game);
    };

    initPhaser();

    return () => {
      if (game) {
        game.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className={`w-full ${className}`} />;
}
