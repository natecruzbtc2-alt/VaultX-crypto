export const C = {
  bg:"#060608", bg2:"#0e0e12", bg3:"#16161c",
  card:"rgba(255,200,0,.04)", border:"rgba(255,200,0,.18)", border2:"rgba(255,200,0,.08)",
  purple:"#ffc800", purple2:"#e6b400", purple3:"#ffd633", accent:"#ffaa00",
  text:"#ffffff", text2:"#c8c8d0", text3:"#606070",
  green:"#22c55e", red:"#ef4444", gold:"#ffc800",
  red3:"#ffc800",
};

export const S = {
  app:  { fontFamily:"'DM Sans',system-ui,sans-serif", background:C.bg, color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:  { background:"rgba(6,6,8,.92)", backdropFilter:"blur(32px)", borderBottom:`1px solid rgba(255,200,0,.12)`, padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:800, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:C.text },
  logoMark: { width:38, height:38, background:`linear-gradient(135deg,#c89600,#ffd633)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:900, color:"#000", boxShadow:`0 0 32px rgba(255,200,0,.45), 0 0 8px rgba(255,200,0,.2)` },
  ticker: { background:"rgba(10,10,14,.95)", borderBottom:`1px solid rgba(255,200,0,.08)`, padding:"7px 0", overflow:"hidden", whiteSpace:"nowrap" },
  card: { background:`linear-gradient(145deg,rgba(255,200,0,.055),rgba(255,200,0,.008))`, border:`1px solid rgba(255,200,0,.14)`, borderRadius:18, padding:22, boxShadow:`0 8px 40px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,200,0,.08), 0 0 0 0.5px rgba(255,200,0,.06)` },
  scard: { background:`rgba(255,200,0,.035)`, border:`1px solid rgba(255,200,0,.09)`, borderRadius:14, padding:16 },
  sidebar: { width:224, background:"rgba(6,6,8,.9)", borderRight:`1px solid rgba(255,200,0,.08)`, padding:"18px 10px", display:"flex", flexDirection:"column", gap:3, flexShrink:0, backdropFilter:"blur(20px)" },
  sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:13, color:act?"#000":C.text2, background:act?`linear-gradient(135deg,#ffc800,#ffd633)`:"transparent", fontWeight:act?700:400, border:"none", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"all .15s", boxShadow:act?"0 4px 16px rgba(255,200,0,.3)":"none" }),
  hd:   { fontSize:22, fontWeight:800, marginBottom:4, color:C.text, letterSpacing:"-.5px" },
  sub:  { fontSize:13, color:C.text3, marginBottom:20 },
  label:{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".07em", marginBottom:6, display:"block", fontWeight:600 },
  inp:  { background:`rgba(255,255,255,.04)`, border:`1px solid rgba(255,200,0,.15)`, color:C.text, padding:"11px 14px", borderRadius:12, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"border-color .15s, box-shadow .15s" },
  sel:  { background:`#0e0e12`, border:`1px solid rgba(255,200,0,.15)`, color:C.text, padding:"11px 14px", borderRadius:12, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  tag:  (c) => ({ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600,
    background: c==="green"?"rgba(34,197,94,.12)":c==="red"?"rgba(239,68,68,.12)":c==="yellow"?"rgba(255,200,0,.14)":c==="purple"?"rgba(255,200,0,.14)":"rgba(255,255,255,.06)",
    color: c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.gold:c==="purple"?C.gold:C.text2,
    whiteSpace:"nowrap",
  }),
  tbl:  { width:"100%", borderCollapse:"collapse" },
  th:   { padding:"10px 16px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".07em", fontWeight:600, borderBottom:`1px solid rgba(255,200,0,.08)`, background:`rgba(255,200,0,.025)`, whiteSpace:"nowrap" },
  td:   { padding:"13px 16px", fontSize:13, borderBottom:`1px solid rgba(255,200,0,.06)`, color:C.text2, verticalAlign:"middle" },
  authBox: { background:`linear-gradient(155deg,#121218,#080810)`, border:`1px solid rgba(255,200,0,.18)`, borderRadius:24, padding:38, width:440, maxWidth:"95vw", boxShadow:`0 24px 80px rgba(0,0,0,.8), 0 0 80px rgba(255,200,0,.06)` },
  modal:   { position:"fixed", inset:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(12px)" },
  modalBox:{ background:`linear-gradient(155deg,#141420,#0a0a10)`, border:`1px solid rgba(255,200,0,.18)`, borderRadius:22, padding:32, width:460, maxWidth:"95vw", boxShadow:`0 24px 80px rgba(0,0,0,.8)` },
  g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 },
  g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  row:  { display:"flex", alignItems:"center", gap:8 },
  rowsb:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" },
  ldot: { width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", marginRight:5, boxShadow:`0 0 8px ${C.green}` },
};

export const btn = (v="primary") => ({
  cursor:"pointer", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, fontWeight:700, borderRadius:12,
  padding:"10px 20px", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
  background:
    v==="primary" ? `linear-gradient(135deg,#c89600,#ffd633)` :
    v==="danger"  ? `linear-gradient(135deg,#991b1b,#ef4444)` :
    v==="success" ? `linear-gradient(135deg,#14532d,#22c55e)` :
    v==="ghost"   ? `rgba(255,200,0,.07)` : `rgba(255,200,0,.07)`,
  color: v==="primary" ? "#000" : v==="ghost" ? C.text2 : "#fff",
  outline: v==="ghost" ? `1px solid rgba(255,200,0,.2)` : "none",
  boxShadow:
    v==="primary" ? `0 4px 24px rgba(255,200,0,.35), 0 1px 0 rgba(255,255,255,.1) inset` :
    v==="success" ? `0 4px 16px rgba(34,197,94,.25)` : "none",
  transition:"filter .15s, transform .1s, box-shadow .15s",
  minHeight:38, whiteSpace:"nowrap", userSelect:"none",
});

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #060608; }
  body { overflow-x: hidden; }
  select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23606070' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  option { background: #0e0e12 !important; color: #ffffff !important; padding: 8px; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input:focus, select:focus, textarea:focus { border-color: rgba(255,200,0,.6) !important; box-shadow: 0 0 0 3px rgba(255,200,0,.12) !important; outline: none !important; }
  button:hover { filter: brightness(1.12); }
  button:active { transform: scale(.97); }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #060608; }
  ::-webkit-scrollbar-thumb { background: rgba(255,200,0,.25); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,200,0,.45); }
  tr:hover td { background: rgba(255,200,0,.025) !important; transition: background .1s; }
  .vx-glow { animation: vxGlow 3s ease-in-out infinite alternate; }
  @keyframes vxGlow { from { box-shadow: 0 0 20px rgba(255,200,0,.25); } to { box-shadow: 0 0 50px rgba(255,200,0,.55); } }
  @keyframes vxFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .vx-fade-in { animation: vxFadeIn .4s ease forwards; }
  @media(max-width:768px){
    .vx-sidebar { display:none !important; }
    .vx-dash-body { flex-direction:column !important; }
    .vx-dash-main { padding:16px !important; padding-bottom:72px !important; }
    .vx-ticker { display:none !important; }
    .hide-mobile { display:none !important; }
    .vx-mobile-nav { display:flex !important; }
    .vx-nav { padding: 0 16px !important; }
  }
  .vx-mobile-nav {
    display:none; position:fixed; bottom:0; left:0; right:0;
    background:rgba(6,6,8,.97); border-top:1px solid rgba(255,200,0,.1);
    padding:8px 4px 14px; z-index:50; justify-content:space-around; align-items:center;
    backdrop-filter:blur(24px);
  }
  .vx-mobile-nav-btn {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:8px; border:none; background:none;
    color:#505060; font-size:10px; font-family:inherit; cursor:pointer; font-weight:500; min-width:52px;
  }
  .vx-mobile-nav-btn.active { color:#ffc800; }
  .vx-mobile-nav-btn .icon { font-size:20px; line-height:1; }
  .vx-nav { transition: box-shadow .3s; }
  .vx-logo-text { background: linear-gradient(135deg,#fff,#c8c8d0); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
`;
