import { useEffect, useRef } from "react";

export default function CryptoBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
    };
    window.addEventListener("resize", resize);

    const COLS = 14, ROWS = 9;
    const COLORS = ["#ffc800", "#22c55e", "#ef4444", "#ffc800", "#60a5fa"];

    function parseHex(hex) {
      const h = hex.replace("#", "");
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    }

    function makeChart(idx) {
      const totalPts = 60;
      const pts = [];
      let y = H * (0.25 + Math.random() * 0.5);
      for (let i = 0; i < totalPts; i++) {
        y = Math.max(H * 0.1, Math.min(H * 0.9, y + (Math.random() - 0.48) * 25));
        pts.push(y);
      }
      return {
        pts,
        drawn: Math.floor(Math.random() * 20),
        speed: 0.08 + Math.random() * 0.12,
        color: COLORS[idx % COLORS.length],
        opacity: 0.45 + Math.random() * 0.3,
        lineW: 1.8 + Math.random() * 1.5,
      };
    }

    const charts = [0,1,2,3,4].map(makeChart);

    const dots = Array.from({ length: 35 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.5 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      op: 0.5 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    let scanX = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Top glow
      const grd = ctx.createRadialGradient(W/2, 0, 0, W/2, H*0.5, W*0.65);
      grd.addColorStop(0,   "rgba(255,200,0,.35)");
      grd.addColorStop(0.4, "rgba(255,200,0,.12)");
      grd.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.save();
      ctx.strokeStyle = "rgba(255,200,0,.28)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= COLS; c++) {
        const x = (W / COLS) * c;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        const y = (H / ROWS) * r;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();

      // Scan line
      scanX = (scanX + 0.5) % W;
      ctx.save();
      const sg = ctx.createLinearGradient(scanX - 80, 0, scanX + 2, 0);
      sg.addColorStop(0, "rgba(255,200,0,0)");
      sg.addColorStop(1, "rgba(255,200,0,.25)");
      ctx.fillStyle = sg;
      ctx.fillRect(scanX - 80, 0, 82, H);
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = "rgba(255,200,0,.35)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Chart lines
      charts.forEach((ch, ci) => {
        ch.drawn += ch.speed;
        if (ch.drawn >= ch.pts.length - 1) {
          charts[ci] = makeChart(ci);
          return;
        }
        const count = Math.floor(ch.drawn);
        if (count < 2) return;
        const stepX = W / (ch.pts.length - 1);
        const [cr, cg, cb] = parseHex(ch.color);
        ctx.save();
        ctx.globalAlpha = ch.opacity;

        // Area
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let i = 0; i <= count; i++) ctx.lineTo(i * stepX, ch.pts[i]);
        ctx.lineTo(count * stepX, H);
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, 0, 0, H);
        ag.addColorStop(0, "rgba("+cr+","+cg+","+cb+",0.45)");
        ag.addColorStop(1, "rgba("+cr+","+cg+","+cb+",0)");
        ctx.fillStyle = ag;
        ctx.fill();

        // Line
        ctx.beginPath();
        for (let i = 0; i <= count; i++) {
          const x = i * stepX, y = ch.pts[i];
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba("+cr+","+cg+","+cb+",1.0)";
        ctx.lineWidth = ch.lineW;
        ctx.lineJoin = "round";
        ctx.stroke();

        // Head dot
        const hx = count * stepX, hy = ch.pts[count];
        ctx.globalAlpha = Math.min(1, ch.opacity * 6);
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba("+cr+","+cg+","+cb+",1)";
        ctx.fill();
        ctx.restore();
      });

      // Dots
      dots.forEach(d => {
        d.x = (d.x + d.vx + W) % W;
        d.y = (d.y + d.vy + H) % H;
        d.phase += 0.025;
        const op = d.op * (0.5 + 0.5 * Math.sin(d.phase));
        ctx.save();
        ctx.globalAlpha = op;
        ctx.fillStyle = "#ffc800";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Corner brackets
      ctx.save();
      ctx.strokeStyle = "rgba(255,200,0,.85)";
      ctx.lineWidth = 1.5;
      [[20,20,1,1],[W-20,20,-1,1],[20,H-20,1,-1],[W-20,H-20,-1,-1]].forEach(([x,y,sx,sy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + sy*18);
        ctx.lineTo(x, y);
        ctx.lineTo(x + sx*18, y);
        ctx.stroke();
      });
      ctx.restore();

      animId = requestAnimationFrame(draw);
    }

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
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        display: "block",
      }}
    />
  );
}
