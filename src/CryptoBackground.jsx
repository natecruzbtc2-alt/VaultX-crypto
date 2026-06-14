export default function CryptoBackground() {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      pointerEvents: "none",
      zIndex: -1,
      overflow: "hidden",
    }}>
      {/* Top center gold glow */}
      <div style={{
        position: "absolute",
        top: -200, left: "50%",
        transform: "translateX(-50%)",
        width: 800, height: 500,
        background: "radial-gradient(ellipse, rgba(255,200,0,.12) 0%, rgba(255,200,0,.04) 40%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      {/* Bottom left subtle glow */}
      <div style={{
        position: "absolute",
        bottom: -100, left: -100,
        width: 500, height: 500,
        background: "radial-gradient(ellipse, rgba(255,200,0,.05) 0%, transparent 70%)",
      }}/>

      {/* Right side glow */}
      <div style={{
        position: "absolute",
        top: "30%", right: -150,
        width: 400, height: 400,
        background: "radial-gradient(ellipse, rgba(255,200,0,.04) 0%, transparent 70%)",
      }}/>

      {/* Animated grid lines */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.06 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ffc800" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      {/* Floating orbs */}
      {[
        { size:300, top:"10%",  left:"5%",   delay:"0s",   dur:"8s"  },
        { size:200, top:"60%",  left:"80%",  delay:"2s",   dur:"10s" },
        { size:150, top:"40%",  left:"50%",  delay:"4s",   dur:"7s"  },
        { size:250, top:"80%",  left:"20%",  delay:"1s",   dur:"12s" },
        { size:120, top:"20%",  left:"75%",  delay:"3s",   dur:"9s"  },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          top: o.top, left: o.left,
          width: o.size, height: o.size,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(255,200,0,.06) 0%, transparent 70%)`,
          animation: `vxOrb ${o.dur} ease-in-out ${o.delay} infinite alternate`,
          transform: "translate(-50%, -50%)",
        }}/>
      ))}

      <style>{`
        @keyframes vxOrb {
          0%   { transform: translate(-50%,-50%) scale(1);   opacity: .5; }
          50%  { transform: translate(-50%,-60%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(.9);  opacity: .4; }
        }
      `}</style>
    </div>
  );
}
