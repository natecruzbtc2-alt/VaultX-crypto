import { useEffect, useRef } from "react";

const COINS = [
  { sym:"₿", label:"BTC", color:"#F7931A" },
  { sym:"Ξ", label:"ETH", color:"#7B8CDE" },
  { sym:"◎", label:"SOL", color:"#9945FF" },
  { sym:"₿", label:"BTC", color:"#F7931A" },
  { sym:"Ξ", label:"ETH", color:"#627EEA" },
  { sym:"₿", label:"BTC", color:"#ffd633" },
  { sym:"◈", label:"BNB", color:"#F0B90B" },
  { sym:"✦", label:"XRP", color:"#00AAE4" },
  { sym:"₿", label:"BTC", color:"#F7931A" },
  { sym:"◎", label:"SOL", color:"#9945FF" },
  { sym:"Ξ", label:"ETH", color:"#7B8CDE" },
  { sym:"✦", label:"USDT", color:"#26A17B" },
];

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

    // Create particles - more coins, bigger, more visible
    const particles = Array.from({ length: 25 }, (_, i) => {
      const coin = COINS[i % COINS.length];
      const size = 22 + Math.random() * 44;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        size,
        sym: coin.sym,
        label: coin.label,
        color: coin.color,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -0.3 - Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.012,
        opacity: 0.25 + Math.random() * 0.35,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    // Grid lines - more visible
    const lines = Array.from({ length: 8 }, (_, i) => ({
      x: (W / 8) * i + Math.random() * 80,
      y: 0,
      height: 100 + Math.random() * 250,
      speed: 0.6 + Math.random() * 1.8,
      opacity: 0.08 + Math.random() * 0.12,
    }));

    let frame = 0;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient - subtle yellow glow at top
      const grad = ctx.createRadialGradient(W/2, 0, 0, W/2, H/2, Math.max(W,H));
      grad.addColorStop(0,  "rgba(255,200,0,.08)");
      grad.addColorStop(.3, "rgba(255,150,0,.04)");
      grad.addColorStop(1,  "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Falling yellow grid lines
      lines.forEach(l => {
        l.y += l.speed;
        if (l.y > H + l.height) { l.y = -l.height; l.x = Math.random() * W; }
        const lg = ctx.createLinearGradient(l.x, l.y, l.x, l.y + l.height);
        lg.addColorStop(0, "rgba(255,200,0,0)");
        lg.addColorStop(.5, `rgba(255,200,0,${l.opacity})`);
        lg.addColorStop(1, "rgba(255,200,0,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.height);
        ctx.stroke();
      });

      // Floating crypto coins
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.pulse += 0.025;
        const pulseOpacity = p.opacity + Math.sin(p.pulse) * 0.08;

        // Wrap around
        if (p.y < -80) { p.y = H + 40; p.x = Math.random() * W; }
        if (p.x < -80) p.x = W + 40;
        if (p.x > W + 80) p.x = -40;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, pulseOpacity));

        // Outer glow
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 1.4, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.4);
        glow.addColorStop(0, p.color + "30");
        glow.addColorStop(1, p.color + "00");
        ctx.fillStyle = glow;
        ctx.fill();

        // Main coin circle
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        const cg = ctx.createRadialGradient(-p.size*.2, -p.size*.3, 0, 0, 0, p.size);
        cg.addColorStop(0, p.color + "80");
        cg.addColorStop(.6, p.color + "45");
        cg.addColorStop(1, p.color + "20");
        ctx.fillStyle = cg;
        ctx.fill();

        // Coin border - bright and clear
        ctx.strokeStyle = p.color + "cc";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + "60";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Symbol - large and bright
        ctx.fillStyle = p.color + "ff";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.font = `bold ${p.size * 0.85}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.sym, 0, 1);
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      // Glow dots at random positions (constellation)
      if (frame % 3 === 0) {
        const dotCount = 3;
        for (let i = 0; i < dotCount; i++) {
          const x = (Math.sin(frame * 0.01 + i * 2.1) * .4 + .5) * W;
          const y = (Math.cos(frame * 0.007 + i * 1.7) * .4 + .5) * H;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,200,0,.25)";
          ctx.fill();
        }
      }

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
