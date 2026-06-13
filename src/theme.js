export const C = {
  bg:"#060912", bg2:"#0a1020", bg3:"#0e1628",
  card:"rgba(212,175,110,.035)", border:"rgba(212,175,110,.16)", border2:"rgba(212,175,110,.07)",
  // gold accents
  purple:"#d4af6e", purple2:"#b8923f", purple3:"#e8c987", accent:"#5b8bd4",
  // text
  text:"#f4f1ea", text2:"#a8aec0", text3:"#5e6a82",
  green:"#34d399", red:"#f87171", gold:"#d4af6e",
};

export const S = {
  app:  { fontFamily:"'DM Sans',system-ui,sans-serif", background:`radial-gradient(ellipse 1200px 800px at 50% -200px, #0e1830 0%, #060912 55%)`, color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:  { background:"rgba(6,9,18,.92)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:800, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:C.text },
  logoMark: { width:36, height:36, background:`linear-gradient(135deg,${C.purple2},${C.purple3})`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#0a1020", boxShadow:`0 0 24px rgba(212,175,110,.35)` },
  ticker: { background:"rgba(10,16,32,.85)", borderBottom:`1px solid ${C.border2}`, padding:"7px 0", overflow:"hidden", whiteSpace:"nowrap" },
  card: { background:`linear-gradient(180deg, rgba(212,175,110,.05), rgba(212,175,110,.015))`, border:`1px solid ${C.border}`, borderRadius:16, padding:20, boxShadow:`0 4px 30px rgba(0,0,0,.4), inset 0 1px 0 rgba(212,175,110,.08)` },
  scard: { background:`rgba(212,175,110,.03)`, border:`1px solid ${C.border2}`, borderRadius:12, padding:16 },
  sidebar: { width:220, background:`rgba(10,16,32,.7)`, borderRight:`1px solid ${C.border2}`, padding:"16px 10px", display:"flex", flexDirection:"column", gap:3, flexShrink:0 },
  sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer", fontSize:13, color:act?C.text:C.text2, background:act?`rgba(212,175,110,.12)`:"transparent", fontWeight:act?600:400, border:"none", borderLeft:act?`3px solid ${C.purple}`:"3px solid transparent", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"background .15s,color .15s" }),
  main: { flex:1, padding:"24px 28px", overflowY:"auto" },
  hd:   { fontSize:22, fontWeight:700, marginBottom:4, color:C.text },
  sub:  { fontSize:13, color:C.text3, marginBottom:20 },
  label:{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6, display:"block" },
  inp:  { background:`rgba(255,255,255,.04)`, border:`1px solid rgba(212,175,110,.22)`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"border-color .15s" },
  sel:  { background:`#0a1020`, border:`1px solid rgba(212,175,110,.22)`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  tag:  (c) => ({ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600,
    background: c==="green"?"rgba(52,211,153,.12)":c==="red"?"rgba(248,113,113,.12)":c==="yellow"?"rgba(212,175,110,.14)":c==="purple"?"rgba(212,175,110,.16)":"rgba(255,255,255,.05)",
    color: c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.gold:c==="purple"?C.purple3:C.text2,
    whiteSpace:"nowrap",
  }),
  tbl:  { width:"100%", borderCollapse:"collapse" },
  th:   { padding:"10px 16px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", fontWeight:500, borderBottom:`1px solid ${C.border2}`, background:`rgba(212,175,110,.03)`, whiteSpace:"nowrap" },
  td:   { padding:"13px 16px", fontSize:13, borderBottom:`1px solid ${C.border2}`, color:C.text2, verticalAlign:"middle" },
  authBox: { background:`linear-gradient(180deg, rgba(14,22,40,.98), rgba(10,16,32,.98))`, border:`1px solid ${C.border}`, borderRadius:18, padding:36, width:440, maxWidth:"95vw", boxShadow:`0 20px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(212,175,110,.1)` },
  modal:   { position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(6px)" },
  modalBox:{ background:`linear-gradient(180deg, #0e1628, #0a1020)`, border:`1px solid ${C.border}`, borderRadius:18, padding:30, width:460, maxWidth:"95vw", boxShadow:`0 20px 80px rgba(0,0,0,.6)` },
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
    v==="primary" ? `linear-gradient(135deg,#b8923f,#d4af6e)` :
    v==="danger"  ? `linear-gradient(135deg,#b91c1c,#dc2626)` :
    v==="success" ? `linear-gradient(135deg,#0f7a52,#34d399)` :
    v==="ghost"   ? `rgba(212,175,110,.08)` : `rgba(212,175,110,.08)`,
  color: v==="ghost" ? C.text2 : v==="primary" ? "#0a1020" : "#fff",
  outline: v==="ghost" ? `1px solid rgba(212,175,110,.28)` : "none",
  boxShadow: v==="primary" ? `0 4px 20px rgba(212,175,110,.3)` : v==="success" ? `0 4px 16px rgba(52,211,153,.2)` : "none",
  transition:"filter .15s,transform .1s",
  minHeight:38, whiteSpace:"nowrap", userSelect:"none",
});

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #060912; }
  body { overflow-x: hidden; }
  select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a8aec0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  option { background: #0a1020 !important; color: #f4f1ea !important; padding: 8px; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input:focus, select:focus, textarea:focus { border-color: #d4af6e !important; box-shadow: 0 0 0 3px rgba(212,175,110,.13) !important; outline: none !important; }
  button:hover { filter: brightness(1.1); }
  button:active { transform: scale(.97); }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #060912; }
  ::-webkit-scrollbar-thumb { background: rgba(212,175,110,.3); border-radius: 10px; }
  tr:hover td { background: rgba(212,175,110,.03) !important; transition: background .1s; }
`;
