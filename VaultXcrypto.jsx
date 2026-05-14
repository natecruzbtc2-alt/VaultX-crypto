'use client';
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const COINS = [
  { sym: "BTC", name: "Bitcoin",  color: "#F7931A", bg: "#2a1f0a" },
  { sym: "ETH", name: "Ethereum", color: "#627EEA", bg: "#0e1428" },
  { sym: "SOL", name: "Solana",   color: "#9945FF", bg: "#160a2a" },
  { sym: "BNB", name: "BNB",      color: "#F0B90B", bg: "#291e04" },
  { sym: "XRP", name: "XRP",      color: "#00AAE4", bg: "#041a25" },
  { sym: "ADA", name: "Cardano",  color: "#0033AD", bg: "#04092a" },
  { sym: "DOGE","name":"Dogecoin",color: "#C2A633", bg: "#20190a" },
  { sym: "MATIC",name:"Polygon", color: "#8247E5", bg: "#120a20" },
];

const BASE_PRICES = {
  BTC: 67842, ETH: 3521, SOL: 172, BNB: 598,
  XRP: 0.62, ADA: 0.48, DOGE: 0.14, MATIC: 0.88
};

const ADMIN_USER = { username: "admin", password: "admin123" };

function genSparkline(base, n = 20) {
  const pts = [base];
  for (let i = 1; i < n; i++) {
    pts.push(pts[i-1] * (1 + (Math.random() - 0.495) * 0.03));
  }
  return pts;
}

function genHistory(n = 30) {
  const types = ["Buy","Sell","Deposit","Withdrawal","Stake","Unstake"];
  const syms  = ["BTC","ETH","SOL","BNB"];
  const statuses = ["Completed","Completed","Completed","Pending","Failed"];
  return Array.from({length:n}, (_,i) => ({
    id: `TX${String(100+i).padStart(6,"0")}`,
    type: types[i % types.length],
    symbol: syms[i % 4],
    amount: +(Math.random()*2+0.01).toFixed(4),
    value:  +(Math.random()*8000+50).toFixed(2),
    fee:    +(Math.random()*12+0.5).toFixed(2),
    status: statuses[i % statuses.length],
    date: new Date(Date.now() - i * 86400000 * 1.3).toLocaleDateString(),
  }));
}

function genUsers(n = 12) {
  const names = ["Alice Kovacs","Bob Tanaka","Clara Osei","Dave Müller","Emma Petit","Frank Lima",
    "Grace Yip","Hana Sato","Ivan Sokov","Julia Mao","Kevin Park","Lisa Torres"];
  return names.slice(0,n).map((name,i) => ({
    id: `U${String(i+1).padStart(4,"0")}`,
    name, email: name.toLowerCase().replace(/ /g,".")+`@email.com`,
    balance: +(Math.random()*50000+1000).toFixed(2),
    portfolio: +(Math.random()*40000+500).toFixed(2),
    joined: new Date(Date.now() - (i*30+10)*86400000).toLocaleDateString(),
    verified: i % 3 !== 2,
    status: i % 5 === 4 ? "Suspended" : "Active",
    tier: ["Basic","Pro","Elite"][i%3],
  }));
}

function genPendingTx() {
  const types = ["Withdrawal","Deposit"];
  const coins  = ["BTC","ETH","USDT","SOL","BNB"];
  return Array.from({length:8}, (_,i) => ({
    id: `PX${String(200+i).padStart(6,"0")}`,
    user: ["alice.kovacs@email.com","bob.tanaka@email.com","clara.osei@email.com","dave.müller@email.com"][i%4],
    type: types[i%2],
    coin: coins[i%5],
    amount: +(Math.random()*5+0.01).toFixed(4),
    usd: +(Math.random()*15000+100).toFixed(2),
    fee: +(Math.random()*20+1).toFixed(2),
    submitted: new Date(Date.now() - i*3600000*2).toLocaleString(),
    network: ["ERC-20","BEP-20","TRC-20","Native"][i%4],
  }));
}

