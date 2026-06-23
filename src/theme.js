export const C = {
  bg:      "#000000",
  bg2:     "#0a0a0a",
  bg3:     "#111111",
  bg4:     "#1a1a1a",
  card:    "rgba(255,255,255,.03)",
  border:  "rgba(255,255,255,.08)",
  border2: "rgba(255,255,255,.04)",
  red:     "#e8000d",
  red2:    "#ff1a24",
  red3:    "#ff4d55",
  redGlow: "rgba(232,0,13,.35)",
  text:    "#ffffff",
  text2:   "#a0a0a0",
  text3:   "#505050",
  green:   "#30d158",
  gold:    "#ffd60a",
  blue:    "#0a84ff",
};

export const S = {
  app:     { fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background:C.bg, color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:     { background:"rgba(0,0,0,.72)", backdropFilter:"blur(24px) saturate(180%)", WebkitBackdropFilter:"blur(24px) saturate(180%)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo:    { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:700, letterSpacing:"-.5px", cursor:"pointer", color:C.text },
  logoMark:{ width:32, height:32, background:"linear-gradient(135deg,#e8000d,#ff4d55)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff", boxShadow:"0 0 20px rgba(232,0,13,.5)" },
  card:    { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:20, padding:24, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" },
  scard:   { background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:14, padding:16 },
  sidebar: { width:240, background:"rgba(0,0,0,.6)", borderRight:"1px solid rgba(255,255,255,.05)", padding:"16px 10px", display:"flex", flexDirection:"column", gap:2, flexShrink:0, backdropFilter:"blur(20px)" },
  sitem:   (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:13, color:act?"#fff":C.text2, background:act?"rgba(232,0,13,.15)":"transparent", fontWeight:act?600:400, border:"none", borderLeft:act?"2px solid #e8000d":"2px solid transparent", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"all .12s" }),
  hd:      { fontSize:22, fontWeight:700, marginBottom:4, color:C.text, letterSpacing:"-.3px" },
  sub:     { fontSize:13, color:C.text3, marginBottom:20 },
  label:   { fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6, display:"block", fontWeight:500 },
  inp:     { background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", color:C.text, padding:"11px 14px", borderRadius:12, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"all .15s" },
  sel:     { background:"#111", border:"1px solid rgba(255,255,255,.08)", color:C.text, padding:"11px 14px", borderRadius:12, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", cursor:"pointer", WebkitAppearance:"none" },
  tag:     (c) => ({ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:"nowrap",
    background: c==="green"?"rgba(48,209,88,.12)":c==="red"?"rgba(232,0,13,.12)":c==="yellow"?"rgba(255,214,10,.12)":c==="purple"?"rgba(10,132,255,.12)":"rgba(255,255,255,.06)",
    color:       c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.gold:c==="purple"?C.blue:C.text2,
  }),
  tbl:     { width:"100%", borderCollapse:"collapse" },
  th:      { padding:"10px 16px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", fontWeight:500, borderBottom:"1px solid rgba(255,255,255,.05)", whiteSpace:"nowrap" },
  td:      { padding:"13px 16px", fontSize:13, borderBottom:"1px solid rgba(255,255,255,.04)", color:C.text2, verticalAlign:"middle" },
  modal:   { position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(12px)" },
  modalBox:{ background:"#111", border:"1px solid rgba(255,255,255,.08)", borderRadius:24, padding:32, width:"min(480px,96vw)", boxShadow:"0 32px 80px rgba(0,0,0,.8)" },
  g2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  g3:      { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 },
  g4:      { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  row:     { display:"flex", alignItems:"center", gap:8 },
  rowsb:   { display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" },
  ldot:    { width:6, height:6, borderRadius:"50%", background:C.green, display:"inline-block", marginRight:6, boxShadow:"0 0 8px "+C.green },
};

export const btn = (v="primary") => ({
  cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, borderRadius:12,
  padding:"11px 22px", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
  transition:"all .15s", minHeight:40, whiteSpace:"nowrap", userSelect:"none", letterSpacing:"-.1px",
  background:
    v==="primary" ? "linear-gradient(135deg,#e8000d,#ff4d55)" :
    v==="danger"  ? "rgba(232,0,13,.15)" :
    v==="success" ? "linear-gradient(135deg,#248a3d,#30d158)" :
    v==="ghost"   ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.06)",
  color:
    v==="primary" ? "#fff" :
    v==="danger"  ? C.red :
    v==="success" ? "#fff" : C.text2,
  border: v==="danger" ? "1px solid rgba(232,0,13,.3)" : v==="ghost" ? "1px solid rgba(255,255,255,.08)" : "none",
  boxShadow: v==="primary" ? "0 4px 24px rgba(232,0,13,.35)" : v==="success" ? "0 4px 16px rgba(48,209,88,.2)" : "none",
});

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #000; }
  body { overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  body * { font-family: 'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important; }
  select { appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23505050' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  option { background: #111 !important; color: #fff !important; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input:focus, select:focus, textarea:focus { border-color: #e8000d !important; box-shadow: 0 0 0 3px rgba(232,0,13,.15) !important; outline: none !important; }
  button:hover { filter: brightness(1.08); }
  button:active { transform: scale(.97); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
  tr:hover td { background: rgba(255,255,255,.02) !important; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  .vx-fade { animation: fadeUp .4s ease; }

  /* ── MOBILE ── */
  @media(max-width:768px){
    .vx-sidebar { display:none !important; }
    .vx-dash-body { flex-direction:column !important; }
    .vx-dash-main { padding:16px !important; padding-bottom:72px !important; }
    .vx-ticker { display:none !important; }
    .hide-mobile { display:none !important; }
    .vx-mobile-nav { display:flex !important; }
  }
  @media(max-width:480px){
    .vx-g4,.vx-g3 { grid-template-columns:1fr 1fr !important; }
  }
  .vx-mobile-nav {
    display:none; position:fixed; bottom:0; left:0; right:0;
    background:rgba(0,0,0,.92); border-top:1px solid rgba(255,255,255,.06);
    padding:8px 4px 12px; z-index:50; justify-content:space-around; align-items:center;
    backdrop-filter:blur(24px);
  }
  .vx-mobile-nav-btn {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:8px; border:none; background:none;
    color:#505050; font-size:10px; font-family:inherit; cursor:pointer; font-weight:500; min-width:52px;
  }
  .vx-mobile-nav-btn.active { color:#e8000d; }
  .vx-mobile-nav-btn .icon { font-size:20px; line-height:1; }
`;
