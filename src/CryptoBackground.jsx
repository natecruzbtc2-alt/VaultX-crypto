import { useEffect, useRef } from "react";

export default function CryptoBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", resize);

    // Chart lines
    function makeChart(i) {
      const pts = [];
      let y = H * (0.2 + Math.random() * 0.6);
      for (let j = 0; j < 80; j++) {
        y = Math.max(H*.05, Math.min(H*.95, y + (Math.random()-.48)*22));
        pts.push(y);
      }
      const colors = ["#e8000d","#ff4d55","#ff1a24","#ffffff","#e8000d"];
      return { pts, drawn: Math.random()*40, speed: 0.06+Math.random()*.1, color: colors[i%colors.length], opacity: 0.04+Math.random()*.08, lineW: 0.6+Math.random()*.8 };
    }
    const charts = [0,1,2,3,4].map(makeChart);

    // Particles
    const dots = Array.from({length:50}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      r:0.4+Math.random()*1.2,
      vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2,
      op:0.04+Math.random()*.12, phase:Math.random()*Math.PI*2
    }));

    let scanX = 0;
    const COLS = 16, ROWS = 10;

    function parseHex(hex) {
      const h = hex.replace("#","");
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    }

    function draw() {
      ctx.clearRect(0,0,W,H);

      // Radial glow - top center deep red
      const grd = ctx.createRadialGradient(W/2, 0, 0, W/2, H*.4, W*.6);
      grd.addColorStop(0,   "rgba(232,0,13,.08)");
      grd.addColorStop(.35, "rgba(232,0,13,.02)");
      grd.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0,0,W,H);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,.025)";
      ctx.lineWidth = .5;
      for(let c=0;c<=COLS;c++){const x=(W/COLS)*c;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let r=0;r<=ROWS;r++){const y=(H/ROWS)*r;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      // Scan line
      scanX = (scanX+.4)%W;
      const sg = ctx.createLinearGradient(scanX-100,0,scanX+2,0);
      sg.addColorStop(0,"rgba(232,0,13,0)"); sg.addColorStop(1,"rgba(232,0,13,.03)");
      ctx.fillStyle=sg; ctx.fillRect(scanX-100,0,102,H);
      ctx.strokeStyle="rgba(232,0,13,.06)"; ctx.lineWidth=1;
      ctx.setLineDash([4,8]); ctx.beginPath(); ctx.moveTo(scanX,0); ctx.lineTo(scanX,H); ctx.stroke(); ctx.setLineDash([]);

      // Charts
      charts.forEach((ch,ci) => {
        ch.drawn += ch.speed;
        if(ch.drawn>=ch.pts.length-1){charts[ci]=makeChart(ci);return;}
        const count=Math.floor(ch.drawn);
        if(count<2) return;
        const stepX = W/(ch.pts.length-1);
        const [cr,cg,cb] = parseHex(ch.color);
        ctx.save(); ctx.globalAlpha=ch.opacity;
        ctx.beginPath(); ctx.moveTo(0,H);
        for(let i=0;i<=count;i++) ctx.lineTo(i*stepX,ch.pts[i]);
        ctx.lineTo(count*stepX,H); ctx.closePath();
        const ag=ctx.createLinearGradient(0,0,0,H);
        ag.addColorStop(0,`rgba(${cr},${cg},${cb},.25)`); ag.addColorStop(1,`rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle=ag; ctx.fill();
        ctx.beginPath();
        for(let i=0;i<=count;i++){const x=i*stepX,y=ch.pts[i];i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
        ctx.strokeStyle=`rgba(${cr},${cg},${cb},.7)`; ctx.lineWidth=ch.lineW; ctx.lineJoin="round"; ctx.stroke();
        const hx=count*stepX, hy=ch.pts[count];
        ctx.globalAlpha=Math.min(1,ch.opacity*5);
        ctx.beginPath(); ctx.arc(hx,hy,2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(${cr},${cg},${cb},1)`; ctx.fill();
        ctx.restore();
      });

      // Dots
      dots.forEach(d=>{
        d.x=(d.x+d.vx+W)%W; d.y=(d.y+d.vy+H)%H; d.phase+=.02;
        const op=d.op*(0.5+.5*Math.sin(d.phase));
        ctx.save(); ctx.globalAlpha=op;
        ctx.fillStyle="rgba(232,0,13,1)"; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // Corner marks
      ctx.save(); ctx.strokeStyle="rgba(232,0,13,.2)"; ctx.lineWidth=1.5;
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
      position:"fixed", top:0, left:0,
      width:"100%", height:"100%",
      pointerEvents:"none", zIndex:0, display:"block",
    }}/>
  );
}
