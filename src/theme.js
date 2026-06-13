export const C = {
  bg:"#141d33", bg2:"#1a2440", bg3:"#212d4d",
  card:"rgba(212,175,110,.05)", border:"rgba(212,175,110,.2)", border2:"rgba(255,255,255,.07)",
  // gold accents
  purple:"#e0b873", purple2:"#c99d4f", purple3:"#f0d093", accent:"#6b9be0",
  // text
  text:"#f7f5ef", text2:"#b8bed0", text3:"#7e87a0",
  green:"#3ddc97", red:"#fb7185", gold:"#e0b873",
};

export const S = {
  app:  { fontFamily:"'DM Sans',system-ui,sans-serif", background:`radial-gradient(ellipse 1400px 900px at 50% -150px, #243355 0%, #1a2440 45%, #141d33 100%)`, color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:  { background:"rgba(20,29,51,.88)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:800, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:C.text },
  logoMark: { width:36, height:36, background:`linear-gradient(135deg,${C.purple2},${C.purple3})`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#1a2440", boxShadow:`0 0 24px rgba(224,184,115,.4)` },
  ticker: { background:"rgba(26,36,64,.8)", borderBottom:`1px solid ${C.border2}`, padding:"7px 0", overflow:"hidden", whiteSpace:"nowrap" },
  card: { background:`linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.02))`, border:`1px solid ${C.border2}`, borderRadius:16, padding:20, boxShadow:`0 4px 24px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.06)` },
  scard: { background:`rgba(255,255,255,.035)`, border:`1px solid ${C.border2}`, borderRadius:12, padding:16 },
  sidebar: { width:220, background:`rgba(26,36,64,.6)`, borderRight:`1px solid ${C.border2}`, padding:"16px 10px", display:"flex", flexDirection:"column", gap:3, flexShrink:0 },
  sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer", fontSize:13, color:act?C.text:C.text2, background:act?`rgba(224,184,115,.14)`:"transparent", fontWeight:act?600:400, border:"none", borderLeft:act?`3px solid ${C.purple}`:"3px solid transparent", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"background .15s,color .15s" }),
  main: { flex:1, padding:"24px 28px", overflowY:"auto" },
  hd:   { fontSize:22, fontWeight:700, marginBottom:4, color:C.text },
  sub:  { fontSize:13, color:C.text3, marginBottom:20 },
  label:{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6, display:"block" },
  inp:  { background:`rgba(255,255,255,.06)`, border:`1px solid rgba(255,255,255,.14)`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"border-color .15s" },
  sel:  { background:`#1a2440`, border:`1px solid rgba(255,255,255,.14)`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  tag:  (c) => ({ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600,
    background: c==="green"?"rgba(61,220,151,.14)":c==="red"?"rgba(251,113,133,.14)":c==="yellow"?"rgba(224,184,115,.16)":c==="purple"?"rgba(224,184,115,.16)":"rgba(255,255,255,.06)",
    color: c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.gold:c==="purple"?C.purple3:C.text2,
    whiteSpace:"nowrap",
  }),
  tbl:  { width:"100%", borderCollapse:"collapse" },
  th:   { padding:"10px 16px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", fontWeight:500, borderBottom:`1px solid ${C.border2}`, background:`rgba(255,255,255,.025)`, whiteSpace:"nowrap" },
  td:   { padding:"13px 16px", fontSize:13, borderBottom:`1px solid ${C.border2}`, color:C.text2, verticalAlign:"middle" },
  authBox: { background:`linear-gradient(180deg, rgba(36,51,85,.95), rgba(26,36,64,.95))`, border:`1px solid ${C.border}`, borderRadius:18, padding:36, width:440, maxWidth:"95vw", boxShadow:`0 20px 70px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)` },
  modal:   { position:"fixed", inset:0, background:"rgba(10,15,30,.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(6px)" },
  modalBox:{ background:`linear-gradient(180deg, #243355, #1a2440)`, border:`1px solid ${C.border}`, borderRadius:18, padding:30, width:460, maxWidth:"95vw", boxShadow:`0 20px 70px rgba(0,0,0,.5)` },
  g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 },
  g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  row:  { display:"flex", alignItems:"center", gap:8 },
  rowsb:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" },
  ldot: { width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", marginRight:5, boxShadow:`0 0 6px ${C.green}` },
};

export const btn = (v="primary") => ({
  cursor:"pointer", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, fontWeight:600, borderRadius:10,
  padding:"10px 20px", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
  background:
    v==="primary" ? `linear-gradient(135deg,#c99d4f,#e0b873)` :
    v==="danger"  ? `linear-gradient(135deg,#dc2626,#ef4444)` :
    v==="success" ? `linear-gradient(135deg,#119a68,#3ddc97)` :
    v==="ghost"   ? `rgba(255,255,255,.07)` : `rgba(255,255,255,.07)`,
  color: v==="ghost" ? C.text : v==="primary" ? "#1a2440" : "#fff",
  outline: v==="ghost" ? `1px solid rgba(255,255,255,.18)` : "none",
  boxShadow: v==="primary" ? `0 4px 20px rgba(224,184,115,.35)` : v==="success" ? `0 4px 16px rgba(61,220,151,.25)` : "none",
  transition:"filter .15s,transform .1s",
  minHeight:38, whiteSpace:"nowrap", userSelect:"none",
});

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #141d33; }
  body { overflow-x: hidden; }
  select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23b8bed0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  option { background: #1a2440 !important; color: #f7f5ef !important; padding: 8px; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input:focus, select:focus, textarea:focus { border-color: #e0b873 !important; box-shadow: 0 0 0 3px rgba(224,184,115,.15) !important; outline: none !important; }
  button:hover { filter: brightness(1.08); }
  button:active { transform: scale(.97); }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #141d33; }
  ::-webkit-scrollbar-thumb { background: rgba(224,184,115,.3); border-radius: 10px; }
  tr:hover td { background: rgba(255,255,255,.03) !important; transition: background .1s; }
`;
