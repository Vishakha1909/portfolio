import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  // visuals / feel
  const GRID_SIZE = 12;          // pixel size
  const DENSITY = 0.28;          // trail density (how many can light up when you hover/touch)
  const RADIUS_MULT = 2.0;       // trail radius multiplier
  const MAX_ALPHA = 0.7;         // peak glow
  const FADE_SPEED = 0.004;      // trail fade per frame
  const SHADOW_BLUR = 14;        // glow softness

  // NEW: only this fraction of pixels float when idle
  const IDLE_FRACTION = 0.15;    // 15% of pixels float
  const IDLE_AMPLITUDE = 1.2;    // how far the idle pixels drift

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // HiDPI setup
    const setupCanvas = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px
      return { w, h };
    };

    let { w: width, h: height } = setupCanvas();

    const pastelColors = [
      '#ffd6e8', '#dafbe1', '#e0e7ff', '#ffe3ec', '#f0f4ff', '#e6f7f1', '#fef3c7'
    ];

    // stable hash (0..1) so selection is consistent per pixel
    const hash = (x, y) => {
      const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return s - Math.floor(s);
    };

    // build grid (CSS px)
    let pixelGrid = [];
    const buildGrid = () => {
      pixelGrid = [];
      for (let x = 0; x < width; x += GRID_SIZE) {
        for (let y = 0; y < height; y += GRID_SIZE) {
          const stamp = hash(x, y); // stable 0..1
          pixelGrid.push({
            baseX: x,
            baseY: y,
            alpha: 0,
            floatOffset: Math.random() * Math.PI * 2,
            color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
            stamp,                           // for trail density gating
            idleLift: stamp < IDLE_FRACTION, // << only some pixels float when idle
          });
        }
      }
    };

    buildGrid();

    // active pointers (mouse/touch)
    let pointers = [];

    const smoothstep = (t) => t * t * (3 - 2 * t);

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);

      for (let p of pixelGrid) {
        // idle float only if pixel is in the selected subset
        const fx = p.idleLift ? Math.cos(time / 1200 + p.floatOffset) * IDLE_AMPLITUDE : 0;
        const fy = p.idleLift ? Math.sin(time / 1000 + p.floatOffset) * IDLE_AMPLITUDE : 0;

        const x = p.baseX + fx;
        const y = p.baseY + fy;

        // base grid tile (visible lattice)
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(x, y, GRID_SIZE - 1, GRID_SIZE - 1);

        // proximity (mouse/touch → trail)
        if (pointers.length) {
          let minD = Infinity;
          for (const pt of pointers) {
            const dx = p.baseX - pt.x;
            const dy = p.baseY - pt.y;
            const d = Math.hypot(dx, dy);
            if (d < minD) minD = d;
          }
          const radius = GRID_SIZE * RADIUS_MULT;
          if (minD < radius) {
            const t0 = 1 - minD / radius;   // 0..1
            const t = smoothstep(t0);
            // gate by density so not all nearby pixels light up
            if (p.stamp < DENSITY * t) {
              p.alpha = Math.max(p.alpha, t * MAX_ALPHA);
            }
          }
        }

        // glow + soft lift (on trail)
        if (p.alpha > 0.01) {
          const lift = p.alpha * 2.2; // slight lift as it glows
          ctx.fillStyle = p.color;
          ctx.shadowBlur = SHADOW_BLUR;
          ctx.shadowColor = p.color;
          ctx.fillRect(x + 1, y + 1 - lift, GRID_SIZE - 3, GRID_SIZE - 3);

          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(0,0,0,${p.alpha * 0.12})`;
          ctx.fillRect(x + 2, y + 2 - lift, GRID_SIZE - 4, GRID_SIZE - 4);

          // fade out
          p.alpha -= FADE_SPEED;
        }
      }

      requestAnimationFrame(draw);
    };

    // input handlers
    const updateFromMouse = (e) => {
      pointers = [{ x: e.clientX, y: e.clientY }];
    };
    const clearPointers = () => { pointers = []; };
    const updateFromTouches = (e) => {
      pointers = Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY }));
    };

    // listeners (passive for smooth scroll)
    window.addEventListener('mousemove', updateFromMouse, { passive: true });
    window.addEventListener('mouseleave', clearPointers, { passive: true });
    window.addEventListener('touchstart', updateFromTouches, { passive: true });
    window.addEventListener('touchmove', updateFromTouches, { passive: true });
    window.addEventListener('touchend', updateFromTouches, { passive: true });
    window.addEventListener('touchcancel', updateFromTouches, { passive: true });

    // resize / DPR changes
    const handleResize = () => {
      const d = setupCanvas();
      width = d.w; height = d.h;
      buildGrid();
    };
    window.addEventListener('resize', handleResize);

    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', updateFromMouse);
      window.removeEventListener('mouseleave', clearPointers);
      window.removeEventListener('touchstart', updateFromTouches);
      window.removeEventListener('touchmove', updateFromTouches);
      window.removeEventListener('touchend', updateFromTouches);
      window.removeEventListener('touchcancel', updateFromTouches);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
