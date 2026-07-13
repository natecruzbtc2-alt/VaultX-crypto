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

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2,
      op: 0.1 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.01,
    }));

    // Floating orbs
    const orbs = [
      { x: W * 0.75, y: H * 0.35, r: 280, color: "255,180,0", op: 0.04 },
      { x: W * 0.15, y: H * 0.6,  r: 200, color: "255,140,0", op: 0.03 },
      { x: W * 0.5,  y: H * 0.8,  r: 160, color: "255,200,50", op: 0.025 },
    ];

    // Animated chart lines
    const makeChart = () => {
      const pts = [];
      let y = H * (0.3 + Math.random() * 0.4);
      for (let i = 0; i < 60; i++) {
        y = Math.max(H*.1, Math.min(H*.9, y + (Math.random()-.46)*18));
        pts.push(y);
      }
      return { pts, drawn: Math.random()*30, speed: 0.04+Math.random()*.06, op: 0.04+Math.random()*.05 };
    };
    let charts = [0,1,2].map(makeChart);

    // Grid lines
    const gridLines = {
      h: Array.from({length:8}, (_,i) => H/8*i),
      v: Array.from({length:12}, (_,i) => W/12*i),
    };

    let t = 0;

    function draw() {
      ctx.clearRect(0,0,W,H);
      t += 0.008;

      // Deep background
      const bg = ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,   "#080608");
      bg.addColorStop(0.5, "#0a0806");
      bg.addColorStop(1,   "#06060a");
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

      // Ambient orbs
      orbs.forEach(o => {
        const g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
        g.addColorStop(0, `rgba(${o.color},${o.op})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      });

      // Subtle grid
      ctx.strokeStyle = "rgba(255,180,0,.04)"; ctx.lineWidth = .5;
      gridLines.h.forEach(y => { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); });
      gridLines.v.forEach(x => { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); });

      // Chart lines
      charts.forEach((ch,ci) => {
        ch.drawn += ch.speed;
        if (ch.drawn >= ch.pts.length-1) { charts[ci] = makeChart(); return; }
        const count = Math.floor(ch.drawn);
        if (count < 2) return;
        const stepX = W/(ch.pts.length-1);
        ctx.save(); ctx.globalAlpha = ch.op;
        // Fill
        ctx.beginPath(); ctx.moveTo(0,H);
        for (let i=0;i<=count;i++) ctx.lineTo(i*stepX, ch.pts[i]);
        ctx.lineTo(count*stepX,H); ctx.closePath();
        const ag = ctx.createLinearGradient(0,0,0,H);
        ag.addColorStop(0,"rgba(255,180,0,.15)"); ag.addColorStop(1,"rgba(255,180,0,0)");
        ctx.fillStyle=ag; ctx.fill();
        // Line
        ctx.beginPath();
        for (let i=0;i<=count;i++) { const x=i*stepX,y=ch.pts[i]; i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
        ctx.strokeStyle="rgba(255,180,0,.5)"; ctx.lineWidth=1.2; ctx.lineJoin="round"; ctx.stroke();
        // Dot
        ctx.globalAlpha=ch.op*4;
        ctx.beginPath(); ctx.arc(count*stepX,ch.pts[count],2.5,0,Math.PI*2);
        ctx.fillStyle="#ffb400"; ctx.fill();
        ctx.restore();
      });

      // Stars
      stars.forEach(s => {
        s.phase += s.speed;
        const op = s.op * (0.5 + 0.5*Math.sin(s.phase));
        ctx.save(); ctx.globalAlpha=op;
        ctx.fillStyle="#fff";
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Vignette
      const vg = ctx.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.9);
      vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,.5)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize",resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0 }}/>;
}
