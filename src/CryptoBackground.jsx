import { useEffect, useRef } from "react";

export default function CryptoBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", resize);

    // ── PRICE LINES (simulate live chart lines) ──────────────────────────────
    const createLine = (i) => {
      const baseY = H * (0.2 + Math.random() * 0.6);
      const points = [{ x: 0, y: baseY }];
      let x = 0;
      while (x < W + 100) {
        x += 18 + Math.random() * 28;
        const prev = points[points.length - 1];
        const dy = (Math.random() - 0.48) * 28;
        points.push({ x, y: Math.max(40, Math.min(H - 40, prev.y + dy)) });
      }
      return {
        points,
        progress: Math.random() * points.length,
        speed: 0.12 + Math.random() * 0.18,
        opacity: 0.06 + Math.random() * 0.1,
        color: Math.random() > 0.4 ? "#ffc800" : (Math.random() > 0.5 ? "#22c55e" : "#ef4444"),
        width: 0.8 + Math.random() * 0.8,
        trail: [],
      };
    };

    const lines = Array.from({ length: 6 }, (_, i) => createLine(i));

    // ── GRID ─────────────────────────────────────────────────────────────────
    const GRID_COLS = 12, GRID_ROWS = 8;

    // ── PARTICLES (minimal dots) ──────────────────────────────────────────────
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.8 + Math.random() * 1.8,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: 0.08 + Math.random() * 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // ── SCANLINE ─────────────────────────────────────────────────────────────
    let scanX = 0;

    let frame = 0, animId;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // ── Background glow ───────────────────────────────────────────────────
      const radGrad = ctx.createRadialGradient(W/2, 0, 0, W/2, H*.5, W*.7);
      radGrad.addColorStop(0, "rgba(255,200,0,.06)");
      radGrad.addColorStop(.5, "rgba(255,200,0,.015)");
      radGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, W, H);

      // ── Grid ─────────────────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(255,200,0,.045)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= GRID_COLS; c++) {
        const x = (W / GRID_COLS) * c;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let r = 0; r <= GRID_ROWS; r++) {
        const y = (H / GRID_ROWS) * r;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── Horizontal axis labels (price-like) ──────────────────────────────
      ctx.fillStyle = "rgba(255,200,0,.12)";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      const prices = [68000, 67500, 67000, 66500, 66000, 65500, 65000, 64500];
      for (let r = 0; r <= GRID_ROWS; r++) {
        const y = (H / GRID_ROWS) * r;
        if (prices[r]) ctx.fillText("$" + prices[r].toLocaleString(), W - 6, y - 4);
      }

      // ── Scanline (vertical moving cursor) ────────────────────────────────
      scanX += 0.4;
      if (scanX > W) scanX = 0;
      const scanGrad = ctx.createLinearGradient(scanX - 60, 0, scanX + 2, 0);
      scanGrad.addColorStop(0, "rgba(255,200,0,0)");
      scanGrad.addColorStop(1, "rgba(255,200,0,.04)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(scanX - 60, 0, 62, H);
      ctx.strokeStyle = "rgba(255,200,0,.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, H); ctx.stroke();
      ctx.setLineDash([]);

      // ── Price chart lines ─────────────────────────────────────────────────
      lines.forEach((l, li) => {
        l.progress += l.speed;
        if (l.progress >= l.points.length - 1) {
          lines[li] = createLine(li);
          return;
        }

        const visiblePoints = l.points.slice(0, Math.floor(l.progress) + 1);
        if (visiblePoints.length < 2) return;

        // Area fill under line
        ctx.beginPath();
        ctx.moveTo(visiblePoints[0].x, H);
        visiblePoints.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(visiblePoints[visiblePoints.length - 1].x, H);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, 0, 0, H);
        areaGrad.addColorStop(0, l.color.replace("#", "rgba(") + ".replace", "placeholder");
        const hex = l.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const ag = ctx.createLinearGradient(0, 0, 0, H);
        ag.addColorStop(0, `rgba(${r},${g},${b},${l.opacity * 0.4})`);
        ag.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = ag;
        ctx.fill();

        // Line itself
        ctx.beginPath();
        visiblePoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = `rgba(${r},${g},${b},${l.opacity * 2.5})`;
        ctx.lineWidth = l.width;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        // Dot at current head
        const head = visiblePoints[visiblePoints.length - 1];
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${l.opacity * 4})`;
        ctx.fill();

        // Glow at head
        const headGlow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12);
        headGlow.addColorStop(0, `rgba(${r},${g},${b},${l.opacity * 2})`);
        headGlow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();
      });

      // ── Floating dots ─────────────────────────────────────────────────────
      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        p.pulse += 0.03;
        if (p.x < 0 || p.x > W) p.speedX *= -1;
        if (p.y < 0 || p.y > H) p.speedY *= -1;
        const po = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,200,0,${po})`;
        ctx.fill();
      });

      // ── Corner decorations ────────────────────────────────────────────────
      ["TL","TR","BL","BR"].forEach(corner => {
        ctx.save();
        const cx = corner.includes("L") ? 20 : W - 20;
        const cy = corner.includes("T") ? 20 : H - 20;
        const len = 16;
        ctx.strokeStyle = "rgba(255,200,0,.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy + (corner.includes("T") ? 0 : -len));
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + (corner.includes("L") ? len : -len), cy);
        ctx.stroke();
        ctx.restore();
      });

      frame++;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
