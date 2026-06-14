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

    // Create particles
    const particles = Array.from({ length: 18 }, (_, i) => {
      const coin = COINS[i % COINS.length];
      const size = 14 + Math.random() * 28;
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        size,
        sym: coin.sym,
        label: coin.label,
        color: coin.color,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -0.2 - Math.random() * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        opacity: 0.05 + Math.random() * 0.12,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    // Create grid lines (matrix-style)
    const lines = Array.from({ length: 6 }, (_, i) => ({
      x: (W / 6) * i + Math.random() * 100,
      y: 0,
      height: 80 + Math.random() * 200,
      speed: 0.5 + Math.random() * 1.5,
      opacity: 0.03 + Math.random() * 0.06,
    }));

    let frame = 0;
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx.createRadialGradient(W/2, 0, 0, W/2, H/2, Math.max(W,H));
      grad.addColorStop(0,  "rgba(255,200,0,.04)");
      grad.addColorStop(.4, "rgba(255,150,0,.015)");
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
        p.pulse += 0.02;
        const pulseOpacity = p.opacity + Math.sin(p.pulse) * 0.04;

        // Wrap around
        if (p.y < -80) { p.y = H + 40; p.x = Math.random() * W; }
        if (p.x < -80) p.x = W + 40;
        if (p.x > W + 80) p.x = -40;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, pulseOpacity));

        // Coin circle
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        const cg = ctx.createRadialGradient(0, -p.size*.3, 0, 0, 0, p.size);
        cg.addColorStop(0, p.color + "40");
        cg.addColorStop(1, p.color + "10");
        ctx.fillStyle = cg;
        ctx.fill();

        // Coin border
        ctx.strokeStyle = p.color + "60";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.78, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + "30";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Symbol
        ctx.fillStyle = p.color + "cc";
        ctx.font = `bold ${p.size * 0.8}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.sym, 0, 1);

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
