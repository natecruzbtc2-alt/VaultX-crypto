import { useEffect, useRef } from "react";

export default function CryptoBackground({ light = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", resize);

    // ── PARTICLES ─────────────────────────────────────────────────────
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: .5 + Math.random() * 1.5,
      op: .1 + Math.random() * .2,
      phase: Math.random() * Math.PI * 2,
    }));

    // ── NETWORK NODES ─────────────────────────────────────────────────
    const nodes = Array.from({ length: 35 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: 1.5 + Math.random() * 2,
      op: .12 + Math.random() * .18,
    }));

    // ── HEXAGON ANIMATION ─────────────────────────────────────────────
    let hexAngle = 0;
    let hexPulse = 0;

    function drawHex(cx, cy, size, angle, alpha, strokeColor, glowColor, lineW = 2) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Glow
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 40;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = Math.cos(a) * size;
        const y = Math.sin(a) * size;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Gradient stroke
      const grad = ctx.createLinearGradient(-size, -size, size, size);
      grad.addColorStop(0, strokeColor[0]);
      grad.addColorStop(.5, strokeColor[1]);
      grad.addColorStop(1, strokeColor[2] || strokeColor[0]);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineW;
      ctx.stroke();

      // Inner fill
      const fill = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
      fill.addColorStop(0, `rgba(120,80,255,${alpha * .08})`);
      fill.addColorStop(1, `rgba(80,160,255,${alpha * .03})`);
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Background gradient — deep navy/purple like BCB
      const bg = ctx.createRadialGradient(W * .35, H * .4, 0, W * .5, H * .5, W * .85);
      bg.addColorStop(0,   "rgba(60,20,120,.55)");
      bg.addColorStop(.35, "rgba(20,10,80,.4)");
      bg.addColorStop(.7,  "rgba(8,6,40,.3)");
      bg.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Secondary purple glow top-left
      const bg2 = ctx.createRadialGradient(W * .15, H * .2, 0, W * .15, H * .2, W * .4);
      bg2.addColorStop(0,  "rgba(100,40,200,.18)");
      bg2.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(120,80,255,.06)"; ctx.lineWidth = .5;
      for (let c = 0; c <= 24; c++) { const x = (W/24)*c; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let r = 0; r <= 14; r++) { const y = (H/14)*r; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Node network
      nodes.forEach(n => { n.x=(n.x+n.vx+W)%W; n.y=(n.y+n.vy+H)%H; });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 160) {
            ctx.strokeStyle = `rgba(120,80,255,${(1-dist/160)*.07})`;
            ctx.lineWidth = .5;
            ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.save(); ctx.globalAlpha = n.op;
        ctx.fillStyle = "rgba(150,100,255,1)";
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Particles
      particles.forEach(p => {
        p.x=(p.x+p.vx+W)%W; p.y=(p.y+p.vy+H)%H; p.phase+=.015;
        const op = p.op * (.6+.4*Math.sin(p.phase));
        ctx.save(); ctx.globalAlpha=op;
        ctx.fillStyle="rgba(180,140,255,1)";
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // ── MAIN HEXAGON ──────────────────────────────────────────────
      hexAngle += .004;
      hexPulse += .02;
      const pulse = Math.sin(hexPulse) * 8;
      const cx = W * .62, cy = H * .48;
      const baseSize = Math.min(W, H) * .22;

      // Outer glow rings
      for (let i = 3; i >= 1; i--) {
        drawHex(cx, cy, baseSize + pulse + i*28, hexAngle, .08 + i*.04,
          ["rgba(80,180,255,.3)","rgba(120,80,255,.3)","rgba(80,220,255,.3)"],
          "rgba(100,160,255,.4)", .5);
      }

      // Main hex — outer
      drawHex(cx, cy, baseSize + pulse, hexAngle,
        .85,
        ["#7eb8ff","#a084ff","#60e8ff"],
        "rgba(120,180,255,.9)", 2.5);

      // Main hex — inner rotated
      drawHex(cx, cy, (baseSize + pulse) * .72, -hexAngle * 1.3,
        .7,
        ["#a084ff","#60e8ff","#7eb8ff"],
        "rgba(160,120,255,.8)", 2);

      // Core hex
      drawHex(cx, cy, (baseSize + pulse) * .44, hexAngle * .8,
        .55,
        ["#60e8ff","#a084ff","#7eb8ff"],
        "rgba(80,220,255,.7)", 1.5);

      // Center glow dot
      ctx.save();
      ctx.globalAlpha = .6 + Math.sin(hexPulse) * .2;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseSize * .15);
      cg.addColorStop(0, "rgba(180,220,255,.9)");
      cg.addColorStop(.5, "rgba(100,160,255,.4)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, baseSize*.15, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Orbiting small hexagons
      for (let i = 0; i < 3; i++) {
        const orbitAngle = hexAngle * (i%2===0?1:-1) + (i * Math.PI * 2/3);
        const orbitR = baseSize * (.95 + Math.sin(hexPulse + i)*0.05);
        const ox = cx + Math.cos(orbitAngle) * orbitR;
        const oy = cy + Math.sin(orbitAngle) * orbitR;
        drawHex(ox, oy, baseSize * .09, hexAngle * 2,
          .5 + Math.sin(hexPulse + i) * .15,
          ["#a084ff","#60e8ff","#7eb8ff"],
          "rgba(120,160,255,.6)", 1.2);
      }

      // Rotating dashes around hex
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(hexAngle * .5);
      ctx.globalAlpha = .15;
      ctx.strokeStyle = "rgba(120,180,255,1)";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 20]);
      ctx.beginPath();
      ctx.arc(0, 0, baseSize * 1.28 + pulse*.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

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
