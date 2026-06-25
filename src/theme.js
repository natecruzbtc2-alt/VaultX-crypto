export const C = {
  bg:"#06040f", bg2:"#0d0920", bg3:"#120e28",
  card:"rgba(120,80,255,.06)", border:"rgba(120,80,255,.15)", border2:"rgba(120,80,255,.08)",
  purple:"#a084ff", purple2:"#7eb8ff", purple3:"#60e8ff",
  gold:"#f0a500", goldLight:"rgba(240,165,0,.1)", goldDark:"#c98a00",
  text:"#ffffff", text2:"rgba(255,255,255,.7)", text3:"rgba(255,255,255,.4)",
  green:"#22c55e", greenBg:"rgba(22,163,74,.1)",
  red:"#ef4444", redBg:"rgba(239,68,68,.1)",
  blue:"#7eb8ff", accent:"#a084ff",
  red3:"#a084ff",
};

export const S = {
  app:  { fontFamily:"'DM Sans',system-ui,sans-serif", background:C.bg, color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:  { background:"rgba(6,4,15,.85)", backdropFilter:"blur(24px)", borderBottom:`1px solid rgba(120,80,255,.12)`, padding:"0 32px", height:66, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:800, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:C.text },
  logoMark: { width:38, height:38, background:`linear-gradient(135deg,#7040e0,#a084ff)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff", boxShadow:`0 0 24px rgba(120,80,255,.5)` },
  ticker: { background:"rgba(10,8,24,.9)", borderBottom:`1px solid rgba(120,80,255,.1)`, padding:"7px 0", overflow:"hidden", whiteSpace:"nowrap" },
  card: { background:`linear-gradient(145deg,rgba(120,80,255,.07),rgba(80,160,255,.03))`, border:`1px solid rgba(120,80,255,.18)`, borderRadius:16, padding:24, boxShadow:`0 4px 30px rgba(0,0,0,.4), inset 0 1px 0 rgba(120,80,255,.1)` },
  scard: { background:`rgba(120,80,255,.05)`, border:`1px solid rgba(120,80,255,.1)`, borderRadius:12, padding:16 },
  sidebar: { width:224, background:"rgba(6,4,15,.9)", borderRight:`1px solid rgba(120,80,255,.1)`, padding:"18px 10px", display:"flex", flexDirection:"column", gap:3, flexShrink:0, backdropFilter:"blur(20px)" },
  sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, cursor:"pointer", fontSize:13, color:act?"#fff":C.text2, background:act?`linear-gradient(135deg,rgba(120,80,255,.3),rgba(80,160,255,.2))`:"transparent", fontWeight:act?700:400, border:"none", borderLeft:act?`2px solid #a084ff`:`2px solid transparent`, width:"100%", textAlign:"left", fontFamily:"inherit", transition:"all .15s", boxShadow:act?"0 2px 12px rgba(120,80,255,.2)":"none" }),
  hd:   { fontSize:22, fontWeight:800, marginBottom:4, color:C.text, letterSpacing:"-.5px" },
  sub:  { fontSize:13, color:C.text3, marginBottom:20 },
  label:{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".07em", marginBottom:6, display:"block", fontWeight:600 },
  inp:  { background:`rgba(255,255,255,.05)`, border:`1.5px solid rgba(120,80,255,.2)`, color:C.text, padding:"11px 14px", borderRadius:12, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"border-color .15s, box-shadow .15s" },
  sel:  { background:`#0d0920`, border:`1.5px solid rgba(120,80,255,.2)`, color:C.text, padding:"11px 14px", borderRadius:12, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  tag:  (c) => ({ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600,
    background: c==="green"?C.greenBg:c==="red"?C.redBg:c==="yellow"?C.goldLight:c==="purple"?`rgba(120,80,255,.15)`:`rgba(255,255,255,.07)`,
    color: c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.gold:c==="purple"?C.purple:C.text2,
    whiteSpace:"nowrap", border:`1px solid ${c==="green"?"rgba(34,197,94,.2)":c==="red"?"rgba(239,68,68,.2)":c==="yellow"?"rgba(240,165,0,.2)":c==="purple"?"rgba(120,80,255,.25)":"transparent"}`,
  }),
  tbl:  { width:"100%", borderCollapse:"collapse" },
  th:   { padding:"10px 16px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".07em", fontWeight:600, borderBottom:`1px solid rgba(120,80,255,.12)`, background:`rgba(120,80,255,.04)`, whiteSpace:"nowrap" },
  td:   { padding:"13px 16px", fontSize:13, borderBottom:`1px solid rgba(120,80,255,.07)`, color:C.text2, verticalAlign:"middle" },
  authBox: { background:`linear-gradient(155deg,#0f0c22,#080514)`, border:`1px solid rgba(120,80,255,.2)`, borderRadius:20, padding:36, width:440, maxWidth:"95vw", boxShadow:`0 20px 80px rgba(0,0,0,.7), 0 0 60px rgba(120,80,255,.08)` },
  modal:   { position:"fixed", inset:0, background:"rgba(0,0,0,.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(12px)" },
  modalBox:{ background:`linear-gradient(155deg,#0f0c22,#080514)`, border:`1px solid rgba(120,80,255,.2)`, borderRadius:20, padding:30, width:460, maxWidth:"95vw", boxShadow:`0 20px 80px rgba(0,0,0,.7)` },
  g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 },
  g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  row:  { display:"flex", alignItems:"center", gap:8 },
  rowsb:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" },
  ldot: { width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", marginRight:5, boxShadow:`0 0 8px ${C.green}` },
};

export const btn = (v="primary") => ({
  cursor:"pointer", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, fontWeight:700, borderRadius:10,
  padding:"10px 20px", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
  background:
    v==="primary" ? `rgba(255,255,255,1)` :
    v==="danger"  ? `linear-gradient(135deg,#991b1b,#ef4444)` :
    v==="success" ? `linear-gradient(135deg,#14532d,#22c55e)` :
    v==="ghost"   ? `rgba(255,255,255,.07)` : `rgba(255,255,255,.07)`,
  color:
    v==="primary" ? "#06040f" :
    v==="ghost"   ? C.text2 : "#fff",
  outline: v==="ghost" ? `1px solid rgba(255,255,255,.2)` : "none",
  boxShadow: v==="primary" ? `0 4px 20px rgba(255,255,255,.15)` : v==="success" ? `0 4px 14px rgba(34,197,94,.25)` : "none",
  transition:"filter .15s, transform .1s",
  minHeight:38, whiteSpace:"nowrap", userSelect:"none",
});

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #06040f; }
  body { overflow-x: hidden; color: #ffffff; }
  select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a084ff' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  option { background: #0d0920 !important; color: #ffffff !important; padding: 8px; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input:focus, select:focus, textarea:focus { border-color: #a084ff !important; box-shadow: 0 0 0 3px rgba(120,80,255,.2) !important; outline: none !important; }
  button:hover { filter: brightness(1.1); }
  button:active { transform: scale(.97); }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #06040f; }
  ::-webkit-scrollbar-thumb { background: rgba(120,80,255,.3); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(120,80,255,.55); }
  tr:hover td { background: rgba(120,80,255,.04) !important; transition: background .1s; }
  @keyframes vxFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .vx-fade-in { animation: vxFadeIn .4s ease forwards; }
  .vx-logo-text { color: #ffffff; font-weight: 800; letter-spacing: -.5px; }
  .vx-nav-mid { flex:1; display:flex; justify-content:center; }
  @media(max-width:768px){
    .vx-sidebar { display:none !important; }
    .vx-dash-body { flex-direction:column !important; }
    .vx-dash-main { padding:16px !important; padding-bottom:72px !important; }
    .vx-ticker { display:none !important; }
    .hide-mobile { display:none !important; }
    .vx-mobile-nav { display:flex !important; }
    .vx-nav { padding: 0 16px !important; }
    .vx-hero-grid { grid-template-columns: 1fr !important; }
    .vx-hex-side { display:none !important; }
  }
  .vx-mobile-nav {
    display:none; position:fixed; bottom:0; left:0; right:0;
    background:rgba(6,4,15,.97); border-top:1px solid rgba(120,80,255,.15);
    padding:8px 4px 14px; z-index:50; justify-content:space-around; align-items:center;
    backdrop-filter:blur(24px);
  }
  .vx-mobile-nav-btn {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:8px; border:none; background:none;
    color:rgba(255,255,255,.3); font-size:10px; font-family:inherit; cursor:pointer; font-weight:500; min-width:52px;
  }
  .vx-mobile-nav-btn.active { color:#a084ff; }
  .vx-mobile-nav-btn .icon { font-size:20px; line-height:1; }
`;
