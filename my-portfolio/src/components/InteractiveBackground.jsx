import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const gridSize = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const pixelGrid = [];

    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        pixelGrid.push({ x, y, alpha: 0 });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let p of pixelGrid) {
        if (p.alpha > 0) {
          // 3D pixel shading illusion
          const baseColor = `rgba(255, 255, 255, ${p.alpha})`;

          // Simulated light from top left
          const shadowColor = `rgba(0, 0, 0, ${p.alpha * 0.3})`;

          ctx.fillStyle = baseColor;
          ctx.shadowBlur = 8;
          ctx.shadowColor = baseColor;
          ctx.fillRect(p.x, p.y, gridSize, gridSize);

          // Simulated depth shadow (bottom-right side)
          ctx.fillStyle = shadowColor;
          ctx.shadowBlur = 0;
          ctx.fillRect(p.x + 2, p.y + 2, gridSize - 4, gridSize - 4);

          p.alpha -= 0.01;
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
          p.alpha = 0.4;
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
