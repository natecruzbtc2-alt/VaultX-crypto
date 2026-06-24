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

    const makeChart = (i) => {
      const pts = [];
      let y = H * (0.2 + Math.random() * 0.6);
      for (let j = 0; j < 80; j++) {
        y = Math.max(H*.05, Math.min(H*.95, y + (Math.random()-.48)*20));
        pts.push(y);
      }
      const colors = ["#ffc800","#ffd633","#e6b400","#ffffff","#ffc800"];
      return { pts, drawn: Math.random()*40, speed: 0.06+Math.random()*.1, color: colors[i%colors.length], opacity: 0.04+Math.random()*.07, lineW: 0.6+Math.random()*.8 };
    };
    let charts = [0,1,2,3,4].map(makeChart);

    const dots = Array.from({length:50}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      r:0.4+Math.random()*1.2,
      vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2,
      op:0.04+Math.random()*.1, phase:Math.random()*Math.PI*2
    }));

    // ── CRYPTO BUBBLES ────────────────────────────────────────────────────────
    const SYMBOLS = [
      { sym:"BTC",  color:"#F7931A" },
      { sym:"ETH",  color:"#7B8CDE" },
      { sym:"SOL",  color:"#9945FF" },
      { sym:"BNB",  color:"#F0B90B" },
      { sym:"XRP",  color:"#00AAE4" },
      { sym:"ADA",  color:"#4A90E2" },
      { sym:"DOGE", color:"#C2A633" },
      { sym:"USDT", color:"#26A17B" },
      { sym:"BTC",  color:"#F7931A" },
      { sym:"ETH",  color:"#7B8CDE" },
      { sym:"SOL",  color:"#9945FF" },
      { sym:"BNB",  color:"#F0B90B" },
    ];

    const makeBubble = () => {
      const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const r = 18 + Math.random() * 28;
      return {
        x: Math.random() * W,
        y: H + r + Math.random() * H,
        r,
        vx: (Math.random() - .5) * .4,
        vy: -(0.3 + Math.random() * 0.5),
        sym: s.sym,
        color: s.color,
        op: 0.25 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        wobble: (Math.random() - .5) * .015,
      };
    };

    let bubbles = Array.from({ length: 18 }, makeBubble).map(b => ({
      ...b,
      y: Math.random() * H, // start scattered on screen
    }));

    let scanX = 0;

    function draw() {
      ctx.clearRect(0,0,W,H);

      const grd = ctx.createRadialGradient(W/2, 0, 0, W/2, H*.4, W*.6);
      grd.addColorStop(0,   "rgba(255,200,0,.06)");
      grd.addColorStop(.35, "rgba(255,200,0,.02)");
      grd.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);

      ctx.strokeStyle = "rgba(255,255,255,.022)";
      ctx.lineWidth = .5;
      for(let c=0;c<=18;c++){const x=(W/18)*c;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let r=0;r<=10;r++){const y=(H/10)*r;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      scanX = (scanX+.4)%W;
      const sg = ctx.createLinearGradient(scanX-100,0,scanX+2,0);
      sg.addColorStop(0,"rgba(255,200,0,0)"); sg.addColorStop(1,"rgba(255,200,0,.025)");
      ctx.fillStyle=sg; ctx.fillRect(scanX-100,0,102,H);
      ctx.strokeStyle="rgba(255,200,0,.05)"; ctx.lineWidth=1;
      ctx.setLineDash([4,8]); ctx.beginPath(); ctx.moveTo(scanX,0); ctx.lineTo(scanX,H); ctx.stroke(); ctx.setLineDash([]);

      charts.forEach((ch,ci) => {
        ch.drawn += ch.speed;
        if(ch.drawn>=ch.pts.length-1){charts[ci]=makeChart(ci);return;}
        const count=Math.floor(ch.drawn);
        if(count<2) return;
        const stepX = W/(ch.pts.length-1);
        const hex=ch.color.replace("#","");
        const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
        ctx.save(); ctx.globalAlpha=ch.opacity;
        ctx.beginPath(); ctx.moveTo(0,H);
        for(let i=0;i<=count;i++) ctx.lineTo(i*stepX,ch.pts[i]);
        ctx.lineTo(count*stepX,H); ctx.closePath();
        const ag=ctx.createLinearGradient(0,0,0,H);
        ag.addColorStop(0,`rgba(${r},${g},${b},.2)`); ag.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.fillStyle=ag; ctx.fill();
        ctx.beginPath();
        for(let i=0;i<=count;i++){const x=i*stepX,y=ch.pts[i];i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
        ctx.strokeStyle=`rgba(${r},${g},${b},.6)`; ctx.lineWidth=ch.lineW; ctx.lineJoin="round"; ctx.stroke();
        const hx=count*stepX, hy=ch.pts[count];
        ctx.globalAlpha=Math.min(1,ch.opacity*5);
        ctx.beginPath(); ctx.arc(hx,hy,2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},1)`; ctx.fill();
        ctx.restore();
      });

      dots.forEach(d=>{
        d.x=(d.x+d.vx+W)%W; d.y=(d.y+d.vy+H)%H; d.phase+=.02;
        const op=d.op*(0.5+.5*Math.sin(d.phase));
        ctx.save(); ctx.globalAlpha=op;
        ctx.fillStyle="rgba(255,200,0,1)"; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // ── Draw crypto bubbles ──────────────────────────────────────────────
      bubbles.forEach((b, i) => {
        b.phase += .008;
        b.vx += b.wobble;
        if (Math.abs(b.vx) > 0.6) b.wobble *= -1;
        b.x += b.vx;
        b.y += b.vy;

        // Reset bubble when it floats off the top
        if (b.y < -b.r * 2) {
          bubbles[i] = makeBubble();
          return;
        }

        const pulseOp = b.op * (0.7 + 0.3 * Math.sin(b.phase));

        // Parse coin color
        const hex = b.color.replace("#","");
        const cr = parseInt(hex.slice(0,2),16);
        const cg = parseInt(hex.slice(2,4),16);
        const cb = parseInt(hex.slice(4,6),16);

        ctx.save();
        ctx.globalAlpha = pulseOp;

        // Bubble circle
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.9)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Subtle fill
        const grad = ctx.createRadialGradient(b.x - b.r*.3, b.y - b.r*.3, 0, b.x, b.y, b.r);
        grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.18)`);
        grad.addColorStop(1, `rgba(${cr},${cg},${cb},0.08)`);
        ctx.fillStyle = grad;
        ctx.fill();

        // Symbol text
        ctx.globalAlpha = pulseOp * 2.2;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},1)`;
        ctx.font = `bold ${Math.round(b.r * 0.52)}px 'DM Sans',system-ui,sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.sym, b.x, b.y);

        ctx.restore();
      });

      ctx.save(); ctx.strokeStyle="rgba(255,200,0,.15)"; ctx.lineWidth=1.5;
      [[20,20,1,1],[W-20,20,-1,1],[20,H-20,1,-1],[W-20,H-20,-1,-1]].forEach(([x,y,sx,sy])=>{
        ctx.beginPath(); ctx.moveTo(x,y+sy*16); ctx.lineTo(x,y); ctx.lineTo(x+sx*16,y); ctx.stroke();
      });
      ctx.restore();

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize",resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", top:0, left:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:0, display:"block",
    }}/>
  );
}
