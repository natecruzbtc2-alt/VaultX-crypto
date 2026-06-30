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

    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", resize);

    // ── PARTICLES (more visible) ────────────────────────────────────────
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
      r: .8 + Math.random() * 2,
      op: .15 + Math.random() * .3,
      phase: Math.random() * Math.PI * 2,
    }));

    // ── NETWORK NODES ────────────────────────────────────────────────────
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
      r: 1.8 + Math.random() * 2.2,
      op: .18 + Math.random() * .25,
    }));

    // ── FLOATING ORBS (depth layer) ──────────────────────────────────────
    const orbs = Array.from({ length: 5 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 80 + Math.random() * 160,
      vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15,
      op: .04 + Math.random() * .05,
      hue: Math.random() > .5 ? "purple" : "blue",
    }));

    let hexAngle = 0;
    let hexPulse = 0;

    function drawHex(cx, cy, size, angle, alpha, strokeColors, glowColor, lineW, fillAlpha = 0.06) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 50;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = Math.cos(a) * size;
        const y = Math.sin(a) * size;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      const grad = ctx.createLinearGradient(-size, -size, size, size);
      grad.addColorStop(0, strokeColors[0]);
      grad.addColorStop(.5, strokeColors[1]);
      grad.addColorStop(1, strokeColors[2] || strokeColors[0]);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineW;
      ctx.stroke();

      ctx.shadowBlur = 0;
      const fill = ctx.createRadialGradient(-size*.2, -size*.2, 0, 0, 0, size);
      fill.addColorStop(0, `rgba(140,100,255,${fillAlpha})`);
      fill.addColorStop(.6, `rgba(100,160,255,${fillAlpha*.5})`);
      fill.addColorStop(1, `rgba(60,40,140,${fillAlpha*.15})`);
      ctx.fillStyle = fill;
      ctx.fill();

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Base background gradient — richer, deeper
      const bg = ctx.createRadialGradient(W * .38, H * .42, 0, W * .5, H * .5, W * .9);
      bg.addColorStop(0,   "rgba(75,30,150,.6)");
      bg.addColorStop(.3,  "rgba(40,18,110,.45)");
      bg.addColorStop(.6,  "rgba(18,10,60,.35)");
      bg.addColorStop(1,   "rgba(2,2,10,.2)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Top-left accent glow
      const bg2 = ctx.createRadialGradient(W * .1, H * .1, 0, W * .1, H * .1, W * .5);
      bg2.addColorStop(0,  "rgba(130,60,255,.22)");
      bg2.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);

      // Bottom-right cyan glow for balance
      const bg3 = ctx.createRadialGradient(W * .85, H * .8, 0, W * .85, H * .8, W * .45);
      bg3.addColorStop(0,  "rgba(60,160,255,.14)");
      bg3.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = bg3; ctx.fillRect(0, 0, W, H);

      // Floating depth orbs
      orbs.forEach(o => {
        o.x = (o.x + o.vx + W) % W; o.y = (o.y + o.vy + H) % H;
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        const col = o.hue === "purple" ? "140,90,255" : "80,170,255";
        grad.addColorStop(0, `rgba(${col},${o.op})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI*2); ctx.fill();
      });

      // Grid — slightly more visible
      ctx.strokeStyle = "rgba(140,100,255,.08)"; ctx.lineWidth = .5;
      for (let c = 0; c <= 24; c++) { const x=(W/24)*c; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let r = 0; r <= 14; r++) { const y=(H/14)*r; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // Node network
      nodes.forEach(n => { n.x=(n.x+n.vx+W)%W; n.y=(n.y+n.vy+H)%H; });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 170) {
            ctx.strokeStyle = `rgba(140,100,255,${(1-dist/170)*.12})`;
            ctx.lineWidth = .6;
            ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.save(); ctx.globalAlpha = n.op;
        ctx.shadowColor = "rgba(160,120,255,.8)"; ctx.shadowBlur = 6;
        ctx.fillStyle = "rgba(170,130,255,1)";
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Particles — brighter
      particles.forEach(p => {
        p.x=(p.x+p.vx+W)%W; p.y=(p.y+p.vy+H)%H; p.phase+=.018;
        const op = p.op * (.6+.4*Math.sin(p.phase));
        ctx.save(); ctx.globalAlpha=op;
        ctx.fillStyle="rgba(200,170,255,1)";
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // ── MAIN HEXAGON — with real depth ──────────────────────────────
      hexAngle += .004;
      hexPulse += .02;
      const pulse = Math.sin(hexPulse) * 8;
      const cx = W * .62, cy = H * .48;
      const baseSize = Math.min(W, H) * .23;

      // Outer ambient glow ring (soft halo)
      const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseSize * 1.8);
      haloGrad.addColorStop(0, "rgba(120,90,255,.12)");
      haloGrad.addColorStop(.5, "rgba(80,160,255,.06)");
      haloGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath(); ctx.arc(cx, cy, baseSize*1.8, 0, Math.PI*2); ctx.fill();

      // Outer glow rings
      for (let i = 3; i >= 1; i--) {
        drawHex(cx, cy, baseSize + pulse + i*30, hexAngle, .1 + i*.05,
          ["rgba(100,180,255,.4)","rgba(140,90,255,.4)","rgba(90,220,255,.4)"],
          "rgba(120,170,255,.5)", .6, 0.02);
      }

      // Main hex — outer with strong fill for depth
      drawHex(cx, cy, baseSize + pulse, hexAngle, .95,
        ["#8ec4ff","#b094ff","#70eaff"],
        "rgba(140,190,255,1)", 3, 0.1);

      // Main hex — inner rotated
      drawHex(cx, cy, (baseSize + pulse) * .7, -hexAngle * 1.3, .85,
        ["#b094ff","#70eaff","#8ec4ff"],
        "rgba(170,130,255,.9)", 2.4, 0.08);

      // Core hex
      drawHex(cx, cy, (baseSize + pulse) * .42, hexAngle * .8, .75,
        ["#70eaff","#b094ff","#8ec4ff"],
        "rgba(90,230,255,.9)", 1.8, 0.12);

      // Bright center glow dot
      ctx.save();
      ctx.globalAlpha = .8 + Math.sin(hexPulse) * .15;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseSize * .18);
      cg.addColorStop(0, "rgba(220,235,255,1)");
      cg.addColorStop(.4, "rgba(150,180,255,.7)");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, baseSize*.18, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Orbiting small hexagons — brighter with trail glow
      for (let i = 0; i < 3; i++) {
        const orbitAngle = hexAngle * (i%2===0?1:-1) + (i * Math.PI * 2/3);
        const orbitR = baseSize * (.98 + Math.sin(hexPulse + i)*0.06);
        const ox = cx + Math.cos(orbitAngle) * orbitR;
        const oy = cy + Math.sin(orbitAngle) * orbitR;
        drawHex(ox, oy, baseSize * .1, hexAngle * 2,
          .65 + Math.sin(hexPulse + i) * .2,
          ["#b094ff","#70eaff","#8ec4ff"],
          "rgba(150,180,255,.8)", 1.5, 0.15);
      }

      // Rotating dashed orbit ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(hexAngle * .5);
      ctx.globalAlpha = .22;
      ctx.strokeStyle = "rgba(150,190,255,1)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([8, 22]);
      ctx.beginPath();
      ctx.arc(0, 0, baseSize * 1.32 + pulse*.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Vignette for depth at edges
      const vg = ctx.createRadialGradient(W/2, H/2, H*.3, W/2, H/2, H*.85);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,.35)");
      ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);

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
