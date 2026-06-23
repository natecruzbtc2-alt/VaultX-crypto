import { useEffect, useRef } from "react";

export default function CryptoBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", resize);

    // ── CHART LINES ──────────────────────────────────────────────────────────
    const makeChart = (i) => {
      const pts = [];
      let y = H * (0.15 + Math.random() * 0.7);
      for (let j = 0; j < 120; j++) {
        y = Math.max(H * .05, Math.min(H * .95, y + (Math.random() - .48) * (H * .03)));
        pts.push(y);
      }
      const configs = [
        { color:"#e8000d", opacity:.18, lw:1.5 },
        { color:"#ff4d55", opacity:.10, lw:1.0 },
        { color:"#ff1a24", opacity:.14, lw:1.2 },
        { color:"#ffffff", opacity:.05, lw:.8  },
        { color:"#e8000d", opacity:.12, lw:1.8 },
      ];
      const cfg = configs[i % configs.length];
      return { pts, drawn: Math.random() * 40, speed: .08 + Math.random() * .12, ...cfg };
    };

    let charts = [0,1,2,3,4].map(makeChart);
    let scanX = 0;
    let t = 0;

    // ── PARTICLES ────────────────────────────────────────────────────────────
    const particles = Array.from({ length:80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: .4 + Math.random() * 1.6,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      op: .05 + Math.random() * .2,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > .7 ? "#ff4d55" : "#ffffff"
    }));

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // ── BACKGROUND GRADIENT ───────────────────────────────────────────────
      // Deep red glow top-center
      const rg = ctx.createRadialGradient(W*.5, 0, 0, W*.5, H*.5, W*.7);
      rg.addColorStop(0,   "rgba(232,0,13,.14)");
      rg.addColorStop(.3,  "rgba(200,0,10,.06)");
      rg.addColorStop(.6,  "rgba(100,0,5,.02)");
      rg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

      // Bottom left subtle glow
      const rg2 = ctx.createRadialGradient(0, H, 0, W*.3, H*.7, W*.5);
      rg2.addColorStop(0, "rgba(232,0,13,.06)");
      rg2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg2; ctx.fillRect(0, 0, W, H);

      // ── GRID ─────────────────────────────────────────────────────────────
      const COLS = 20, ROWS = 12;
      ctx.strokeStyle = "rgba(255,255,255,.028)";
      ctx.lineWidth = .5;
      for (let c = 0; c <= COLS; c++) {
        const x = (W / COLS) * c;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        const y = (H / ROWS) * r;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── SCAN LINE ────────────────────────────────────────────────────────
      scanX = (scanX + .5) % W;
      const sg = ctx.createLinearGradient(scanX - 160, 0, scanX + 2, 0);
      sg.addColorStop(0, "rgba(232,0,13,0)");
      sg.addColorStop(.8, "rgba(232,0,13,.04)");
      sg.addColorStop(1, "rgba(232,0,13,.08)");
      ctx.fillStyle = sg; ctx.fillRect(scanX - 160, 0, 162, H);

      ctx.save();
      ctx.strokeStyle = "rgba(232,0,13,.12)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 12]);
      ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, H); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── CHARTS ───────────────────────────────────────────────────────────
      charts.forEach((ch, ci) => {
        ch.drawn += ch.speed;
        if (ch.drawn >= ch.pts.length - 1) { charts[ci] = makeChart(ci); return; }
        const count = Math.floor(ch.drawn);
        if (count < 2) return;

        const stepX = W / (ch.pts.length - 1);

        ctx.save();
        ctx.globalAlpha = ch.opacity;

        // Fill area
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let i = 0; i <= count; i++) ctx.lineTo(i * stepX, ch.pts[i]);
        ctx.lineTo(count * stepX, H);
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, 0, 0, H);
        const hex = ch.color.replace("#","");
        const r = parseInt(hex.slice(0,2),16), g2 = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
        ag.addColorStop(0, `rgba(${r},${g2},${b},.35)`);
        ag.addColorStop(.5, `rgba(${r},${g2},${b},.08)`);
        ag.addColorStop(1, `rgba(${r},${g2},${b},0)`);
        ctx.fillStyle = ag; ctx.fill();

        // Line
        ctx.beginPath();
        for (let i = 0; i <= count; i++) {
          const x = i * stepX, y = ch.pts[i];
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${r},${g2},${b},.9)`;
        ctx.lineWidth = ch.lw;
        ctx.lineJoin = "round";
        ctx.stroke();

        // Dot at tip
        const hx = count * stepX, hy = ch.pts[count];
        ctx.globalAlpha = Math.min(1, ch.opacity * 6);
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g2},${b},1)`; ctx.fill();

        // Pulse ring on tip
        const pulse = (Math.sin(t * .08) + 1) * .5;
        ctx.globalAlpha = ch.opacity * pulse;
        ctx.beginPath(); ctx.arc(hx, hy, 6 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g2},${b},.5)`;
        ctx.lineWidth = 1; ctx.stroke();

        ctx.restore();
      });

      // ── PARTICLES ────────────────────────────────────────────────────────
      particles.forEach(p => {
        p.x = (p.x + p.vx + W) % W;
        p.y = (p.y + p.vy + H) % H;
        p.phase += .015;
        const op = p.op * (.5 + .5 * Math.sin(p.phase));
        ctx.save();
        ctx.globalAlpha = op;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // ── CORNER BRACKETS ──────────────────────────────────────────────────
      ctx.save();
      ctx.strokeStyle = "rgba(232,0,13,.25)";
      ctx.lineWidth = 1.5;
      const sz = 20;
      [[20,20,1,1],[W-20,20,-1,1],[20,H-20,1,-1],[W-20,H-20,-1,-1]].forEach(([x,y,sx,sy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + sy*sz); ctx.lineTo(x, y); ctx.lineTo(x + sx*sz, y);
        ctx.stroke();
      });
      ctx.restore();

      // ── HORIZONTAL ACCENT LINE ───────────────────────────────────────────
      const lineY = H * .72;
      const lg = ctx.createLinearGradient(0, 0, W, 0);
      lg.addColorStop(0, "rgba(232,0,13,0)");
      lg.addColorStop(.3, "rgba(232,0,13,.08)");
      lg.addColorStop(.5, "rgba(232,0,13,.15)");
      lg.addColorStop(.7, "rgba(232,0,13,.08)");
      lg.addColorStop(1, "rgba(232,0,13,0)");
      ctx.strokeStyle = lg; ctx.lineWidth = .5;
      ctx.beginPath(); ctx.moveTo(0, lineY); ctx.lineTo(W, lineY); ctx.stroke();

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", top:0, left:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:0, display:"block",
    }}/>
  );
}
