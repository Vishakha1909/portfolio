import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const gridSize = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const pastelColors = [
      '#ffd6e8',
      '#dafbe1',
      '#e0e7ff',
      '#ffe3ec',
      '#f0f4ff',
      '#e6f7f1',
      '#fef3c7',
    ];

    const pixelGrid = [];

    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        pixelGrid.push({
          x,
          y,
          alpha: 0,
          color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
        });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw base pixel grid (more visible)
      for (let p of pixelGrid) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(p.x, p.y, gridSize - 1, gridSize - 1);
      }

      // Glow effect
      for (let p of pixelGrid) {
        if (p.alpha > 0) {
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fillRect(p.x, p.y, gridSize - 2, gridSize - 2);

          // Optional depth shading
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(0, 0, 0, ${p.alpha * 0.2})`;
          ctx.fillRect(p.x + 2, p.y + 2, gridSize - 4, gridSize - 4);

          p.alpha -= 0.015;
        }
      }

      requestAnimationFrame(draw);
    };

    const handleMouseMove = (e) => {
      const mx = e.clientX;
      const my = e.clientY;
      for (let p of pixelGrid) {
        const dist = Math.hypot(p.x - mx, p.y - my);
        if (dist < gridSize * 3) {
          p.alpha = 0.6;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
