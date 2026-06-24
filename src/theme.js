export const C = {
  // Light mode base
  bg:"#f8f9fc", bg2:"#ffffff", bg3:"#f1f3f8",
  card:"#ffffff", border:"#e2e6ef", border2:"#edf0f7",
  
  // Brand
  gold:"#f0a500", goldLight:"#fff8e6", goldDark:"#c98a00",
  
  // Text
  text:"#0f1117", text2:"#3d4458", text3:"#8891a8",
  
  // Status
  green:"#16a34a", greenBg:"rgba(22,163,74,.08)",
  red:"#dc2626", redBg:"rgba(220,38,38,.08)",
  blue:"#2563eb", blueBg:"rgba(37,99,235,.08)",
  
  // Legacy aliases
  purple:"#f0a500", purple2:"#e6b400", purple3:"#ffd633", accent:"#f0a500",
  red3:"#f0a500",
};

export const S = {
  app:  { fontFamily:"'DM Sans',system-ui,sans-serif", background:C.bg, color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:  { background:"rgba(255,255,255,.95)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:"0 28px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,.06)" },
  logo: { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:800, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:C.text },
  logoMark: { width:36, height:36, background:`linear-gradient(135deg,#e6a000,#f5c842)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff", boxShadow:`0 4px 12px rgba(240,165,0,.35)` },
  ticker: { background:C.bg3, borderBottom:`1px solid ${C.border}`, padding:"6px 0", overflow:"hidden", whiteSpace:"nowrap" },
  card: { background:C.bg2, border:`1px solid ${C.border}`, borderRadius:14, padding:20, boxShadow:`0 1px 4px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.04)` },
  scard: { background:C.bg3, border:`1px solid ${C.border2}`, borderRadius:10, padding:14 },
  sidebar: { width:220, background:C.bg2, borderRight:`1px solid ${C.border}`, padding:"16px 10px", display:"flex", flexDirection:"column", gap:2, flexShrink:0 },
  sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:8, cursor:"pointer", fontSize:13, color:act?C.goldDark:C.text2, background:act?C.goldLight:"transparent", fontWeight:act?700:500, border:"none", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"all .15s" }),
  hd:   { fontSize:22, fontWeight:800, marginBottom:4, color:C.text, letterSpacing:"-.5px" },
  sub:  { fontSize:13, color:C.text3, marginBottom:20 },
  label:{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".07em", marginBottom:6, display:"block", fontWeight:600 },
  inp:  { background:C.bg2, border:`1.5px solid ${C.border}`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"border-color .15s, box-shadow .15s" },
  sel:  { background:C.bg2, border:`1.5px solid ${C.border}`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  tag:  (c) => ({ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600,
    background: c==="green"?C.greenBg:c==="red"?C.redBg:c==="yellow"?C.goldLight:c==="purple"?C.goldLight:"rgba(0,0,0,.05)",
    color: c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.goldDark:c==="purple"?C.goldDark:C.text3,
    whiteSpace:"nowrap", border: c==="green"?`1px solid rgba(22,163,74,.2)`:c==="red"?`1px solid rgba(220,38,38,.2)`:c==="yellow"?`1px solid rgba(240,165,0,.25)`:`1px solid transparent`,
  }),
  tbl:  { width:"100%", borderCollapse:"collapse" },
  th:   { padding:"10px 16px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".07em", fontWeight:600, borderBottom:`1px solid ${C.border}`, background:C.bg3, whiteSpace:"nowrap" },
  td:   { padding:"12px 16px", fontSize:13, borderBottom:`1px solid ${C.border2}`, color:C.text2, verticalAlign:"middle" },
  authBox: { background:C.bg2, border:`1px solid ${C.border}`, borderRadius:20, padding:36, width:440, maxWidth:"95vw", boxShadow:`0 8px 40px rgba(0,0,0,.1)` },
  modal:   { position:"fixed", inset:0, background:"rgba(15,17,23,.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(8px)" },
  modalBox:{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:18, padding:28, width:460, maxWidth:"95vw", boxShadow:`0 16px 60px rgba(0,0,0,.15)` },
  g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 },
  g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  row:  { display:"flex", alignItems:"center", gap:8 },
  rowsb:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" },
  ldot: { width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", marginRight:5, boxShadow:`0 0 6px ${C.green}` },
};

export const btn = (v="primary") => ({
  cursor:"pointer", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, fontWeight:700, borderRadius:10,
  padding:"10px 20px", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
  background:
    v==="primary" ? `linear-gradient(135deg,#e6a000,#f5c842)` :
    v==="danger"  ? `#dc2626` :
    v==="success" ? `#16a34a` :
    v==="ghost"   ? `transparent` : `transparent`,
  color:
    v==="primary" ? "#fff" :
    v==="ghost"   ? C.text2 : "#fff",
  outline: v==="ghost" ? `1.5px solid ${C.border}` : "none",
  boxShadow:
    v==="primary" ? `0 4px 14px rgba(240,165,0,.35)` :
    v==="success" ? `0 4px 14px rgba(22,163,74,.2)` : "none",
  transition:"filter .15s, transform .1s, box-shadow .15s",
  minHeight:38, whiteSpace:"nowrap", userSelect:"none",
});

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #f8f9fc; }
  body { overflow-x: hidden; color: #0f1117; }
  select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238891a8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  option { background: #ffffff !important; color: #0f1117 !important; padding: 8px; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input:focus, select:focus, textarea:focus { border-color: #f0a500 !important; box-shadow: 0 0 0 3px rgba(240,165,0,.15) !important; outline: none !important; }
  button:hover { filter: brightness(1.06); }
  button:active { transform: scale(.97); }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f1f3f8; }
  ::-webkit-scrollbar-thumb { background: #d0d5e0; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #b0b8cc; }
  tr:hover td { background: #f8f9fc !important; transition: background .1s; }
  .vx-glow { animation: vxGlow 3s ease-in-out infinite alternate; }
  @keyframes vxGlow { from { box-shadow: 0 0 16px rgba(240,165,0,.2); } to { box-shadow: 0 0 32px rgba(240,165,0,.4); } }
  @keyframes vxFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .vx-fade-in { animation: vxFadeIn .35s ease forwards; }
  .vx-logo-text { color: #0f1117; font-weight: 800; }
  .vx-nav-mid { flex:1; display:flex; justify-content:center; }
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
    background:rgba(255,255,255,.97); border-top:1px solid #e2e6ef;
    padding:8px 4px 14px; z-index:50; justify-content:space-around; align-items:center;
  }
  .vx-mobile-nav-btn {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:8px; border:none; background:none;
    color:#8891a8; font-size:10px; font-family:inherit; cursor:pointer; font-weight:500; min-width:52px;
  }
  .vx-mobile-nav-btn.active { color:#f0a500; }
  .vx-mobile-nav-btn .icon { font-size:20px; line-height:1; }
`;