// ─── SPARKLINE SVG ────────────────────────────────────────────────────────────
function Spark({ data, color, w=80, h=28 }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data);
  const range = mx - mn || 1;
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*w;
    const y = h - ((v-mn)/range)*h;
    return `${x},${y}`;
  }).join(" ");
  const first = data[0], last = data[data.length-1];
  const upColor = color || (last >= first ? "#22c55e" : "#ef4444");
  return (
    <svg width={w} height={h} style={{display:"block",overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={upColor} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── MINI CHART (canvas) ─────────────────────────────────────────────────────
function MiniChart({ prices, color }) {
  const ref = useRef();
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    if (!prices || prices.length < 2) return;
    const mn = Math.min(...prices), mx = Math.max(...prices);
    const range = mx - mn || 1;
    ctx.beginPath();
    prices.forEach((p,i) => {
      const x = (i/(prices.length-1))*w;
      const y = h-2 - ((p-mn)/range)*(h-4);
      i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
    // fill
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = color + "22";
    ctx.fill();
  }, [prices, color]);
  return <canvas ref={ref} width={200} height={60} style={{width:"100%",height:60}}/>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function VaultXCrypto() {
  // state
  const [view, setView]       = useState("landing");   // landing|login|register|dashboard|admin
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashTab, setDashTab] = useState("overview");
  const [adminTab, setAdminTab] = useState("users");
  const [prices, setPrices]   = useState(() =>
    Object.fromEntries(COINS.map(c => [c.sym, { price: BASE_PRICES[c.sym], change: +(Math.random()*10-5).toFixed(2), spark: genSparkline(BASE_PRICES[c.sym]) }]))
  );
  const [users]    = useState(genUsers);
  const [history]  = useState(genHistory);
  const [pending]  = useState(genPendingTx);
  const [toast, setToast]     = useState(null);
  const [modal, setModal]     = useState(null);
  const [loginForm, setLoginForm] = useState({ email:"", password:"", admin:"", adminPw:"", adminMode:false });
  const [regForm, setRegForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [sendForm, setSendForm] = useState({ coin:"BTC", amount:"", address:"" });
  const [tradeForm, setTradeForm] = useState({ coin:"BTC", side:"buy", amount:"" });
  const [alertMsg, setAlertMsg] = useState({ text:"", type:"" });
  const tickerRef = useRef();

  const toast$ = useCallback((msg, type="info") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  },[]);

  // simulate live prices
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = {...prev};
        COINS.forEach(c => {
          const old = next[c.sym];
          const newPrice = old.price * (1 + (Math.random()-0.495)*0.004);
          const spark = [...old.spark.slice(1), newPrice];
          next[c.sym] = { price: newPrice, change: old.change + (Math.random()-0.495)*0.1, spark };
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // ticker scroll
  useEffect(() => {
    if (!tickerRef.current) return;
    let x = 0;
    const id = setInterval(() => {
      x -= 1;
      if (tickerRef.current) tickerRef.current.style.transform = `translateX(${x}px)`;
      if (Math.abs(x) > tickerRef.current?.scrollWidth / 2) x = 0;
    }, 30);
    return () => clearInterval(id);
  }, [view]);

  const showAlert = (text, type="error") => { setAlertMsg({text,type}); setTimeout(()=>setAlertMsg({text:"",type:""}),4000); };

  const doLogin = () => {
    if (!loginForm.email || !loginForm.password) { showAlert("Fill in all fields"); return; }
    const u = users.find(u => u.email === loginForm.email);
    if (!u) { showAlert("User not found"); return; }
    setUser(u); setView("dashboard"); setDashTab("overview"); toast$("Welcome back, "+u.name.split(" ")[0]+"!", "success");
  };
  const doAdminLogin = () => {
    if (loginForm.admin !== ADMIN_USER.username || loginForm.adminPw !== ADMIN_USER.password) { showAlert("Invalid admin credentials"); return; }
    setIsAdmin(true); setView("admin"); setAdminTab("users"); toast$("Admin panel loaded", "success");
  };
  const doRegister = () => {
    const {name,email,password,confirm} = regForm;
    if (!name||!email||!password||!confirm) { showAlert("All fields required"); return; }
    if (password !== confirm) { showAlert("Passwords don't match"); return; }
    toast$("Account created! Please sign in.", "success"); setView("login");
  };
  const doLogout = () => { setUser(null); setIsAdmin(false); setView("landing"); toast$("Signed out"); };

  const fmt = (n, d=2) => typeof n === "number" ? n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : n;
  const fmtP = (v) => { const c = v>=0 ? "#22c55e":"#ef4444"; return <span style={{color:c}}>{v>=0?"+":""}{fmt(v)}%</span>; };

  const totalPortfolioValue = COINS.slice(0,4).reduce((a,c,i) => a + (prices[c.sym]?.price||0)*(0.05/(i+1)), 0);
  const totalFees = pending.reduce((a,b) => a+b.fee, 0);
  const pendingWithdrawals = pending.filter(p => p.type === "Withdrawal");
  const pendingDeposits    = pending.filter(p => p.type === "Deposit");

  // ── STYLES ──────────────────────────────────────────────────────────────────
  const S = {
    app: { fontFamily:"'DM Sans',system-ui,sans-serif", background:"#0a0d14", color:"#e2e8f0", minHeight:"100vh", fontSize:14, lineHeight:1.5 },
    nav: { background:"rgba(10,13,20,.95)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.06)", padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
    logo: { display:"flex", alignItems:"center", gap:10, fontSize:18, fontWeight:700, letterSpacing:"-.5px", cursor:"pointer" },
    logoMark: { width:32, height:32, background:"linear-gradient(135deg,#6366f1,#06b6d4)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" },
    ticker: { background:"#080b11", borderBottom:"1px solid rgba(255,255,255,.05)", padding:"6px 0", overflow:"hidden", whiteSpace:"nowrap" },
    btn: (v="primary") => ({
      cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, borderRadius:8,
      padding:"8px 18px", border:"none", display:"inline-flex", alignItems:"center", gap:6,
      background: v==="primary"?"linear-gradient(135deg,#6366f1,#06b6d4)" : v==="danger"?"#dc2626" : v==="success"?"#16a34a" : "rgba(255,255,255,.07)",
      color:"#fff", transition:"opacity .15s",
    }),
    card: { background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:20 },
    scard: { background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, padding:14 },
    sidebar: { width:210, background:"rgba(255,255,255,.02)", borderRight:"1px solid rgba(255,255,255,.06)", padding:"14px 10px", display:"flex", flexDirection:"column", gap:2, flexShrink:0 },
    sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:9, cursor:"pointer", fontSize:13, color: act?"#e2e8f0":"#64748b", background: act?"rgba(99,102,241,.15)":"transparent", fontWeight: act?600:400, border:"none", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"all .15s" }),
    main: { flex:1, padding:"22px 24px", overflowY:"auto" },
    hd: { fontSize:22, fontWeight:700, marginBottom:4, color:"#f1f5f9" },
    sub: { fontSize:13, color:"#64748b", marginBottom:20 },
    label: { fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5, display:"block" },
    inp: { background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"#e2e8f0", padding:"9px 13px", borderRadius:9, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none" },
    tag: (c) => ({ display:"inline-flex", alignItems:"center", padding:"2px 9px", borderRadius:5, fontSize:11, fontWeight:600, background: c==="green"?"rgba(34,197,94,.15)" : c==="red"?"rgba(239,68,68,.15)" : c==="yellow"?"rgba(234,179,8,.15)" : c==="blue"?"rgba(99,102,241,.15)" : "rgba(255,255,255,.08)", color: c==="green"?"#4ade80" : c==="red"?"#f87171" : c==="yellow"?"#fbbf24" : c==="blue"?"#818cf8" : "#94a3b8" }),
    tbl: { width:"100%", borderCollapse:"collapse" },
    th: { padding:"9px 14px", textAlign:"left", fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:".05em", fontWeight:500, borderBottom:"1px solid rgba(255,255,255,.06)", background:"rgba(255,255,255,.02)" },
    td: { padding:"11px 14px", fontSize:13, borderBottom:"1px solid rgba(255,255,255,.04)", color:"#cbd5e1" },
    authBox: { background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.09)", borderRadius:16, padding:32, width:400, maxWidth:"95vw" },
    modal: { position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 },
    modalBox: { background:"#111827", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:28, width:420, maxWidth:"95vw" },
    g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
    g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 },
    g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
    row: { display:"flex", alignItems:"center", gap:8 },
    rowsb: { display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 },
    ldot: { width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block", marginRight:5 },
    divider: { borderTop:"1px solid rgba(255,255,255,.07)", margin:"14px 0" },
  };

  // ── LANDING ──────────────────────────────────────────────────────────────────
  const Landing = () => (
    <div style={{...S.app}}>
      <nav style={S.nav}>
        <div style={S.logo}><div style={S.logoMark}>VX</div>VaultXcrypto</div>
        <div style={S.row}>
          <button style={S.btn("ghost")} onClick={()=>setView("login")}>Sign In</button>
          <button style={S.btn()} onClick={()=>setView("register")}>Get Started</button>
        </div>
      </nav>
      <TickerBar/>
      {/* Hero */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px 40px"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.25)",borderRadius:20,padding:"4px 14px",fontSize:12,color:"#818cf8",marginBottom:20}}>
            <span style={S.ldot}/> Live market data · Real-time trading
          </div>
          <h1 style={{fontSize:54,fontWeight:800,letterSpacing:"-2px",lineHeight:1.1,color:"#f1f5f9",marginBottom:16}}>
            The smartest way<br/>to trade <span style={{background:"linear-gradient(135deg,#6366f1,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>crypto.</span>
          </h1>
          <p style={{color:"#64748b",fontSize:16,maxWidth:480,margin:"0 auto 28px"}}>Real-time prices, portfolio analytics, staking rewards and instant transfers — all in one secure wallet platform.</p>
          <div style={{display:"flex",justifyContent:"center",gap:12}}>
            <button style={{...S.btn(),padding:"12px 30px",fontSize:15}} onClick={()=>setView("register")}>Start Trading Free</button>
            <button style={{...S.btn("ghost"),padding:"12px 30px",fontSize:15}} onClick={()=>setView("login")}>Sign In</button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{...S.card,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,marginBottom:36,padding:0,overflow:"hidden"}}>
          {[["$2.4T","Total Market Cap"],["$94B","24h Volume"],["23,400+","Active Users"],["0.05%","Avg Trading Fee"]].map(([v,l],i)=>(
            <div key={i} style={{padding:"18px 24px",borderRight: i<3?"1px solid rgba(255,255,255,.06)":"none"}}>
              <div style={{fontSize:24,fontWeight:700,color:"#f1f5f9"}}>{v}</div>
              <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Coin cards */}
        <div style={{...S.g4,marginBottom:36}}>
          {COINS.slice(0,4).map(coin=>{
            const p = prices[coin.sym];
            const up = p.change >= 0;
            return (
              <div key={coin.sym} style={{...S.card,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at top right,${coin.color}08,transparent)`,pointerEvents:"none"}}/>
                <div style={S.rowsb}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:"#e2e8f0"}}>{coin.sym}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>{coin.name}</div>
                    </div>
                  </div>
                  <span style={S.tag(up?"green":"red")}>{up?"+":""}{fmt(p.change)}%</span>
                </div>
                <div style={{marginTop:14}}>
                  <div style={{fontSize:20,fontWeight:700,color:"#f1f5f9"}}>${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}</div>
                  <div style={{marginTop:8}}><Spark data={p.spark} color={up?"#22c55e":"#ef4444"}/></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Market table */}
        <div style={S.card}>
          <div style={{...S.rowsb,marginBottom:16}}>
            <span style={{fontSize:16,fontWeight:600,color:"#f1f5f9"}}>Live Market</span>
            <span style={{fontSize:11,color:"#64748b"}}><span style={S.ldot}/>Auto-refresh 2.5s</span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={S.tbl}>
              <thead><tr>
                {["#","Asset","Price","24h Change","Market Cap","Volume","Sparkline",""].map((h,i)=><th key={i} style={S.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {COINS.map((coin,i)=>{
                  const p = prices[coin.sym];
                  const up = p.change >= 0;
                  return (
                    <tr key={coin.sym} style={{cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={S.td}><span style={{color:"#64748b"}}>{i+1}</span></td>
                      <td style={S.td}><div style={S.row}><div style={{width:28,height:28,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><div><div style={{fontWeight:600,color:"#e2e8f0"}}>{coin.sym}</div><div style={{fontSize:11,color:"#64748b"}}>{coin.name}</div></div></div></td>
                      <td style={{...S.td,fontWeight:600,color:"#f1f5f9",fontFamily:"monospace"}}>${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}</td>
                      <td style={S.td}>{fmtP(p.change)}</td>
                      <td style={S.td}>${fmt(p.price * 19000000 / 1e9, 1)}B</td>
                      <td style={S.td}>${fmt(p.price * 210000 / 1e6, 1)}M</td>
                      <td style={S.td}><Spark data={p.spark} color={up?"#22c55e":"#ef4444"} w={80} h={28}/></td>
                      <td style={S.td}><button style={{...S.btn(),padding:"5px 14px",fontSize:12}} onClick={()=>setView("register")}>Trade</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature grid */}
        <div style={{...S.g3,marginTop:36}}>
          {[
            {icon:"🔐",title:"Bank-Grade Security",desc:"Multi-sig wallets, cold storage, 2FA and insurance backed vaults."},
            {icon:"⚡",title:"Instant Settlements",desc:"Sub-second trades with deep liquidity across 200+ pairs."},
            {icon:"📈",title:"Staking & Yield",desc:"Earn up to 18% APY staking your idle crypto assets."},
            {icon:"💸",title:"Low Fees",desc:"Industry-lowest trading fees starting at 0.05% per trade."},
            {icon:"📊",title:"Advanced Analytics",desc:"Real-time charts, portfolio tracking and profit/loss reports."},
            {icon:"🌍",title:"Global Transfers",desc:"Send crypto anywhere in seconds with minimal network fees."},
          ].map((f,i)=>(
            <div key={i} style={{...S.scard}}>
              <div style={{fontSize:28,marginBottom:10}}>{f.icon}</div>
              <div style={{fontWeight:600,color:"#e2e8f0",marginBottom:6}}>{f.title}</div>
              <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── TICKER ────────────────────────────────────────────────────────────────────
  const TickerBar = () => (
    <div style={S.ticker}>
      <div ref={tickerRef} style={{display:"inline-flex",gap:0,willChange:"transform"}}>
        {[...COINS,...COINS,...COINS].map((c,i)=>{
          const p = prices[c.sym];
          const up = p?.change >= 0;
          return (
            <span key={i} style={{padding:"0 24px",fontSize:12,fontFamily:"monospace",color: up?"#4ade80":"#f87171"}}>
              {c.sym}/USD &nbsp; ${p?.price < 1 ? p?.price.toFixed(4) : fmt(p?.price)} &nbsp;
              <span style={{opacity:.7}}>{up?"+":""}{fmt(p?.change)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );

  // ── AUTH ──────────────────────────────────────────────────────────────────────
  const AuthPage = ({ mode }) => (
    <div style={{...S.app}}>
      <nav style={S.nav}>
        <div style={S.logo} onClick={()=>setView("landing")}><div style={S.logoMark}>VX</div>VaultXcrypto</div>
      </nav>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 58px)",padding:24}}>
        <div style={S.authBox}>
          {mode==="login" ? (
            !loginForm.adminMode ? (
              <>
                <div style={{fontSize:22,fontWeight:700,marginBottom:4,color:"#f1f5f9"}}>Welcome back</div>
                <div style={{fontSize:13,color:"#64748b",marginBottom:22}}>Sign in to your account</div>
                {alertMsg.text && <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"#f87171",marginBottom:12}}>{alertMsg.text}</div>}
                <div style={{marginBottom:12}}><label style={S.label}>Email</label><input style={S.inp} placeholder="you@email.com" value={loginForm.email} onChange={e=>setLoginForm(f=>({...f,email:e.target.value}))}/></div>
                <div style={{marginBottom:16}}><label style={S.label}>Password</label><input style={S.inp} type="password" placeholder="••••••••" value={loginForm.password} onChange={e=>setLoginForm(f=>({...f,password:e.target.value}))}/></div>
                <button style={{...S.btn(),width:"100%",padding:"11px",justifyContent:"center"}} onClick={doLogin}>Sign In →</button>
                <div style={{textAlign:"center",fontSize:12,color:"#64748b",marginTop:14}}>
                  No account? <span style={{color:"#818cf8",cursor:"pointer"}} onClick={()=>setView("register")}>Create one</span>
                </div>
                <div style={{textAlign:"center",marginTop:10}}><span style={{fontSize:11,color:"#334155",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setLoginForm(f=>({...f,adminMode:true}))}>Admin access</span></div>
              </>
            ) : (
              <>
                <div style={{fontSize:22,fontWeight:700,marginBottom:4,color:"#f1f5f9"}}>Admin Access</div>
                <div style={{fontSize:13,color:"#64748b",marginBottom:22}}>Enter admin credentials</div>
                {alertMsg.text && <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"#f87171",marginBottom:12}}>{alertMsg.text}</div>}
                <div style={{marginBottom:12}}><label style={S.label}>Username</label><input style={S.inp} placeholder="admin" value={loginForm.admin} onChange={e=>setLoginForm(f=>({...f,admin:e.target.value}))}/></div>
                <div style={{marginBottom:16}}><label style={S.label}>Password</label><input style={S.inp} type="password" placeholder="••••••••" value={loginForm.adminPw} onChange={e=>setLoginForm(f=>({...f,adminPw:e.target.value}))}/></div>
                <button style={{...S.btn(),width:"100%",padding:"11px",justifyContent:"center"}} onClick={doAdminLogin}>Admin Sign In →</button>
                <div style={{textAlign:"center",marginTop:12}}><span style={{fontSize:11,color:"#334155",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setLoginForm(f=>({...f,adminMode:false}))}>← Back to user login</span></div>
              </>
            )
          ) : (
            <>
              <div style={{fontSize:22,fontWeight:700,marginBottom:4,color:"#f1f5f9"}}>Create account</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:22}}>Join VaultXcrypto platform</div>
              {alertMsg.text && <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"#f87171",marginBottom:12}}>{alertMsg.text}</div>}
              {[["Full name","text","John Smith","name"],["Email","email","you@email.com","email"],["Password","password","Min 6 chars","password"],["Confirm password","password","Repeat password","confirm"]].map(([lbl,type,ph,key])=>(
                <div key={key} style={{marginBottom:12}}><label style={S.label}>{lbl}</label><input style={S.inp} type={type} placeholder={ph} value={regForm[key]} onChange={e=>setRegForm(f=>({...f,[key]:e.target.value}))}/></div>
              ))}
              <button style={{...S.btn(),width:"100%",padding:"11px",justifyContent:"center"}} onClick={doRegister}>Create Account →</button>
              <div style={{textAlign:"center",fontSize:12,color:"#64748b",marginTop:14}}>Already have an account? <span style={{color:"#818cf8",cursor:"pointer"}} onClick={()=>setView("login")}>Sign in</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────────
  const Dashboard = () => {
    const navItems = [
      {id:"overview",icon:"🏠",label:"Overview"},
      {id:"markets",icon:"📈",label:"Markets"},
      {id:"wallet",icon:"💳",label:"Wallet"},
      {id:"portfolio",icon:"📊",label:"Portfolio"},
      {id:"staking",icon:"⚡",label:"Staking"},
      {id:"history",icon:"📋",label:"History"},
    ];

    return (
      <div style={{...S.app, display:"flex", flexDirection:"column"}}>
        <nav style={S.nav}>
          <div style={S.logo}><div style={S.logoMark}>VX</div>VaultXcrypto</div>
          <TickerMini/>
          <div style={S.row}>
            <div style={{fontSize:13,color:"#94a3b8"}}>👤 {user?.name}</div>
            <button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}} onClick={doLogout}>Logout</button>
          </div>
        </nav>
        <div style={{display:"flex",flex:1,minHeight:0}}>
          <div style={S.sidebar}>
            {navItems.map(it=>(
              <button key={it.id} style={S.sitem(dashTab===it.id)} onClick={()=>setDashTab(it.id)}>
                <span style={{fontSize:16}}>{it.icon}</span> {it.label}
              </button>
            ))}
            <div style={{flex:1}}/>
            <div style={{padding:"12px 14px",background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.15)",borderRadius:9,marginTop:8}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:4}}>Portfolio Value</div>
              <div style={{fontSize:16,fontWeight:700,color:"#a5b4fc"}}>${fmt(user?.portfolio || 0)}</div>
            </div>
          </div>
          <div style={S.main}>
            {dashTab === "overview"  && <DashOverview/>}
            {dashTab === "markets"   && <DashMarkets/>}
            {dashTab === "wallet"    && <DashWallet/>}
            {dashTab === "portfolio" && <DashPortfolio/>}
            {dashTab === "staking"   && <DashStaking/>}
            {dashTab === "history"   && <DashHistory/>}
          </div>
        </div>
      </div>
    );
  };

  const TickerMini = () => (
    <div style={{display:"flex",gap:20,overflow:"hidden",maxWidth:400}}>
      {COINS.slice(0,4).map(c=>{
        const p = prices[c.sym];
        const up = p?.change >= 0;
        return <div key={c.sym} style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}><span style={{color:"#e2e8f0",fontWeight:600}}>{c.sym}</span> <span style={{fontFamily:"monospace",color:up?"#4ade80":"#f87171"}}>${p?.price<1?p?.price.toFixed(4):fmt(p?.price)}</span></div>;
      })}
    </div>
  );

  // Overview tab
  const DashOverview = () => {
    const totalVal = (user?.balance||0) + (user?.portfolio||0);
    return (
      <div>
        <div style={S.rowsb}>
          <div><div style={S.hd}>Good morning, {user?.name.split(" ")[0]} 👋</div><div style={S.sub}>Here's your account at a glance.</div></div>
          <div style={S.row}>
            <button style={{...S.btn("success"),padding:"8px 16px"}} onClick={()=>setModal("deposit")}>+ Deposit</button>
            <button style={S.btn()} onClick={()=>setModal("send")}>Send / Receive</button>
          </div>
        </div>

        {/* Balance cards */}
        <div style={{...S.g4,marginBottom:22}}>
          {[
            {label:"Total Balance",val:"$"+fmt(totalVal),sub:"↑ 4.2% this week",c:"#818cf8"},
            {label:"Available Balance",val:"$"+fmt(user?.balance||0),sub:"Ready to trade",c:"#34d399"},
            {label:"Portfolio Value",val:"$"+fmt(user?.portfolio||0),sub:"↑ 2.1% today",c:"#38bdf8"},
            {label:"Staking Rewards",val:"$"+ fmt(+(user?.balance||0)*0.018,2),sub:"This month",c:"#fb923c"},
          ].map((s,i)=>(
            <div key={i} style={{...S.card,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,width:60,height:60,borderRadius:"50%",background:s.c+"15",transform:"translate(20px,-20px)"}}/>
              <div style={{fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:"#f1f5f9"}}>{s.val}</div>
              <div style={{fontSize:11,color:s.c,marginTop:4}}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={S.g2}>
          {/* Quick trade */}
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Quick Trade</div>
            <div style={{...S.row,marginBottom:12}}>
              {["buy","sell"].map(side=>(
                <button key={side} style={{...S.btn(tradeForm.side===side?(side==="buy"?"success":"danger"):"ghost"),flex:1,justifyContent:"center",padding:"9px"}} onClick={()=>setTradeForm(f=>({...f,side}))}>
                  {side==="buy"?"▲ Buy":"▼ Sell"}
                </button>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <label style={S.label}>Select Coin</label>
              <select style={{...S.inp,cursor:"pointer"}} value={tradeForm.coin} onChange={e=>setTradeForm(f=>({...f,coin:e.target.value}))}>
                {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price<1?prices[c.sym]?.price.toFixed(4):fmt(prices[c.sym]?.price)}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={S.label}>Amount (USD)</label>
              <input style={S.inp} placeholder="0.00" type="number" value={tradeForm.amount} onChange={e=>setTradeForm(f=>({...f,amount:e.target.value}))}/>
            </div>
            {tradeForm.amount && <div style={{...S.scard,marginBottom:12,fontSize:12,color:"#94a3b8"}}>
              You {tradeForm.side} ≈ {(tradeForm.amount / (prices[tradeForm.coin]?.price||1)).toFixed(6)} {tradeForm.coin} &nbsp;·&nbsp; Fee: ${(tradeForm.amount*0.001).toFixed(2)}
            </div>}
            <button style={{...S.btn(tradeForm.side==="buy"?"success":"danger"),width:"100%",justifyContent:"center",padding:11}} onClick={()=>{ toast$(tradeForm.side==="buy"?"Order placed! Buying "+tradeForm.coin:"Sell order placed!","success"); setTradeForm(f=>({...f,amount:""})); }}>
              {tradeForm.side==="buy"?"Buy "+tradeForm.coin:"Sell "+tradeForm.coin}
            </button>
          </div>

          {/* Holdings */}
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>My Holdings</div>
            {COINS.slice(0,5).map((coin,i)=>{
              const p = prices[coin.sym];
              const qty = (0.05/(i+1));
              const val = qty * (p?.price||0);
              const up = p?.change >= 0;
              return (
                <div key={coin.sym} style={{...S.rowsb,padding:"9px 0",borderBottom:i<4?"1px solid rgba(255,255,255,.04)":"none"}}>
                  <div style={S.row}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div>
                    <div><div style={{fontWeight:500,fontSize:13,color:"#e2e8f0"}}>{coin.sym}</div><div style={{fontSize:11,color:"#64748b"}}>{qty.toFixed(4)} {coin.sym}</div></div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:600,color:"#f1f5f9"}}>${fmt(val)}</div>
                    <div style={{fontSize:11,color:up?"#4ade80":"#f87171"}}>{up?"+":""}{fmt(p?.change)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent transactions */}
        <div style={{...S.card,marginTop:14}}>
          <div style={{...S.rowsb,marginBottom:14}}>
            <span style={{fontSize:15,fontWeight:600,color:"#e2e8f0"}}>Recent Activity</span>
            <button style={{...S.btn("ghost"),padding:"5px 12px",fontSize:12}} onClick={()=>setDashTab("history")}>View all →</button>
          </div>
          <table style={S.tbl}>
            <thead><tr>{["Type","Asset","Amount","Value","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {history.slice(0,5).map(tx=>(
                <tr key={tx.id} style={{cursor:"default"}}>
                  <td style={S.td}><span style={S.tag(tx.type==="Buy"?"blue":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":"red")}>{tx.type}</span></td>
                  <td style={{...S.td,fontWeight:600}}>{tx.symbol}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.value)}</td>
                  <td style={S.td}><span style={S.tag(tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red")}>{tx.status}</span></td>
                  <td style={{...S.td,color:"#64748b"}}>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Markets tab
  const DashMarkets = () => (
    <div>
      <div style={S.hd}>Live Markets</div>
      <div style={S.sub}><span style={S.ldot}/>Prices updating every 2.5s</div>
      <div style={{...S.g4,marginBottom:20}}>
        {COINS.slice(0,4).map(coin=>{
          const p = prices[coin.sym];
          const up = p.change >= 0;
          return (
            <div key={coin.sym} style={S.card}>
              <div style={S.rowsb}>
                <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{coin.sym}</div>
                <span style={S.tag(up?"green":"red")}>{up?"+":""}{fmt(p.change)}%</span>
              </div>
              <div style={{fontSize:20,fontWeight:700,color:"#f1f5f9",margin:"8px 0"}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</div>
              <MiniChart prices={p.spark} color={up?"#22c55e":"#ef4444"}/>
            </div>
          );
        })}
      </div>
      <div style={S.card}>
        <div style={{overflowX:"auto"}}>
          <table style={S.tbl}>
            <thead><tr>{["#","Asset","Price","Change","High 24h","Low 24h","Volume","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {COINS.map((coin,i)=>{
                const p = prices[coin.sym];
                const up = p.change >= 0;
                const hi = p.price * 1.03, lo = p.price * 0.97;
                return (
                  <tr key={coin.sym} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{...S.td,color:"#64748b"}}>{i+1}</td>
                    <td style={S.td}><div style={S.row}><div style={{width:24,height:24,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><span style={{fontWeight:600,color:"#e2e8f0"}}>{coin.sym}</span></div></td>
                    <td style={{...S.td,fontFamily:"monospace",fontWeight:600,color:"#f1f5f9"}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td>
                    <td style={S.td}>{fmtP(p.change)}</td>
                    <td style={{...S.td,fontFamily:"monospace",color:"#4ade80"}}>${hi<1?hi.toFixed(4):fmt(hi)}</td>
                    <td style={{...S.td,fontFamily:"monospace",color:"#f87171"}}>${lo<1?lo.toFixed(4):fmt(lo)}</td>
                    <td style={{...S.td,fontFamily:"monospace"}}>${fmt(p.price*21000/1000,1)}K</td>
                    <td style={S.td}><button style={{...S.btn("success"),padding:"4px 12px",fontSize:11}} onClick={()=>{ setTradeForm(f=>({...f,coin:coin.sym,side:"buy"})); setDashTab("overview"); }}>Trade</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Wallet tab
  const DashWallet = () => (
    <div>
      <div style={S.hd}>Wallet</div>
      <div style={S.sub}>Manage your crypto balances, send and receive</div>
      <div style={S.g2}>
        <div style={S.card}>
          <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:16}}>Send Crypto</div>
          <div style={{marginBottom:12}}><label style={S.label}>Select Coin</label>
            <select style={{...S.inp,cursor:"pointer"}} value={sendForm.coin} onChange={e=>setSendForm(f=>({...f,coin:e.target.value}))}>
              {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price<1?prices[c.sym]?.price.toFixed(4):fmt(prices[c.sym]?.price)}</option>)}
            </select>
          </div>
          <div style={{marginBottom:12}}><label style={S.label}>Recipient Address</label><input style={S.inp} placeholder="0x..." value={sendForm.address} onChange={e=>setSendForm(f=>({...f,address:e.target.value}))}/></div>
          <div style={{marginBottom:16}}><label style={S.label}>Amount</label><input style={S.inp} type="number" placeholder="0.00" value={sendForm.amount} onChange={e=>setSendForm(f=>({...f,amount:e.target.value}))}/></div>
          {sendForm.amount && <div style={{...S.scard,marginBottom:12,fontSize:12,color:"#94a3b8"}}>Network fee: ~$1.20 · Estimated arrival: 1–3 min</div>}
          <button style={{...S.btn("success"),width:"100%",justifyContent:"center",padding:11}} onClick={()=>{toast$("Transfer submitted!","success");setSendForm({coin:"BTC",amount:"",address:""});}}>Send {sendForm.coin||"Crypto"} →</button>
        </div>

        <div style={S.card}>
          <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:16}}>Receive Crypto</div>
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:24,textAlign:"center",marginBottom:14}}>
            <div style={{fontFamily:"monospace",fontSize:12,color:"#94a3b8",wordBreak:"break-all",lineHeight:1.8}}>
              <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>Your BTC address</div>
              bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
            </div>
            <div style={{marginTop:12,display:"flex",justifyContent:"center",gap:8}}>
              <button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}} onClick={()=>toast$("Address copied!","success")}>📋 Copy</button>
              <button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}}>📤 Share</button>
            </div>
          </div>
          <div style={{fontSize:11,color:"#64748b",lineHeight:1.7}}>Only send Bitcoin (BTC) to this address. Sending any other cryptocurrency may result in permanent loss.</div>
        </div>
      </div>

      {/* Balances */}
      <div style={{...S.card,marginTop:14}}>
        <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>All Balances</div>
        <table style={S.tbl}>
          <thead><tr>{["Asset","Balance","USD Value","24h Change","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {COINS.map((coin,i)=>{
              const p = prices[coin.sym];
              const qty = (0.05/(i+1));
              const up = p.change >= 0;
              return (
                <tr key={coin.sym}>
                  <td style={S.td}><div style={S.row}><div style={{width:24,height:24,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><span style={{fontWeight:600,color:"#e2e8f0"}}>{coin.name}</span></div></td>
                  <td style={{...S.td,fontFamily:"monospace"}}>{qty.toFixed(6)} {coin.sym}</td>
                  <td style={{...S.td,fontFamily:"monospace",fontWeight:600}}>${fmt(qty*p.price)}</td>
                  <td style={S.td}>{fmtP(p.change)}</td>
                  <td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"4px 11px",fontSize:11}}>Buy</button><button style={{...S.btn("ghost"),padding:"4px 11px",fontSize:11}}>Send</button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Portfolio tab
  const DashPortfolio = () => {
    const allocations = COINS.map((c,i) => ({ ...c, qty: 0.05/(i+1), val: (0.05/(i+1))*(prices[c.sym]?.price||0) }));
    const total = allocations.reduce((a,b)=>a+b.val,0);
    return (
      <div>
        <div style={S.hd}>Portfolio</div>
        <div style={S.sub}>Your crypto allocation and performance</div>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:6}}>Total Value</div>
            <div style={{fontSize:36,fontWeight:800,color:"#f1f5f9"}}>${fmt(total)}</div>
            <div style={{fontSize:12,color:"#4ade80",marginTop:4}}>↑ $1,240.50 (4.8%) all time</div>
            <div style={{marginTop:20}}>
              {allocations.slice(0,5).map(a=>{
                const pct = total > 0 ? (a.val/total)*100 : 0;
                return (
                  <div key={a.sym} style={{marginBottom:12}}>
                    <div style={{...S.rowsb,marginBottom:5}}>
                      <span style={{fontSize:12,color:"#94a3b8"}}>{a.sym}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{pct.toFixed(1)}% · ${fmt(a.val)}</span>
                    </div>
                    <div style={{height:5,background:"rgba(255,255,255,.06)",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,${a.color}99,${a.color})`,borderRadius:3}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Performance</div>
            {[["Today","$+120.40","0.8%","green"],["This Week","$+840.20","4.2%","green"],["This Month","$-220.10","-1.1%","red"],["All Time","$+12,340.00","48.2%","green"]].map(([p,v,c,col])=>(
              <div key={p} style={{...S.rowsb,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{color:"#64748b",fontSize:13}}>{p}</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:600,color:"#f1f5f9",fontSize:13}}>{v}</div>
                  <div style={{fontSize:11,color:col==="green"?"#4ade80":"#f87171"}}>{c}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Staking tab
  const DashStaking = () => (
    <div>
      <div style={S.hd}>Staking & Yield</div>
      <div style={S.sub}>Earn passive income on your crypto holdings</div>
      <div style={S.g3}>
        {[
          {sym:"ETH",name:"Ethereum",apy:4.8,staked:0.5,color:"#627EEA",bg:"#0e1428"},
          {sym:"SOL",name:"Solana",apy:7.2,staked:5,color:"#9945FF",bg:"#160a2a"},
          {sym:"ADA",name:"Cardano",apy:5.1,staked:1200,color:"#0033AD",bg:"#04092a"},
          {sym:"BNB",name:"BNB",apy:8.4,staked:0.8,color:"#F0B90B",bg:"#291e04"},
          {sym:"MATIC",name:"Polygon",apy:12.6,staked:500,color:"#8247E5",bg:"#120a20"},
          {sym:"DOT",name:"Polkadot",apy:14.2,staked:0,color:"#E6007A",bg:"#1f0011"},
        ].map((s,i)=>{
          const p = prices[s.sym] || prices["BNB"];
          const val = s.staked * (p?.price||0);
          const monthly = val * s.apy/100/12;
          return (
            <div key={i} style={{...S.card,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,width:50,height:50,borderRadius:"50%",background:s.color+"15",transform:"translate(20px,-20px)"}}/>
              <div style={{...S.rowsb,marginBottom:12}}>
                <div style={S.row}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:s.bg,border:`1px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:s.color}}>{s.sym.slice(0,3)}</div>
                  <div><div style={{fontWeight:600,color:"#e2e8f0"}}>{s.sym}</div><div style={{fontSize:11,color:"#64748b"}}>{s.name}</div></div>
                </div>
                <span style={{...S.tag("green"),fontSize:12}}>{s.apy}% APY</span>
              </div>
              <div style={S.g2}>
                <div><div style={{fontSize:10,color:"#64748b",marginBottom:3}}>STAKED</div><div style={{fontWeight:600,color:"#f1f5f9"}}>{s.staked} {s.sym}</div></div>
                <div><div style={{fontSize:10,color:"#64748b",marginBottom:3}}>MONTHLY</div><div style={{fontWeight:600,color:"#4ade80"}}>${fmt(monthly)}</div></div>
              </div>
              <div style={{marginTop:12}}>
                <button style={{...S.btn(s.staked>0?"ghost":"success"),width:"100%",justifyContent:"center",padding:8,fontSize:12}} onClick={()=>toast$(s.staked>0?"Staking increased!":"Staking started!","success")}>
                  {s.staked>0?"+ Add Stake":"Start Staking"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // History tab
  const DashHistory = () => (
    <div>
      <div style={S.hd}>Transaction History</div>
      <div style={S.sub}>All your trades, transfers and activity</div>
      <div style={S.card}>
        <div style={{overflowX:"auto"}}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID","Type","Asset","Amount","Value","Fee","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {history.map(tx=>(
                <tr key={tx.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{...S.td,fontFamily:"monospace",color:"#64748b",fontSize:11}}>{tx.id}</td>
                  <td style={S.td}><span style={S.tag(tx.type==="Buy"?"blue":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":"red")}>{tx.type}</span></td>
                  <td style={{...S.td,fontWeight:600}}>{tx.symbol}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.value)}</td>
                  <td style={{...S.td,fontFamily:"monospace",color:"#64748b"}}>${fmt(tx.fee)}</td>
                  <td style={S.td}><span style={S.tag(tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red")}>{tx.status}</span></td>
                  <td style={{...S.td,color:"#64748b"}}>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── ADMIN PANEL ───────────────────────────────────────────────────────────────
  const AdminPanel = () => {
    const adminNav = [
      {id:"users",icon:"👥",label:"Users & Funds"},
      {id:"pending",icon:"⏳",label:"Pending Tx"},
      {id:"withdrawals",icon:"📤",label:"Withdrawals"},
      {id:"deposits",icon:"📥",label:"Deposits"},
      {id:"fees",icon:"💰",label:"Fees"},
      {id:"markets",icon:"📈",label:"Markets"},
      {id:"settings",icon:"⚙️",label:"Settings"},
    ];
    return (
      <div style={{...S.app, display:"flex", flexDirection:"column"}}>
        <nav style={{...S.nav,borderBottom:"1px solid rgba(239,68,68,.2)"}}>
          <div style={{...S.logo}}>
            <div style={{...S.logoMark,background:"linear-gradient(135deg,#dc2626,#f97316)"}}>AD</div>
            VaultXcrypto <span style={{...S.tag("red"),marginLeft:8}}>Admin</span>
          </div>
          <div style={S.row}>
            <span style={{fontSize:12,color:"#94a3b8"}}>🔐 admin@system</span>
            <button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}} onClick={doLogout}>Logout</button>
          </div>
        </nav>
        <div style={{display:"flex",flex:1,minHeight:0}}>
          <div style={S.sidebar}>
            {adminNav.map(it=>(
              <button key={it.id} style={S.sitem(adminTab===it.id)} onClick={()=>setAdminTab(it.id)}>
                <span style={{fontSize:15}}>{it.icon}</span> {it.label}
              </button>
            ))}
          </div>
          <div style={S.main}>
            {adminTab === "users"       && <AdminUsers/>}
            {adminTab === "pending"     && <AdminPending/>}
            {adminTab === "withdrawals" && <AdminWithdrawals/>}
            {adminTab === "deposits"    && <AdminDeposits/>}
            {adminTab === "fees"        && <AdminFees/>}
            {adminTab === "markets"     && <AdminMarkets/>}
            {adminTab === "settings"    && <AdminSettings/>}
          </div>
        </div>
      </div>
    );
  };

  const AdminUsers = () => (
    <div>
      <div style={S.rowsb}>
        <div><div style={S.hd}>Users & Funds</div><div style={S.sub}>Manage all user accounts and balances</div></div>
        <button style={S.btn()} onClick={()=>toast$("Export CSV ready","success")}>Export CSV</button>
      </div>
      <div style={{...S.g4,marginBottom:20}}>
        {[{l:"Total Users",v:users.length},{l:"Active",v:users.filter(u=>u.status==="Active").length},{l:"Verified",v:users.filter(u=>u.verified).length},{l:"Total Deposits",v:"$"+fmt(users.reduce((a,u)=>a+u.balance,0))}].map((s,i)=>(
          <div key={i} style={S.scard}><div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div><div style={{fontSize:22,fontWeight:700,color:"#f1f5f9"}}>{s.v}</div></div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{overflowX:"auto"}}>
          <table style={S.tbl}>
            <thead><tr>{["ID","Name","Email","Balance","Portfolio","Tier","Status","Joined","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{...S.td,fontFamily:"monospace",color:"#64748b",fontSize:11}}>{u.id}</td>
                  <td style={{...S.td,fontWeight:600,color:"#e2e8f0"}}>{u.name}</td>
                  <td style={{...S.td,fontSize:12,color:"#94a3b8"}}>{u.email}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(u.balance)}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(u.portfolio)}</td>
                  <td style={S.td}><span style={S.tag(u.tier==="Elite"?"yellow":u.tier==="Pro"?"blue":"")}>{u.tier}</span></td>
                  <td style={S.td}><span style={S.tag(u.status==="Active"?"green":"red")}>{u.status}</span></td>
                  <td style={{...S.td,color:"#64748b",fontSize:12}}>{u.joined}</td>
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>toast$("Funds added to "+u.name,"success")}>+ Fund</button>
                      <button style={{...S.btn("ghost"),padding:"3px 10px",fontSize:11}} onClick={()=>setModal({type:"userDetail",user:u})}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AdminPending = () => (
    <div>
      <div style={S.hd}>Pending Transactions</div>
      <div style={S.sub}>All transactions awaiting review or processing</div>
      <div style={{...S.g3,marginBottom:20}}>
        {[{l:"Pending Total",v:pending.length,c:"yellow"},{l:"Withdrawals",v:pendingWithdrawals.length,c:"red"},{l:"Deposits",v:pendingDeposits.length,c:"green"}].map((s,i)=>(
          <div key={i} style={{...S.scard,borderLeft:`3px solid ${s.c==="yellow"?"#fbbf24":s.c==="red"?"#f87171":"#4ade80"}`}}>
            <div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{s.l}</div>
            <div style={{fontSize:28,fontWeight:700,color:"#f1f5f9"}}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{overflowX:"auto"}}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID","User","Type","Coin","Amount","USD Value","Fee","Network","Submitted","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pending.map(tx=>(
                <tr key={tx.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{...S.td,fontFamily:"monospace",color:"#64748b",fontSize:11}}>{tx.id}</td>
                  <td style={{...S.td,fontSize:12}}>{tx.user}</td>
                  <td style={S.td}><span style={S.tag(tx.type==="Deposit"?"green":"red")}>{tx.type}</span></td>
                  <td style={{...S.td,fontWeight:600}}>{tx.coin}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.usd)}</td>
                  <td style={{...S.td,fontFamily:"monospace",color:"#fbbf24"}}>${fmt(tx.fee)}</td>
                  <td style={{...S.td,fontSize:11}}>{tx.network}</td>
                  <td style={{...S.td,fontSize:11,color:"#64748b"}}>{tx.submitted}</td>
                  <td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>toast$("TX approved: "+tx.id,"success")}>Approve</button><button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>toast$("TX rejected: "+tx.id,"info")}>Reject</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const AdminWithdrawals = () => (
    <div>
      <div style={S.hd}>Withdrawal Requests</div>
      <div style={S.sub}>Review and process pending withdrawals</div>
      <div style={{...S.g3,marginBottom:20}}>
        {[{l:"Pending Withdrawals",v:"$"+fmt(pendingWithdrawals.reduce((a,b)=>a+b.usd,0))},{l:"Avg Amount",v:"$"+fmt(pendingWithdrawals.length>0?pendingWithdrawals.reduce((a,b)=>a+b.usd,0)/pendingWithdrawals.length:0)},{l:"Total Fees",v:"$"+fmt(pendingWithdrawals.reduce((a,b)=>a+b.fee,0))}].map((s,i)=>(
          <div key={i} style={{...S.scard}}><div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:20,fontWeight:700,color:"#f1f5f9"}}>{s.v}</div></div>
        ))}
      </div>
      <div style={S.card}>
        <table style={S.tbl}>
          <thead><tr>{["TX ID","User","Coin","Amount","USD Value","Fee (taken)","Network","Submitted","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {pendingWithdrawals.map(tx=>(
              <tr key={tx.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{...S.td,fontFamily:"monospace",color:"#64748b",fontSize:11}}>{tx.id}</td>
                <td style={{...S.td,fontSize:12}}>{tx.user}</td>
                <td style={{...S.td,fontWeight:600}}>{tx.coin}</td>
                <td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td>
                <td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.usd)}</td>
                <td style={{...S.td,fontFamily:"monospace",color:"#fbbf24"}}>${fmt(tx.fee)}</td>
                <td style={{...S.td,fontSize:11}}>{tx.network}</td>
                <td style={{...S.td,fontSize:11,color:"#64748b"}}>{tx.submitted}</td>
                <td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>toast$("Withdrawal approved","success")}>Approve</button><button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>toast$("Withdrawal rejected","info")}>Reject</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AdminDeposits = () => (
    <div>
      <div style={S.hd}>Deposit Requests</div>
      <div style={S.sub}>Incoming deposits awaiting confirmation</div>
      <div style={{...S.g3,marginBottom:20}}>
        {[{l:"Pending Deposits",v:"$"+fmt(pendingDeposits.reduce((a,b)=>a+b.usd,0))},{l:"Avg Deposit",v:"$"+fmt(pendingDeposits.length>0?pendingDeposits.reduce((a,b)=>a+b.usd,0)/pendingDeposits.length:0)},{l:"Network Fees",v:"$"+fmt(pendingDeposits.reduce((a,b)=>a+b.fee,0))}].map((s,i)=>(
          <div key={i} style={{...S.scard}}><div style={{fontSize:10,color:"#64748b",marginBottom:4,textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:20,fontWeight:700,color:"#f1f5f9"}}>{s.v}</div></div>
        ))}
      </div>
      <div style={S.card}>
        <table style={S.tbl}>
          <thead><tr>{["TX ID","User","Coin","Amount","USD Value","Platform Fee","Network","Submitted","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {pendingDeposits.map(tx=>(
              <tr key={tx.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{...S.td,fontFamily:"monospace",color:"#64748b",fontSize:11}}>{tx.id}</td>
                <td style={{...S.td,fontSize:12}}>{tx.user}</td>
                <td style={{...S.td,fontWeight:600}}>{tx.coin}</td>
                <td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td>
                <td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.usd)}</td>
                <td style={{...S.td,fontFamily:"monospace",color:"#4ade80"}}>${fmt(tx.fee)}</td>
                <td style={{...S.td,fontSize:11}}>{tx.network}</td>
                <td style={{...S.td,fontSize:11,color:"#64748b"}}>{tx.submitted}</td>
                <td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>toast$("Deposit confirmed","success")}>Confirm</button><button style={{...S.btn("ghost"),padding:"3px 10px",fontSize:11}} onClick={()=>toast$("Marked for review","info")}>Review</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AdminFees = () => {
    const tradeFeesTotal  = history.reduce((a,b)=>a+b.fee,0);
    const networkFees = pending.reduce((a,b)=>a+b.fee*0.4,0);
    const platformRev = tradeFeesTotal * 0.6;
    return (
      <div>
        <div style={S.hd}>Fees Overview</div>
        <div style={S.sub}>Platform revenue, trading fees and network costs</div>
        <div style={S.g4}>
          {[
            {l:"Total Trading Fees",v:"$"+fmt(tradeFeesTotal),c:"#818cf8",icon:"📊"},
            {l:"Platform Revenue",v:"$"+fmt(platformRev),c:"#4ade80",icon:"💹"},
            {l:"Network Fees Paid",v:"$"+fmt(networkFees),c:"#fb923c",icon:"🔗"},
            {l:"Pending Fee Revenue",v:"$"+fmt(totalFees),c:"#38bdf8",icon:"⏳"},
          ].map((s,i)=>(
            <div key={i} style={{...S.card,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:12,right:14,fontSize:22}}>{s.icon}</div>
              <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>{s.l}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{...S.g2,marginTop:16}}>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Fee Schedule</div>
            {[["Maker Fee","0.05%"],["Taker Fee","0.10%"],["Withdrawal Fee","0.0005 BTC"],["Deposit Fee","Free"],["Wire Transfer","$25 flat"],["Staking Cut","10% of rewards"]].map(([l,v])=>(
              <div key={l} style={{...S.rowsb,padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{color:"#94a3b8",fontSize:13}}>{l}</span>
                <span style={{fontFamily:"monospace",fontWeight:600,color:"#f1f5f9"}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Fee Revenue by Coin</div>
            {COINS.slice(0,6).map((c,i)=>{
              const rev = +(Math.random()*800+50).toFixed(2);
              return (
                <div key={c.sym} style={{...S.rowsb,padding:"9px 0",borderBottom:i<5?"1px solid rgba(255,255,255,.04)":"none"}}>
                  <div style={S.row}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:c.bg,border:`1px solid ${c.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:c.color}}>{c.sym.slice(0,3)}</div>
                    <span style={{color:"#94a3b8",fontSize:13}}>{c.sym}</span>
                  </div>
                  <span style={{fontFamily:"monospace",color:"#4ade80"}}>${fmt(rev)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{...S.card,marginTop:14}}>
          <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Pending Fee Collection</div>
          <table style={S.tbl}>
            <thead><tr>{["TX ID","User","Type","Coin","Trade Value","Platform Fee","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {history.slice(0,10).map(tx=>(
                <tr key={tx.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{...S.td,fontFamily:"monospace",color:"#64748b",fontSize:11}}>{tx.id}</td>
                  <td style={{...S.td,fontSize:12}}>{users[history.indexOf(tx)%users.length]?.email}</td>
                  <td style={S.td}><span style={S.tag(tx.type==="Buy"?"blue":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":"red")}>{tx.type}</span></td>
                  <td style={{...S.td,fontWeight:600}}>{tx.symbol}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.value)}</td>
                  <td style={{...S.td,fontFamily:"monospace",color:"#fbbf24"}}>${fmt(tx.fee)}</td>
                  <td style={S.td}><span style={S.tag(tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red")}>{tx.status}</span></td>
                  <td style={{...S.td,color:"#64748b"}}>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const AdminMarkets = () => (
    <div>
      <div style={S.hd}>Live Markets</div>
      <div style={S.sub}><span style={S.ldot}/>Real-time prices across all pairs</div>
      <div style={S.card}>
        <table style={S.tbl}>
          <thead><tr>{["Asset","Price","24h Change","Bid","Ask","Volume","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {COINS.map(coin=>{
              const p = prices[coin.sym];
              const up = p.change >= 0;
              const bid = p.price*0.999, ask = p.price*1.001;
              return (
                <tr key={coin.sym} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={S.td}><div style={S.row}><div style={{width:24,height:24,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><span style={{fontWeight:600,color:"#e2e8f0"}}>{coin.sym}</span></div></td>
                  <td style={{...S.td,fontFamily:"monospace",fontWeight:600,color:"#f1f5f9"}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td>
                  <td style={S.td}>{fmtP(p.change)}</td>
                  <td style={{...S.td,fontFamily:"monospace",color:"#4ade80"}}>${bid<1?bid.toFixed(4):fmt(bid)}</td>
                  <td style={{...S.td,fontFamily:"monospace",color:"#f87171"}}>${ask<1?ask.toFixed(4):fmt(ask)}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(p.price*21000/1000,1)}K</td>
                  <td style={S.td}><span style={S.tag("green")}>Active</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AdminSettings = () => (
    <div>
      <div style={S.hd}>Platform Settings</div>
      <div style={S.sub}>Configure VaultXcrypto platform parameters</div>
      <div style={S.g2}>
        {[
          {title:"Trading Settings",fields:[["Trading Fee (%)","0.10"],["Min Trade Amount ($)","10"],["Max Trade Amount ($)","100,000"],["Daily Withdrawal Limit ($)","50,000"]]},
          {title:"Security Settings",fields:[["2FA Required","Enabled"],["KYC Level","Level 2"],["Session Timeout (min)","30"],["IP Whitelist","Disabled"]]},
          {title:"Email Settings",fields:[["SMTP Host","smtp.sendgrid.net"],["Sender Email","noreply@vaultx.io"],["Email Verification","Enabled"],["Deposit Alerts","Enabled"]]},
          {title:"Network Fees",fields:[["BTC Network","0.0005 BTC"],["ETH Gas (Gwei)","Auto"],["BNB Fee","0.0005 BNB"],["SOL Fee","0.000025 SOL"]]},
        ].map((s,i)=>(
          <div key={i} style={S.card}>
            <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>{s.title}</div>
            {s.fields.map(([l,v])=>(
              <div key={l} style={{marginBottom:10}}><label style={S.label}>{l}</label><input style={S.inp} defaultValue={v}/></div>
            ))}
            <button style={{...S.btn("success"),marginTop:4,padding:"8px 18px"}} onClick={()=>toast$("Settings saved!","success")}>Save Changes</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── MODALS ────────────────────────────────────────────────────────────────────
  const Modal = () => {
    if (!modal) return null;
    const close = () => setModal(null);
    if (modal === "deposit") return (
      <div style={S.modal} onClick={close}>
        <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Deposit Funds</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:18}}>Add crypto to your wallet</div>
          <div style={{marginBottom:12}}><label style={S.label}>Select Coin</label><select style={{...S.inp,cursor:"pointer"}}>{COINS.map(c=><option key={c.sym}>{c.sym}</option>)}</select></div>
          <div style={{marginBottom:12}}><label style={S.label}>Network</label><select style={{...S.inp,cursor:"pointer"}}><option>ERC-20</option><option>BEP-20</option><option>TRC-20</option><option>Native</option></select></div>
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:10,padding:16,marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Deposit Address</div>
            <div style={{fontFamily:"monospace",fontSize:12,wordBreak:"break-all",color:"#94a3b8"}}>0x742d35Cc6634C0532925a3b844Bc454e4438f44e</div>
            <button style={{...S.btn("ghost"),marginTop:10,padding:"5px 14px",fontSize:11}} onClick={()=>toast$("Address copied!","success")}>📋 Copy</button>
          </div>
          <div style={{fontSize:11,color:"#64748b",marginBottom:16}}>⚠️ Min deposit: $10 · Confirmations: 12 block</div>
          <div style={S.row}><button style={{...S.btn(),flex:1,justifyContent:"center"}} onClick={close}>Done</button></div>
        </div>
      </div>
    );
    if (modal === "send") return (
      <div style={S.modal} onClick={close}>
        <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Send / Receive</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:18}}>Transfer crypto instantly</div>
          <div style={{marginBottom:12}}><label style={S.label}>Recipient</label><input style={S.inp} placeholder="Address or email"/></div>
          <div style={{...S.g2,marginBottom:12}}>
            <div><label style={S.label}>Coin</label><select style={{...S.inp,cursor:"pointer"}}>{COINS.map(c=><option key={c.sym}>{c.sym}</option>)}</select></div>
            <div><label style={S.label}>Amount</label><input style={S.inp} type="number" placeholder="0.00"/></div>
          </div>
          <div style={{...S.row,gap:10,marginTop:16}}>
            <button style={{...S.btn("ghost"),flex:1,justifyContent:"center"}} onClick={close}>Cancel</button>
            <button style={{...S.btn("success"),flex:1,justifyContent:"center"}} onClick={()=>{toast$("Transfer submitted!","success");close();}}>Send →</button>
          </div>
        </div>
      </div>
    );
    if (modal?.type === "userDetail") return (
      <div style={S.modal} onClick={close}>
        <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:16}}>User Detail</div>
          <div style={{...S.scard,marginBottom:14}}>
            {[["Name",modal.user?.name],["Email",modal.user?.email],["Balance","$"+fmt(modal.user?.balance)],["Portfolio","$"+fmt(modal.user?.portfolio)],["Tier",modal.user?.tier],["Status",modal.user?.status],["Joined",modal.user?.joined]].map(([l,v])=>(
              <div key={l} style={{...S.rowsb,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                <span style={{color:"#64748b",fontSize:12}}>{l}</span>
                <span style={{color:"#e2e8f0",fontWeight:500,fontSize:13}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{...S.g2,marginBottom:10}}>
            <button style={{...S.btn("success"),justifyContent:"center",padding:9}} onClick={()=>{toast$("Funds added to "+modal.user?.name,"success");close();}}>+ Add Funds</button>
            <button style={{...S.btn("danger"),justifyContent:"center",padding:9}} onClick={()=>{toast$("Account suspended","info");close();}}>Suspend User</button>
          </div>
          <button style={{...S.btn("ghost"),width:"100%",justifyContent:"center"}} onClick={close}>Close</button>
        </div>
      </div>
    );
    return null;
  };

  // ── TOAST ─────────────────────────────────────────────────────────────────────
  const Toast = () => !toast ? null : (
    <div style={{position:"fixed",bottom:22,right:22,zIndex:999,background:"#1e293b",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,padding:"11px 18px",fontSize:13,color:"#e2e8f0",display:"flex",alignItems:"center",gap:8,minWidth:220}}>
      <span>{toast.type==="success"?"✅":toast.type==="info"?"ℹ️":"⚠️"}</span>
      {toast.msg}
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}select,option{background:#1e293b;color:#e2e8f0}button:hover{opacity:.88}input:focus{border-color:#6366f1!important;outline:none}`}</style>
      {view === "landing"   && <Landing/>}
      {view === "login"     && <AuthPage mode="login"/>}
      {view === "register"  && <AuthPage mode="register"/>}
      {view === "dashboard" && <Dashboard/>}
      {view === "admin"     && <AdminPanel/>}
      <Modal/>
      <Toast/>
    </div>
  );
}