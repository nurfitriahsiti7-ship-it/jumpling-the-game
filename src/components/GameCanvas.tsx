import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';

interface GameCanvasProps {
  engine: GameEngine | null;
  onJumpTrigger?: () => void;
  onSlideTrigger?: () => void;
  onPauseToggle?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  onPauseToggle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Swipe detection refs
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !engine) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animFrameId: number;
    let lastTime = performance.now();

    // Resize handler to match container aspect ratio and high DPI
    const resizeCanvas = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);
    resizeCanvas();

    // 60FPS Game Loop
    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update engine simulation
      engine.update(dt);

      // Render with auto-scaling to virtual coordinate space (1200 x 650)
      if (canvas.width > 0 && canvas.height > 0) {
        ctx.save();
        const scaleX = canvas.width / engine.V_WIDTH;
        const scaleY = canvas.height / engine.V_HEIGHT;
        ctx.scale(scaleX, scaleY);

        engine.render(ctx);

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        engine.handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        engine.handleSlide();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (onPauseToggle) {
          onPauseToggle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Touch gesture controls (Swipe Up for Jump / Swipe Down for Slide / Tap for Jump)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = performance.now();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX.current;
      const dy = touchEndY - touchStartY.current;
      const elapsed = performance.now() - touchStartTime.current;

      const minSwipeDistance = 30;

      if (Math.abs(dy) > minSwipeDistance && Math.abs(dy) > Math.abs(dx)) {
        if (dy < 0) {
          // Swiped Up -> Jump!
          engine.handleJump();
        } else {
          // Swiped Down -> Slide!
          engine.handleSlide();
        }
      } else if (Math.abs(dx) < 20 && Math.abs(dy) < 20 && elapsed < 350) {
        // Quick Tap -> Jump!
        engine.handleJump();
      }
    };

    const canvasEl = canvas;
    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvasEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      canvasEl.removeEventListener('touchstart', handleTouchStart);
      canvasEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [engine, onPauseToggle]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 flex items-center justify-center"
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-contain cursor-pointer"
      />
    </div>
  );
};
