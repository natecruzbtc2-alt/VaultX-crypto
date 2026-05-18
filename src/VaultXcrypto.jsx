import { useState, useEffect, useRef, useCallback, createContext, useContext, memo } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COINS = [
  { sym:"BTC",  name:"Bitcoin",  color:"#F7931A", bg:"#1a0f00" },
  { sym:"ETH",  name:"Ethereum", color:"#7B8CDE", bg:"#0a0d1a" },
  { sym:"SOL",  name:"Solana",   color:"#9945FF", bg:"#0d0020" },
  { sym:"BNB",  name:"BNB",      color:"#F0B90B", bg:"#1a1200" },
  { sym:"XRP",  name:"XRP",      color:"#00AAE4", bg:"#001520" },
  { sym:"ADA",  name:"Cardano",  color:"#4A90E2", bg:"#000d1a" },
  { sym:"DOGE", name:"Dogecoin", color:"#C2A633", bg:"#181200" },
  { sym:"MATIC",name:"Polygon",  color:"#8247E5", bg:"#0d0020" },
];

const BASE_PRICES = {
  BTC:67842, ETH:3521, SOL:172, BNB:598,
  XRP:0.62, ADA:0.48, DOGE:0.14, MATIC:0.88
};

const ADMIN_USER = { username:"admin", password:"admin123" };

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#07050f", bg2:"#0d0a1a", bg3:"#120e22",
  card:"rgba(138,43,226,.06)", border:"rgba(138,43,226,.18)", border2:"rgba(138,43,226,.08)",
  purple:"#a855f7", purple2:"#7c3aed", purple3:"#c084fc", accent:"#06b6d4",
  text:"#f0eaff", text2:"#9d8ec4", text3:"#5a4e78",
  green:"#22c55e", red:"#ef4444", gold:"#f59e0b",
};

const S = {
  app:  { fontFamily:"'DM Sans',system-ui,sans-serif", background:C.bg, color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:  { background:"rgba(7,5,15,.97)", backdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:`0 0 40px rgba(138,43,226,.12)` },
  logo: { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:800, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:C.text },
  logoMark: { width:36, height:36, background:`linear-gradient(135deg,${C.purple2},${C.purple})`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#fff", boxShadow:`0 0 20px rgba(138,43,226,.5)` },
  ticker: { background:"rgba(13,10,26,.9)", borderBottom:`1px solid ${C.border2}`, padding:"7px 0", overflow:"hidden", whiteSpace:"nowrap" },
  btn: (v="primary") => ({
    cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, borderRadius:10,
    padding:"9px 18px", border:"none", display:"inline-flex", alignItems:"center", gap:7,
    background: v==="primary"?`linear-gradient(135deg,${C.purple2},${C.purple})` : v==="danger"?"linear-gradient(135deg,#b91c1c,#dc2626)" : v==="success"?`linear-gradient(135deg,#15803d,${C.green})` : `rgba(138,43,226,.12)`,
    color: v==="ghost" ? C.text2 : "#fff",
    outline: v==="ghost" ? `1px solid ${C.border}` : "none",
    boxShadow: v==="primary" ? `0 0 20px rgba(138,43,226,.35)` : "none",
    transition:"all .15s", minHeight:36, justifyContent:"center",
  }),
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, boxShadow:`0 0 40px rgba(0,0,0,.3), inset 0 1px 0 rgba(168,85,247,.1)` },
  scard: { background:`rgba(138,43,226,.04)`, border:`1px solid ${C.border2}`, borderRadius:12, padding:16 },
  sidebar: { width:210, background:`rgba(13,10,26,.8)`, borderRight:`1px solid ${C.border2}`, padding:"14px 10px", display:"flex", flexDirection:"column", gap:2, flexShrink:0 },
  sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:8, cursor:"pointer", fontSize:13, color:act?C.text:C.text3, background:act?`rgba(138,43,226,.18)`:"transparent", fontWeight:act?600:400, border:"none", borderLeft:act?`2px solid ${C.purple}`:"2px solid transparent", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"all .15s" }),
  main: { flex:1, padding:"22px 24px", overflowY:"auto", minHeight:0 },
  hd:   { fontSize:22, fontWeight:700, marginBottom:4, color:C.text },
  sub:  { fontSize:13, color:C.text3, marginBottom:20 },
  label:{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5, display:"block" },
  inp:  { background:`rgba(138,43,226,.07)`, border:`1px solid ${C.border}`, color:C.text, padding:"10px 13px", borderRadius:9, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  tag:  (c) => ({ display:"inline-flex", alignItems:"center", padding:"2px 9px", borderRadius:5, fontSize:11, fontWeight:600,
    background: c==="green"?"rgba(34,197,94,.12)":c==="red"?"rgba(239,68,68,.12)":c==="yellow"?"rgba(245,158,11,.12)":c==="purple"?"rgba(168,85,247,.15)":"rgba(255,255,255,.06)",
    color: c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.gold:c==="purple"?C.purple3:C.text2 }),
  tbl:  { width:"100%", borderCollapse:"collapse" },
  th:   { padding:"9px 14px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", fontWeight:500, borderBottom:`1px solid ${C.border2}`, background:`rgba(138,43,226,.04)` },
  td:   { padding:"11px 14px", fontSize:13, borderBottom:`1px solid ${C.border2}`, color:C.text2 },
  authBox: { background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:34, width:420, maxWidth:"95vw", boxShadow:`0 0 60px rgba(138,43,226,.2)` },
  modal:   { position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 },
  modalBox:{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:16, padding:28, width:440, maxWidth:"95vw", boxShadow:`0 0 60px rgba(138,43,226,.25)` },
  g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
  g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 },
  g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
  row:  { display:"flex", alignItems:"center", gap:8 },
  rowsb:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 },
  ldot: { width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", marginRight:5, boxShadow:`0 0 6px ${C.green}` },
};

// ─── PRICE CONTEXT ────────────────────────────────────────────────────────────
const PriceCtx = createContext({});
const usePrices = () => useContext(PriceCtx);

const fmt = (n,d=2) => typeof n==="number" ? n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : n;
const fmtP = (v) => <span style={{color:v>=0?C.purple3:C.red}}>{v>=0?"+":""}{fmt(v)}%</span>;
const coinInfo = sym => COINS.find(c=>c.sym===sym)||COINS[0];

function genSparkline(base,n=20){const p=[base];for(let i=1;i<n;i++)p.push(p[i-1]*(1+(Math.random()-.495)*.03));return p;}
function createHoldings(pf=0){const w=[.35,.25,.18,.12,.10];return COINS.slice(0,5).map((c,i)=>({sym:c.sym,qty:+((pf*w[i])/(BASE_PRICES[c.sym]||1)).toFixed(6)}));}
function createStaking(pf=0){return [{sym:"ETH",qty:+((pf*.04)/BASE_PRICES.ETH).toFixed(6),apy:4.8},{sym:"SOL",qty:+((pf*.03)/BASE_PRICES.SOL).toFixed(6),apy:7.2},{sym:"ADA",qty:+((pf*.02)/BASE_PRICES.ADA).toFixed(6),apy:5.1}].filter(s=>s.qty>0);}
function genPendingTx(){const t=["Withdrawal","Deposit"],co=["BTC","ETH","USDT","SOL","BNB"];return Array.from({length:8},(_,i)=>({id:`PX${String(200+i).padStart(6,"0")}`,user:["alice@email.com","bob@email.com","clara@email.com","dave@email.com"][i%4],type:t[i%2],coin:co[i%5],amount:+(Math.random()*5+.01).toFixed(4),usd:+(Math.random()*15000+100).toFixed(2),fee:+(Math.random()*20+1).toFixed(2),submitted:new Date(Date.now()-i*3600000*2).toLocaleString(),network:["ERC-20","BEP-20","TRC-20","Native"][i%4]}));}

// ─── PURE COMPONENTS (defined outside main — never re-created) ────────────────
const Spark = memo(({data,color,w=80,h=28})=>{
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/r)*h}`).join(" ");
  return <svg width={w} height={h} style={{display:"block",overflow:"visible"}}><polyline points={pts} fill="none" stroke={color||(data[data.length-1]>=data[0]?"#a855f7":"#ef4444")} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
});

const MiniChart = memo(({prices:ps,color})=>{
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d"),w=c.width,h=c.height;
    ctx.clearRect(0,0,w,h);
    if(!ps||ps.length<2)return;
    const mn=Math.min(...ps),mx=Math.max(...ps),r=mx-mn||1;
    ctx.beginPath();ps.forEach((p,i)=>{const x=(i/(ps.length-1))*w,y=h-2-((p-mn)/r)*(h-4);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineJoin="round";ctx.stroke();
    ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle=color+"22";ctx.fill();
  },[ps,color]);
  return <canvas ref={ref} width={200} height={60} style={{width:"100%",height:60}}/>;
});

const TickerBar = memo(()=>{
  const prices=usePrices(),ref=useRef();
  useEffect(()=>{
    let x=0;
    const id=setInterval(()=>{x-=1;if(ref.current)ref.current.style.transform=`translateX(${x}px)`;if(Math.abs(x)>(ref.current?.scrollWidth||0)/2)x=0;},30);
    return()=>clearInterval(id);
  },[]);
  return(
    <div style={S.ticker}>
      <div ref={ref} style={{display:"inline-flex",willChange:"transform"}}>
        {[...COINS,...COINS,...COINS].map((c,i)=>{const p=prices[c.sym],up=(p?.change||0)>=0;return<span key={i} style={{padding:"0 22px",fontSize:12,fontFamily:"monospace",color:up?C.purple3:C.red}}>{c.sym}/USD &nbsp;${p?.price<1?p?.price?.toFixed(4):fmt(p?.price)}&nbsp;<span style={{opacity:.6}}>{up?"+":""}{fmt(p?.change)}%</span></span>;})}
      </div>
    </div>
  );
});

const TickerMini = memo(()=>{
  const prices=usePrices();
  return(
    <div style={{display:"flex",gap:20,overflow:"hidden",maxWidth:380}}>
      {COINS.slice(0,4).map(c=>{const p=prices[c.sym],up=(p?.change||0)>=0;return<div key={c.sym} style={{fontSize:12,color:C.text3,whiteSpace:"nowrap"}}><span style={{color:C.text,fontWeight:600}}>{c.sym}</span>{" "}<span style={{fontFamily:"monospace",color:up?C.purple3:C.red}}>${p?.price<1?p?.price?.toFixed(4):fmt(p?.price)}</span></div>;})}
    </div>
  );
});

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function VaultXCrypto() {
  const [prices,setPrices]=useState(()=>Object.fromEntries(COINS.map(c=>[c.sym,{price:BASE_PRICES[c.sym],change:+(Math.random()*10-5).toFixed(2),spark:genSparkline(BASE_PRICES[c.sym])}])));
  const [view,setView]=useState("landing");
  const [user,setUser]=useState(null);
  const [dashTab,setDashTab]=useState("overview");
  const [adminTab,setAdminTab]=useState("users");
  const [users,setUsers]=useState([]);
  const [userHistory,setUserHistory]=useState({});
  const [pending,setPending]=useState(genPendingTx);
  const [feeReqs,setFeeReqs]=useState([]);
  const [toast,setToast]=useState(null);
  const [modal,setModal]=useState(null);
  const [alertMsg,setAlertMsg]=useState({text:"",type:""});

  // All forms as separate state — isolated from price updates
  const [loginForm,setLoginForm]=useState({email:"",password:"",admin:"",adminPw:"",adminMode:false});
  const [regForm,setRegForm]=useState({name:"",email:"",password:"",confirm:""});
  const [sendForm,setSendForm]=useState({coin:"BTC",amount:"",address:""});
  const [tradeForm,setTradeForm]=useState({coin:"BTC",side:"buy",amount:""});
  const [adminDepForm,setAdminDepForm]=useState({user:"",coin:"BTC",amount:"",network:"ERC-20"});
  const [adminUserForm,setAdminUserForm]=useState({name:"",email:"",password:"",tier:"Basic"});
  const [feeForm,setFeeForm]=useState({user:"",amount:"",reason:"Service fee",currency:"USD"});
  const [withdrawForm,setWithdrawForm]=useState({user:"",coin:"BTC",amount:"",network:"ERC-20"});

  // ── PRICES ──────────────────────────────────────────────────────────────────
  useEffect(()=>{
    let active=true;
    const go=async()=>{try{const r=await Promise.all(COINS.map(async c=>{const res=await fetch(`https://api.coinbase.com/v2/prices/${c.sym}-USD/spot`);const j=await res.json();return[c.sym,Number(j?.data?.amount)];}));if(!active)return;setPrices(prev=>{const next={...prev};r.forEach(([sym,price])=>{if(!price||!next[sym])return;const old=next[sym];next[sym]={price,change:+((price-old.price)/Math.max(old.price,1)*100).toFixed(2),spark:[...old.spark.slice(1),price]};});return next;});}catch(e){}};
    go();const id=setInterval(go,10000);return()=>{active=false;clearInterval(id);};
  },[]);

  useEffect(()=>{
    const id=setInterval(()=>{setPrices(prev=>{const next={...prev};COINS.forEach(c=>{const o=next[c.sym],p=o.price*(1+(Math.random()-.495)*.002);next[c.sym]={price:p,change:+(o.change+(Math.random()-.495)*.05).toFixed(2),spark:[...o.spark.slice(1),p]};});return next;});},2500);
    return()=>clearInterval(id);
  },[]);

  // ── HELPERS ─────────────────────────────────────────────────────────────────
  const toast$=useCallback((msg,type="info")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);},[]);
  const showAlert=useCallback((text)=>{setAlertMsg({text,type:"error"});setTimeout(()=>setAlertMsg({text:"",type:""}),4000);},[]);
  const updateUser=useCallback((u)=>{setUser(u);setUsers(prev=>prev.map(x=>x.email===u.email?u:x));},[]);
  const addTx=useCallback((email,tx)=>{setUserHistory(prev=>({...prev,[email]:[tx,...(prev[email]||[])]}));},[]);
  const getTxs=(email)=>userHistory[email]||[];
  const pendingW=pending.filter(p=>p.type==="Withdrawal");
  const pendingD=pending.filter(p=>p.type==="Deposit");

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const doLogin=useCallback(()=>{
    if(!loginForm.email||!loginForm.password){showAlert("Fill in all fields");return;}
    const u=users.find(u=>u.email===loginForm.email);
    if(!u){showAlert("User not found");return;}
    if(u.password&&u.password!==loginForm.password){showAlert("Invalid credentials");return;}
    setUser(u);setView("dashboard");setDashTab("overview");
    toast$("Welcome back, "+u.name.split(" ")[0]+"!","success");
  },[loginForm,users,showAlert,toast$]);

  const doAdminLogin=useCallback(()=>{
    if(loginForm.admin!==ADMIN_USER.username||loginForm.adminPw!==ADMIN_USER.password){showAlert("Invalid admin credentials");return;}
    setView("admin");setAdminTab("users");toast$("Admin panel loaded","success");
  },[loginForm,showAlert,toast$]);

  const doRegister=useCallback(()=>{
    const{name,email,password,confirm}=regForm;
    if(!name||!email||!password||!confirm){showAlert("All fields required");return;}
    if(password!==confirm){showAlert("Passwords don't match");return;}
    if(users.some(u=>u.email===email)){showAlert("Email already registered");return;}
    const nu={id:`U${String(users.length+1).padStart(4,"0")}`,name,email,password,balance:0,portfolio:0,holdings:createHoldings(0),staking:createStaking(0),joined:new Date().toLocaleDateString(),verified:true,status:"Active",tier:"Basic"};
    setUsers(prev=>[...prev,nu]);
    setRegForm({name:"",email:"",password:"",confirm:""});
    toast$("Account created! Please sign in.","success");setView("login");
  },[regForm,users,showAlert,toast$]);

  const doLogout=useCallback(()=>{setUser(null);setView("landing");toast$("Signed out");},[toast$]);

  // ── TRADE ───────────────────────────────────────────────────────────────────
  const doTrade=useCallback(()=>{
    const amount=Number(tradeForm.amount);if(!amount||amount<=0){showAlert("Enter a valid amount");return;}
    const{coin,side}=tradeForm,price=prices[coin]?.price||1,qty=+(amount/price).toFixed(6),holdings=[...(user.holdings||[])];
    if(side==="buy"){
      if(amount>user.balance){showAlert("Insufficient balance");return;}
      const idx=holdings.findIndex(h=>h.sym===coin);
      if(idx!==-1)holdings[idx]={...holdings[idx],qty:+(holdings[idx].qty+qty).toFixed(6)};else holdings.push({sym:coin,qty});
      updateUser({...user,balance:+(user.balance-amount).toFixed(2),portfolio:+(user.portfolio+amount).toFixed(2),holdings});
      addTx(user.email,{id:`TX${Date.now()}`,type:"Buy",symbol:coin,amount:qty,value:amount,fee:+(amount*.001).toFixed(2),status:"Completed",date:new Date().toLocaleDateString()});
      toast$(`Bought ${qty} ${coin}`,"success");
    }else{
      const h=holdings.find(h=>h.sym===coin);if(!h||qty>h.qty){showAlert(`Insufficient ${coin}`);return;}
      updateUser({...user,balance:+(user.balance+amount).toFixed(2),portfolio:Math.max(0,+(user.portfolio-amount).toFixed(2)),holdings:holdings.map(h=>h.sym===coin?{...h,qty:+(h.qty-qty).toFixed(6)}:h).filter(h=>h.qty>0)});
      addTx(user.email,{id:`TX${Date.now()}`,type:"Sell",symbol:coin,amount:qty,value:amount,fee:+(amount*.001).toFixed(2),status:"Completed",date:new Date().toLocaleDateString()});
      toast$(`Sold ${qty} ${coin}`,"success");
    }
    setTradeForm(f=>({...f,amount:""}));
  },[tradeForm,prices,user,updateUser,addTx,showAlert,toast$]);

  const doSend=useCallback(()=>{
    const amount=Number(sendForm.amount),{coin,address}=sendForm;
    if(!address.trim()){showAlert("Enter recipient address");return;}if(!amount||amount<=0){showAlert("Enter a valid amount");return;}
    const price=prices[coin]?.price||1,qty=+(amount/price).toFixed(6),h=user.holdings?.find(h=>h.sym===coin);
    if(!h||qty>h.qty){showAlert(`Insufficient ${coin} balance`);return;}
    updateUser({...user,portfolio:Math.max(0,+(user.portfolio-amount).toFixed(2)),holdings:(user.holdings||[]).map(h=>h.sym===coin?{...h,qty:+(h.qty-qty).toFixed(6)}:h).filter(h=>h.qty>0)});
    addTx(user.email,{id:`TX${Date.now()}`,type:"Withdrawal",symbol:coin,amount:qty,value:amount,fee:1.2,status:"Completed",date:new Date().toLocaleDateString()});
    setSendForm({coin:"BTC",amount:"",address:""});toast$(`Sent ${qty} ${coin}`,"success");
  },[sendForm,prices,user,updateUser,addTx,showAlert,toast$]);

  // ── ADMIN ───────────────────────────────────────────────────────────────────
  const doAdminDeposit=useCallback(()=>{
    const target=adminDepForm.user,amount=Number(adminDepForm.amount);
    if(!target||!amount||amount<=0){showAlert("Select user and enter amount");return;}
    const idx=users.findIndex(u=>u.email===target);if(idx===-1){showAlert("User not found");return;}
    const updated=[...users];updated[idx]={...updated[idx],balance:+(updated[idx].balance+amount).toFixed(2),portfolio:+(updated[idx].portfolio+amount).toFixed(2)};
    setUsers(updated);if(user&&user.email===target)setUser(updated[idx]);
    const tx={id:`DP${Date.now()}`,user:target,type:"Deposit",coin:adminDepForm.coin,amount:+(amount/(BASE_PRICES[adminDepForm.coin]||1)).toFixed(6),usd:amount,fee:+(amount*.001).toFixed(2),submitted:new Date().toLocaleString(),network:adminDepForm.network};
    setPending(prev=>[tx,...prev]);
    addTx(target,{id:tx.id,type:"Deposit",symbol:adminDepForm.coin,amount:tx.amount,value:amount,fee:tx.fee,status:"Completed",date:new Date().toLocaleDateString()});
    setAdminDepForm({user:"",coin:"BTC",amount:"",network:"ERC-20"});toast$("Deposit credited to "+target,"success");
  },[adminDepForm,users,user,addTx,showAlert,toast$]);

  const doAdminAddUser=useCallback(()=>{
    const{name,email,password,tier}=adminUserForm;
    if(!name||!email||!password){showAlert("Name, email and password required");return;}
    if(users.some(u=>u.email===email)){showAlert("Email already exists");return;}
    setUsers(prev=>[{id:`U${String(prev.length+1).padStart(4,"0")}`,name,email,password,balance:0,portfolio:0,holdings:createHoldings(0),staking:createStaking(0),joined:new Date().toLocaleDateString(),verified:true,status:"Active",tier},...prev]);
    setAdminUserForm({name:"",email:"",password:"",tier:"Basic"});toast$("Client added: "+name,"success");
  },[adminUserForm,users,showAlert,toast$]);

  const doAdminWithdraw=useCallback(()=>{
    const target=withdrawForm.user,amount=Number(withdrawForm.amount);
    if(!target||!amount||amount<=0){showAlert("Select user and enter amount");return;}
    setPending(prev=>[{id:`WD${Date.now()}`,user:target,type:"Withdrawal",coin:withdrawForm.coin,amount:+(amount/(BASE_PRICES[withdrawForm.coin]||1)).toFixed(6),usd:amount,fee:+(amount*.0015).toFixed(2),submitted:new Date().toLocaleString(),network:withdrawForm.network},...prev]);
    setWithdrawForm({user:"",coin:"BTC",amount:"",network:"ERC-20"});toast$("Withdrawal request created","success");
  },[withdrawForm,showAlert,toast$]);

  const doAdminFee=useCallback(()=>{
    const target=feeForm.user,amount=Number(feeForm.amount);
    if(!target||!amount||amount<=0){showAlert("Select client and enter amount");return;}
    setFeeReqs(prev=>[{id:`FR${String(prev.length+1).padStart(5,"0")}`,user:target,amount,reason:feeForm.reason||"Service fee",currency:feeForm.currency,created:new Date().toLocaleString(),status:"Pending"},...prev]);
    setFeeForm({user:"",amount:"",reason:"Service fee",currency:"USD"});toast$("Fee request issued","success");
  },[feeForm,showAlert,toast$]);

  const removeTx=useCallback((id,label="Transaction")=>{setPending(prev=>prev.filter(t=>t.id!==id));toast$(label+" processed","info");},[toast$]);

  const globalCSS=`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#07050f}
    select,option{background:#0d0a1a!important;color:#f0eaff!important}
    input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
    button:hover{filter:brightness(1.15)}
    input:focus,select:focus{border-color:#a855f7!important;outline:none!important;box-shadow:0 0 0 2px rgba(168,85,247,.15)!important}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:#0d0a1a}
    ::-webkit-scrollbar-thumb{background:rgba(138,43,226,.4);border-radius:3px}
  `;

  // ── LANDING ─────────────────────────────────────────────────────────────────
  const Landing=()=>(
    <div style={S.app}>
      <nav style={S.nav}>
        <div style={S.logo}><div style={S.logoMark}>VX</div>VaultXcrypto</div>
        <div style={S.row}><button style={S.btn("ghost")} onClick={()=>setView("login")}>Sign In</button><button style={S.btn()} onClick={()=>setView("register")}>Get Started</button></div>
      </nav>
      <TickerBar/>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px"}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(138,43,226,.1)",border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 16px",fontSize:12,color:C.purple3,marginBottom:22}}><span style={S.ldot}/> Live market data · Real-time trading</div>
          <h1 style={{fontSize:54,fontWeight:800,letterSpacing:"-2px",lineHeight:1.1,color:C.text,marginBottom:18}}>The exclusive way<br/>to trade{" "}<span style={{background:`linear-gradient(135deg,${C.purple},${C.purple3})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>crypto.</span></h1>
          <p style={{color:C.text3,fontSize:16,maxWidth:480,margin:"0 auto 30px"}}>Real-time prices, portfolio analytics, staking rewards and instant transfers — all in one elite vault platform.</p>
          <div style={{display:"flex",justifyContent:"center",gap:12}}>
            <button style={{...S.btn(),padding:"13px 32px",fontSize:15}} onClick={()=>setView("register")}>Start Trading Free</button>
            <button style={{...S.btn("ghost"),padding:"13px 32px",fontSize:15}} onClick={()=>setView("login")}>Sign In</button>
          </div>
        </div>
        <div style={{...S.card,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,marginBottom:36,padding:0,overflow:"hidden"}}>
          {[["$2.4T","Market Cap"],["$94B","24h Volume"],["23,400+","Users"],["0.05%","Avg Fee"]].map(([v,l],i)=>(
            <div key={i} style={{padding:"20px 24px",borderRight:i<3?`1px solid ${C.border2}`:"none"}}><div style={{fontSize:24,fontWeight:700,color:C.purple3}}>{v}</div><div style={{fontSize:12,color:C.text3,marginTop:3}}>{l}</div></div>
          ))}
        </div>
        <div style={{...S.g4,marginBottom:36}}>
          {COINS.slice(0,4).map(coin=>{const p=prices[coin.sym],up=p.change>=0;return(
            <div key={coin.sym} style={{...S.card,position:"relative",overflow:"hidden",cursor:"pointer"}} onClick={()=>setView("register")}>
              <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at top right,${coin.color}10,transparent)`,pointerEvents:"none"}}/>
              <div style={S.rowsb}>
                <div style={S.row}><div style={{width:32,height:32,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><div><div style={{fontWeight:600,fontSize:13,color:C.text}}>{coin.sym}</div><div style={{fontSize:11,color:C.text3}}>{coin.name}</div></div></div>
                <span style={S.tag(up?"green":"red")}>{up?"+":""}{fmt(p.change)}%</span>
              </div>
              <div style={{marginTop:14}}><div style={{fontSize:20,fontWeight:700,color:C.text}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</div><div style={{marginTop:8}}><Spark data={p.spark} color={up?C.purple:C.red}/></div></div>
            </div>
          );})}
        </div>
        <div style={S.card}>
          <div style={{...S.rowsb,marginBottom:16}}><span style={{fontSize:16,fontWeight:600,color:C.text}}>Live Market</span><span style={{fontSize:11,color:C.text3}}><span style={S.ldot}/>Auto-refresh 2.5s</span></div>
          <div style={{overflowX:"auto"}}>
            <table style={S.tbl}>
              <thead><tr>{["#","Asset","Price","24h","Market Cap","Volume","Spark",""].map((h,i)=><th key={i} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>{COINS.map((coin,i)=>{const p=prices[coin.sym],up=p.change>=0;return(
                <tr key={coin.sym}>
                  <td style={S.td}><span style={{color:C.text3}}>{i+1}</span></td>
                  <td style={S.td}><div style={S.row}><div style={{width:26,height:26,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><div><div style={{fontWeight:600,color:C.text}}>{coin.sym}</div><div style={{fontSize:11,color:C.text3}}>{coin.name}</div></div></div></td>
                  <td style={{...S.td,fontWeight:600,color:C.text,fontFamily:"monospace"}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td>
                  <td style={S.td}>{fmtP(p.change)}</td>
                  <td style={S.td}>${fmt(p.price*19000000/1e9,1)}B</td>
                  <td style={S.td}>${fmt(p.price*210000/1e6,1)}M</td>
                  <td style={S.td}><Spark data={p.spark} color={up?C.purple:C.red} w={80} h={28}/></td>
                  <td style={S.td}><button style={{...S.btn(),padding:"5px 14px",fontSize:12}} onClick={()=>setView("register")}>Trade</button></td>
                </tr>
              );})}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{...S.g3,marginTop:36}}>
          {[{i:"🔐",t:"Bank-Grade Security",d:"Multi-sig wallets, cold storage, 2FA and insurance backed vaults."},{i:"⚡",t:"Instant Settlements",d:"Sub-second trades with deep liquidity across 200+ pairs."},{i:"📈",t:"Staking & Yield",d:"Earn up to 18% APY staking your idle crypto assets."},{i:"💸",t:"Low Fees",d:"Industry-lowest trading fees starting at 0.05% per trade."},{i:"📊",t:"Advanced Analytics",d:"Real-time charts, portfolio tracking and profit/loss reports."},{i:"🌍",t:"Global Transfers",d:"Send crypto anywhere in seconds with minimal network fees."}].map((f,i)=>(
            <div key={i} style={S.scard}><div style={{fontSize:28,marginBottom:10}}>{f.i}</div><div style={{fontWeight:600,color:C.text,marginBottom:6}}>{f.t}</div><div style={{fontSize:12,color:C.text3,lineHeight:1.7}}>{f.d}</div></div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const AuthPage=({mode})=>(
    <div style={S.app}>
      <nav style={S.nav}><div style={S.logo} onClick={()=>setView("landing")}><div style={S.logoMark}>VX</div>VaultXcrypto</div></nav>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 60px)",padding:24}}>
        <div style={S.authBox}>
          {mode==="login"?(!loginForm.adminMode?(
            <>
              <div style={{fontSize:24,fontWeight:800,marginBottom:4,color:C.text}}>Welcome back</div>
              <div style={{fontSize:13,color:C.text3,marginBottom:24}}>Sign in to your VaultX account</div>
              {alertMsg.text&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"9px 13px",fontSize:13,color:C.red,marginBottom:14}}>{alertMsg.text}</div>}
              <div style={{marginBottom:14}}><label style={S.label}>Email</label><input type="email" autoComplete="email" style={S.inp} placeholder="you@email.com" value={loginForm.email} onChange={e=>setLoginForm(f=>({...f,email:e.target.value}))}/></div>
              <div style={{marginBottom:18}}><label style={S.label}>Password</label><input type="password" autoComplete="current-password" style={S.inp} placeholder="••••••••" value={loginForm.password} onChange={e=>setLoginForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doLogin()}/></div>
              <button style={{...S.btn(),width:"100%",padding:"12px",justifyContent:"center"}} onClick={doLogin}>Sign In →</button>
              <div style={{textAlign:"center",fontSize:12,color:C.text3,marginTop:16}}>No account? <span style={{color:C.purple3,cursor:"pointer"}} onClick={()=>setView("register")}>Create one</span></div>
              <div style={{textAlign:"center",marginTop:10}}><span style={{fontSize:11,color:C.text3,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setLoginForm(f=>({...f,adminMode:true}))}>Admin access</span></div>
            </>
          ):(
            <>
              <div style={{fontSize:24,fontWeight:800,marginBottom:4,color:C.text}}>Admin Access</div>
              <div style={{fontSize:13,color:C.text3,marginBottom:24}}>Enter admin credentials</div>
              {alertMsg.text&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"9px 13px",fontSize:13,color:C.red,marginBottom:14}}>{alertMsg.text}</div>}
              <div style={{marginBottom:14}}><label style={S.label}>Username</label><input type="text" autoComplete="username" style={S.inp} placeholder="admin" value={loginForm.admin} onChange={e=>setLoginForm(f=>({...f,admin:e.target.value}))}/></div>
              <div style={{marginBottom:18}}><label style={S.label}>Password</label><input type="password" autoComplete="current-password" style={S.inp} placeholder="••••••••" value={loginForm.adminPw} onChange={e=>setLoginForm(f=>({...f,adminPw:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doAdminLogin()}/></div>
              <button style={{...S.btn(),width:"100%",padding:"12px",justifyContent:"center"}} onClick={doAdminLogin}>Admin Sign In →</button>
              <div style={{textAlign:"center",marginTop:14}}><span style={{fontSize:11,color:C.text3,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setLoginForm(f=>({...f,adminMode:false}))}>← Back to user login</span></div>
            </>
          )):(
            <>
              <div style={{fontSize:24,fontWeight:800,marginBottom:4,color:C.text}}>Create account</div>
              <div style={{fontSize:13,color:C.text3,marginBottom:24}}>Join VaultXcrypto — elite crypto platform</div>
              {alertMsg.text&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"9px 13px",fontSize:13,color:C.red,marginBottom:14}}>{alertMsg.text}</div>}
              {[["Full name","text","John Smith","name","name"],["Email","email","you@email.com","email","email"],["Password","password","Min 6 chars","password","new-password"],["Confirm password","password","Repeat password","confirm","new-password"]].map(([lbl,type,ph,key,ac])=>(
                <div key={key} style={{marginBottom:14}}><label style={S.label}>{lbl}</label><input type={type} autoComplete={ac} style={S.inp} placeholder={ph} value={regForm[key]} onChange={e=>setRegForm(f=>({...f,[key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&key==="confirm"&&doRegister()}/></div>
              ))}
              <button style={{...S.btn(),width:"100%",padding:"12px",justifyContent:"center"}} onClick={doRegister}>Create Account →</button>
              <div style={{textAlign:"center",fontSize:12,color:C.text3,marginTop:16}}>Already have an account? <span style={{color:C.purple3,cursor:"pointer"}} onClick={()=>setView("login")}>Sign in</span></div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  const Dashboard=()=>{
    const nav=[{id:"overview",icon:"◈",label:"Overview"},{id:"markets",icon:"◉",label:"Markets"},{id:"wallet",icon:"◎",label:"Wallet"},{id:"portfolio",icon:"◑",label:"Portfolio"},{id:"staking",icon:"◆",label:"Staking"},{id:"history",icon:"◫",label:"History"}];
    return(
      <div style={{...S.app,display:"flex",flexDirection:"column",height:"100vh"}}>
        <nav style={S.nav}>
          <div style={S.logo}><div style={S.logoMark}>VX</div>VaultXcrypto</div>
          <TickerMini/>
          <div style={S.row}><div style={{fontSize:13,color:C.text2}}>👤 {user?.name}</div><button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}} onClick={doLogout}>Logout</button></div>
        </nav>
        <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
          <div style={S.sidebar}>
            {nav.map(it=><button key={it.id} style={S.sitem(dashTab===it.id)} onClick={()=>setDashTab(it.id)}><span style={{fontSize:14,color:dashTab===it.id?C.purple3:C.text3}}>{it.icon}</span>{it.label}</button>)}
            <div style={{flex:1}}/>
            <div style={{padding:"14px",background:`rgba(138,43,226,.1)`,border:`1px solid ${C.border}`,borderRadius:10,marginTop:8}}>
              <div style={{fontSize:10,color:C.text3,marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>Portfolio</div>
              <div style={{fontSize:18,fontWeight:700,color:C.purple3}}>${fmt(user?.portfolio||0)}</div>
              <div style={{fontSize:10,color:C.text3,marginTop:2}}>Cash: ${fmt(user?.balance||0)}</div>
            </div>
          </div>
          <div style={{...S.main,overflowY:"auto"}}>
            {dashTab==="overview"  &&<DashOverview/>}
            {dashTab==="markets"   &&<DashMarkets/>}
            {dashTab==="wallet"    &&<DashWallet/>}
            {dashTab==="portfolio" &&<DashPortfolio/>}
            {dashTab==="staking"   &&<DashStaking/>}
            {dashTab==="history"   &&<DashHistory/>}
          </div>
        </div>
      </div>
    );
  };

  const DashOverview=()=>{
    const totalVal=(user?.balance||0)+(user?.portfolio||0),holdings=user?.holdings||[];
    return(
      <div>
        <div style={{...S.rowsb,marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div><div style={S.hd}>Good day, {user?.name?.split(" ")[0]} 👋</div><div style={S.sub}>Here's your account at a glance</div></div>
          <div style={S.row}><button style={{...S.btn("success"),padding:"8px 16px"}} onClick={()=>setModal("deposit")}>+ Deposit</button><button style={S.btn()} onClick={()=>setModal("send")}>↗ Send</button></div>
        </div>
        <div style={{...S.g4,marginBottom:20}}>
          {[{label:"Total Balance",val:"$"+fmt(totalVal),sub:"All assets",c:C.purple3},{label:"Available Cash",val:"$"+fmt(user?.balance||0),sub:"Ready to trade",c:C.green},{label:"Invested",val:"$"+fmt(user?.portfolio||0),sub:"In crypto",c:C.accent},{label:"Est. Rewards",val:"$"+fmt(+(user?.portfolio||0)*.005,2),sub:"This month",c:C.gold}].map((s,i)=>(
            <div key={i} style={{...S.card,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-10,right:-10,width:60,height:60,borderRadius:"50%",background:s.c+"18"}}/>
              <div style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:C.text}}>{s.val}</div>
              <div style={{fontSize:11,color:s.c,marginTop:4}}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>Quick Trade</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {["buy","sell"].map(side=><button key={side} style={{...S.btn(tradeForm.side===side?(side==="buy"?"success":"danger"):"ghost"),flex:1,justifyContent:"center",padding:"9px"}} onClick={()=>setTradeForm(f=>({...f,side}))}>{side==="buy"?"▲ Buy":"▼ Sell"}</button>)}
            </div>
            <div style={{marginBottom:12}}>
              <label style={S.label}>Asset</label>
              <select style={{...S.inp,cursor:"pointer"}} value={tradeForm.coin} onChange={e=>setTradeForm(f=>({...f,coin:e.target.value}))}>
                {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price<1?prices[c.sym]?.price.toFixed(4):fmt(prices[c.sym]?.price)}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={S.label}>Amount (USD)</label>
              <input style={S.inp} placeholder="0.00" type="number" value={tradeForm.amount} onChange={e=>setTradeForm(f=>({...f,amount:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doTrade()}/>
            </div>
            {tradeForm.amount&&Number(tradeForm.amount)>0&&<div style={{...S.scard,marginBottom:12,fontSize:12,color:C.text2}}>≈ {(Number(tradeForm.amount)/(prices[tradeForm.coin]?.price||1)).toFixed(6)} {tradeForm.coin} · Fee: ${(Number(tradeForm.amount)*.001).toFixed(2)}</div>}
            <button style={{...S.btn(tradeForm.side==="buy"?"success":"danger"),width:"100%",justifyContent:"center",padding:"11px"}} onClick={doTrade}>{tradeForm.side==="buy"?"Buy "+tradeForm.coin:"Sell "+tradeForm.coin}</button>
          </div>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>My Holdings</div>
            {holdings.length===0?<div style={{textAlign:"center",color:C.text3,padding:"30px 0",fontSize:13}}>No holdings yet.<br/>Deposit or trade to get started.</div>:holdings.slice(0,6).map((h,i)=>{const coin=coinInfo(h.sym),p=prices[h.sym],val=h.qty*(p?.price||0),up=(p?.change||0)>=0;return(
              <div key={h.sym} style={{...S.rowsb,padding:"9px 0",borderBottom:i<holdings.length-1?`1px solid ${C.border2}`:"none"}}>
                <div style={S.row}><div style={{width:28,height:28,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:coin.color}}>{h.sym.slice(0,3)}</div><div><div style={{fontWeight:500,fontSize:13,color:C.text}}>{h.sym}</div><div style={{fontSize:11,color:C.text3}}>{h.qty.toFixed(6)}</div></div></div>
                <div style={{textAlign:"right"}}><div style={{fontWeight:600,color:C.text}}>${fmt(val)}</div><div style={{fontSize:11,color:up?C.purple3:C.red}}>{up?"+":""}{fmt(p?.change)}%</div></div>
              </div>
            );})}
          </div>
        </div>
        <div style={{...S.card,marginTop:16}}>
          <div style={{...S.rowsb,marginBottom:14}}><span style={{fontSize:15,fontWeight:600,color:C.text}}>Recent Activity</span><button style={{...S.btn("ghost"),padding:"5px 12px",fontSize:12}} onClick={()=>setDashTab("history")}>View all →</button></div>
          {getTxs(user?.email).length===0?<div style={{textAlign:"center",color:C.text3,padding:"20px 0",fontSize:13}}>No transactions yet.</div>:(
            <table style={S.tbl}>
              <thead><tr>{["Type","Asset","Amount","Value","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>{getTxs(user?.email).slice(0,5).map(tx=>(
                <tr key={tx.id}>
                  <td style={S.td}><span style={S.tag(tx.type==="Buy"?"purple":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":"red")}>{tx.type}</span></td>
                  <td style={{...S.td,fontWeight:600}}>{tx.symbol}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td>
                  <td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.value)}</td>
                  <td style={S.td}><span style={S.tag(tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red")}>{tx.status}</span></td>
                  <td style={{...S.td,color:C.text3}}>{tx.date}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const DashMarkets=()=>(
    <div>
      <div style={S.hd}>Live Markets</div><div style={S.sub}><span style={S.ldot}/>Updating every 2.5 seconds</div>
      <div style={{...S.g4,marginBottom:20}}>{COINS.slice(0,4).map(coin=>{const p=prices[coin.sym],up=p.change>=0;return(<div key={coin.sym} style={S.card}><div style={S.rowsb}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{coin.sym}</div><span style={S.tag(up?"green":"red")}>{up?"+":""}{fmt(p.change)}%</span></div><div style={{fontSize:20,fontWeight:700,color:C.text,margin:"8px 0"}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</div><MiniChart prices={p.spark} color={up?C.purple:C.red}/></div>);})}</div>
      <div style={S.card}><div style={{overflowX:"auto"}}><table style={S.tbl}><thead><tr>{["#","Asset","Price","Change","High","Low","Volume","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{COINS.map((coin,i)=>{const p=prices[coin.sym],up=p.change>=0;return(<tr key={coin.sym}><td style={{...S.td,color:C.text3}}>{i+1}</td><td style={S.td}><div style={S.row}><div style={{width:24,height:24,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><span style={{fontWeight:600,color:C.text}}>{coin.sym}</span></div></td><td style={{...S.td,fontFamily:"monospace",fontWeight:600,color:C.text}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td><td style={S.td}>{fmtP(p.change)}</td><td style={{...S.td,fontFamily:"monospace",color:C.green}}>${fmt(p.price*1.03)}</td><td style={{...S.td,fontFamily:"monospace",color:C.red}}>${fmt(p.price*.97)}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(p.price*21000/1000,1)}K</td><td style={S.td}><button style={{...S.btn("success"),padding:"4px 12px",fontSize:11}} onClick={()=>{setTradeForm(f=>({...f,coin:coin.sym,side:"buy"}));setDashTab("overview");}}>Trade</button></td></tr>);})}</tbody></table></div></div>
    </div>
  );

  const DashWallet=()=>{
    const holdings=user?.holdings||[];
    return(
      <div>
        <div style={S.hd}>Wallet</div><div style={S.sub}>Manage your balances, send and receive</div>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:16}}>Send Crypto</div>
            <div style={{marginBottom:12}}><label style={S.label}>Asset</label><select style={{...S.inp,cursor:"pointer"}} value={sendForm.coin} onChange={e=>setSendForm(f=>({...f,coin:e.target.value}))}>{COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price<1?prices[c.sym]?.price.toFixed(4):fmt(prices[c.sym]?.price)}</option>)}</select></div>
            <div style={{marginBottom:12}}><label style={S.label}>Recipient Address</label><input style={S.inp} placeholder="0x…" autoComplete="off" value={sendForm.address} onChange={e=>setSendForm(f=>({...f,address:e.target.value}))}/></div>
            <div style={{marginBottom:16}}><label style={S.label}>Amount (USD)</label><input style={S.inp} type="number" autoComplete="off" placeholder="0.00" value={sendForm.amount} onChange={e=>setSendForm(f=>({...f,amount:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doSend()}/></div>
            {sendForm.amount&&<div style={{...S.scard,marginBottom:12,fontSize:12,color:C.text2}}>Network fee: ~$1.20 · Arrival: 1–3 min</div>}
            <button style={{...S.btn("success"),width:"100%",justifyContent:"center",padding:11}} onClick={doSend}>Send {sendForm.coin} →</button>
          </div>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:16}}>Receive Crypto</div>
            <div style={{background:`rgba(138,43,226,.06)`,border:`1px solid ${C.border}`,borderRadius:12,padding:24,textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:10,color:C.text3,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em"}}>Your BTC Deposit Address</div>
              <div style={{fontFamily:"monospace",fontSize:11,color:C.text2,wordBreak:"break-all",lineHeight:1.8}}>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
              <div style={{marginTop:14,display:"flex",justifyContent:"center",gap:8}}><button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}} onClick={()=>toast$("Address copied!","success")}>📋 Copy</button><button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}} onClick={()=>setModal("deposit")}>+ Deposit</button></div>
            </div>
            <div style={{fontSize:11,color:C.text3,lineHeight:1.7}}>Only send BTC to this address. Contact support for other coins.</div>
          </div>
        </div>
        <div style={{...S.card,marginTop:16}}>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>All Balances</div>
          {holdings.length===0?<div style={{textAlign:"center",color:C.text3,padding:"20px 0",fontSize:13}}>Your wallet is empty. <button style={{...S.btn("success"),padding:"6px 16px",marginLeft:8,fontSize:12}} onClick={()=>setModal("deposit")}>+ Deposit</button></div>:(
            <table style={S.tbl}><thead><tr>{["Asset","Holdings","USD Value","24h","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>{holdings.map(h=>{const coin=coinInfo(h.sym),p=prices[h.sym],up=(p?.change||0)>=0;return(<tr key={h.sym}><td style={S.td}><div style={S.row}><div style={{width:24,height:24,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:coin.color}}>{h.sym.slice(0,3)}</div><span style={{fontWeight:600,color:C.text}}>{coin.name}</span></div></td><td style={{...S.td,fontFamily:"monospace"}}>{h.qty.toFixed(6)} {h.sym}</td><td style={{...S.td,fontFamily:"monospace",fontWeight:600}}>${fmt(h.qty*(p?.price||0))}</td><td style={S.td}>{fmtP(p?.change||0)}</td><td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"4px 11px",fontSize:11}} onClick={()=>{setTradeForm(f=>({...f,coin:h.sym,side:"buy"}));setDashTab("overview");}}>Buy</button><button style={{...S.btn("ghost"),padding:"4px 11px",fontSize:11}} onClick={()=>setSendForm(f=>({...f,coin:h.sym}))}>Send</button></div></td></tr>);})}</tbody></table>
          )}
        </div>
      </div>
    );
  };

  const DashPortfolio=()=>{
    const holdings=user?.holdings||[],allocs=holdings.map(h=>({...h,val:h.qty*(prices[h.sym]?.price||0)})),total=allocs.reduce((a,b)=>a+b.val,0);
    return(
      <div>
        <div style={S.hd}>Portfolio</div><div style={S.sub}>Your crypto allocation and performance</div>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={{fontSize:14,color:C.text3,marginBottom:4}}>Total Portfolio Value</div>
            <div style={{fontSize:36,fontWeight:800,color:C.text,marginBottom:4}}>${fmt(total)}</div>
            <div style={{fontSize:12,color:C.purple3,marginBottom:20}}>Cash available: ${fmt(user?.balance||0)}</div>
            {allocs.length===0?<div style={{color:C.text3,fontSize:13}}>No holdings to display.</div>:allocs.map(a=>{const pct=total>0?(a.val/total)*100:0,c=coinInfo(a.sym);return(<div key={a.sym} style={{marginBottom:14}}><div style={{...S.rowsb,marginBottom:5}}><span style={{fontSize:12,color:C.text2}}>{a.sym}</span><span style={{fontSize:12,fontWeight:600,color:C.text}}>{pct.toFixed(1)}% · ${fmt(a.val)}</span></div><div style={{height:5,background:`rgba(138,43,226,.1)`,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,${c.color}80,${c.color})`,borderRadius:3}}/></div></div>);})}
          </div>
          <div style={S.card}>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>Performance</div>
            {[["Today","—"],["This Week","—"],["This Month","—"],["All Time","—"]].map(([p,v])=>(<div key={p} style={{...S.rowsb,padding:"10px 0",borderBottom:`1px solid ${C.border2}`}}><span style={{color:C.text3,fontSize:13}}>{p}</span><span style={{fontWeight:600,color:C.text,fontSize:13}}>{v}</span></div>))}
            <div style={{marginTop:16,fontSize:12,color:C.text3}}>Performance updates as you trade.</div>
          </div>
        </div>
      </div>
    );
  };

  const DashStaking=()=>{
    const STAKE=[{sym:"ETH",name:"Ethereum",apy:4.8,color:"#7B8CDE",bg:"#0a0d1a"},{sym:"SOL",name:"Solana",apy:7.2,color:"#9945FF",bg:"#0d0020"},{sym:"ADA",name:"Cardano",apy:5.1,color:"#4A90E2",bg:"#000d1a"},{sym:"BNB",name:"BNB",apy:8.4,color:"#F0B90B",bg:"#1a1200"},{sym:"MATIC",name:"Polygon",apy:12.6,color:"#8247E5",bg:"#0d0020"}];
    const holdings=user?.holdings||[];
    return(
      <div>
        <div style={S.hd}>Staking & Yield</div><div style={S.sub}>Earn passive income on your crypto holdings</div>
        <div style={S.g3}>{STAKE.map((s,i)=>{const p=prices[s.sym]||prices["BNB"],h=holdings.find(x=>x.sym===s.sym),staked=h?.qty||0,val=staked*(p?.price||0),monthly=val*s.apy/100/12;return(
          <div key={i} style={{...S.card,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:50,height:50,borderRadius:"50%",background:s.color+"15",transform:"translate(18px,-18px)"}}/>
            <div style={{...S.rowsb,marginBottom:12}}><div style={S.row}><div style={{width:30,height:30,borderRadius:"50%",background:s.bg,border:`1px solid ${s.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:s.color}}>{s.sym.slice(0,3)}</div><div><div style={{fontWeight:600,color:C.text}}>{s.sym}</div><div style={{fontSize:11,color:C.text3}}>{s.name}</div></div></div><span style={S.tag("green")}>{s.apy}% APY</span></div>
            <div style={S.g2}><div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>STAKED</div><div style={{fontWeight:600,color:C.text}}>{staked.toFixed(4)} {s.sym}</div></div><div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>MONTHLY</div><div style={{fontWeight:600,color:C.green}}>${fmt(monthly)}</div></div></div>
            <div style={{marginTop:12}}><button style={{...S.btn(staked>0?"ghost":"success"),width:"100%",justifyContent:"center",padding:8,fontSize:12}} onClick={()=>{if(staked<=0){setTradeForm(f=>({...f,coin:s.sym,side:"buy"}));setDashTab("overview");toast$("Buy "+s.sym+" first","info");}else toast$("Staking increased!","success");}}>{staked>0?"+ Add Stake":"Buy to Stake"}</button></div>
          </div>
        );})}
        </div>
      </div>
    );
  };

  const DashHistory=()=>{
    const txs=getTxs(user?.email);
    return(
      <div>
        <div style={S.hd}>Transaction History</div><div style={S.sub}>All your trades, transfers and deposits</div>
        <div style={S.card}>
          {txs.length===0?<div style={{textAlign:"center",color:C.text3,padding:"30px 0",fontSize:13}}>No transactions yet.</div>:(
            <div style={{overflowX:"auto"}}><table style={S.tbl}><thead><tr>{["TX ID","Type","Asset","Amount","Value","Fee","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>{txs.map(tx=>(<tr key={tx.id}><td style={{...S.td,fontFamily:"monospace",color:C.text3,fontSize:11}}>{tx.id}</td><td style={S.td}><span style={S.tag(tx.type==="Buy"?"purple":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":"red")}>{tx.type}</span></td><td style={{...S.td,fontWeight:600}}>{tx.symbol}</td><td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.value)}</td><td style={{...S.td,fontFamily:"monospace",color:C.text3}}>${fmt(tx.fee)}</td><td style={S.td}><span style={S.tag(tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red")}>{tx.status}</span></td><td style={{...S.td,color:C.text3}}>{tx.date}</td></tr>))}</tbody></table></div>
          )}
        </div>
      </div>
    );
  };

  // ── ADMIN ────────────────────────────────────────────────────────────────────
  const AdminPanel=()=>{
    const nav=[{id:"users",icon:"👥",label:"Users & Funds"},{id:"pending",icon:"⏳",label:"Pending Tx"},{id:"withdrawals",icon:"📤",label:"Withdrawals"},{id:"deposits",icon:"📥",label:"Deposits"},{id:"fees",icon:"💰",label:"Fees"},{id:"markets",icon:"📈",label:"Markets"},{id:"settings",icon:"⚙️",label:"Settings"}];
    return(
      <div style={{...S.app,display:"flex",flexDirection:"column",height:"100vh"}}>
        <nav style={{...S.nav,borderBottom:"1px solid rgba(239,68,68,.25)"}}>
          <div style={S.logo}><div style={{...S.logoMark,background:"linear-gradient(135deg,#b91c1c,#dc2626)"}}>AD</div>VaultXcrypto<span style={{...S.tag("red"),marginLeft:8}}>Admin</span></div>
          <div style={S.row}><span style={{fontSize:12,color:C.text3}}>🔐 admin@system</span><button style={{...S.btn("ghost"),padding:"6px 14px",fontSize:12}} onClick={doLogout}>Logout</button></div>
        </nav>
        <div style={{display:"flex",flex:1,minHeight:0,overflow:"hidden"}}>
          <div style={S.sidebar}>{nav.map(it=><button key={it.id} style={S.sitem(adminTab===it.id)} onClick={()=>setAdminTab(it.id)}><span style={{fontSize:14}}>{it.icon}</span>{it.label}</button>)}</div>
          <div style={{...S.main,overflowY:"auto"}}>
            {adminTab==="users"&&<AdminUsers/>}{adminTab==="pending"&&<AdminPending/>}{adminTab==="withdrawals"&&<AdminWithdrawals/>}{adminTab==="deposits"&&<AdminDeposits/>}{adminTab==="fees"&&<AdminFees/>}{adminTab==="markets"&&<AdminMarkets/>}{adminTab==="settings"&&<AdminSettings/>}
          </div>
        </div>
      </div>
    );
  };

  const AdminUsers=()=>(
    <div>
      <div style={S.rowsb}><div><div style={S.hd}>Users & Funds</div><div style={S.sub}>Manage all client accounts</div></div><button style={S.btn()} onClick={()=>toast$("CSV exported","success")}>Export CSV</button></div>
      <div style={{...S.g4,marginBottom:20}}>{[{l:"Total Users",v:users.length},{l:"Active",v:users.filter(u=>u.status==="Active").length},{l:"Verified",v:users.filter(u=>u.verified).length},{l:"Total Deposits",v:"$"+fmt(users.reduce((a,u)=>a+u.balance,0))}].map((s,i)=>(<div key={i} style={S.scard}><div style={{fontSize:10,color:C.text3,marginBottom:4,textTransform:"uppercase",letterSpacing:".06em"}}>{s.l}</div><div style={{fontSize:22,fontWeight:700,color:C.text}}>{s.v}</div></div>))}</div>
      <div style={{...S.card,marginBottom:20}}>
        <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>Add New Client</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
          <div><label style={S.label}>Full Name</label><input style={S.inp} value={adminUserForm.name} onChange={e=>setAdminUserForm(f=>({...f,name:e.target.value}))} placeholder="Jane Doe"/></div>
          <div><label style={S.label}>Email</label><input style={S.inp} type="email" value={adminUserForm.email} onChange={e=>setAdminUserForm(f=>({...f,email:e.target.value}))} placeholder="jane@email.com"/></div>
          <div><label style={S.label}>Password</label><input style={S.inp} type="password" value={adminUserForm.password} onChange={e=>setAdminUserForm(f=>({...f,password:e.target.value}))} placeholder="••••••"/></div>
          <div><label style={S.label}>Tier</label><select style={S.inp} value={adminUserForm.tier} onChange={e=>setAdminUserForm(f=>({...f,tier:e.target.value}))}>{["Basic","Pro","Elite"].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <button style={{...S.btn("success"),padding:"10px 20px"}} onClick={doAdminAddUser}>Add Client</button>
      </div>
      <div style={S.card}>
        {users.length===0?<div style={{textAlign:"center",color:C.text3,padding:"30px 0"}}>No clients yet. Add one above.</div>:(
          <div style={{overflowX:"auto"}}><table style={S.tbl}><thead><tr>{["ID","Name","Email","Balance","Portfolio","Tier","Status","Joined","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{users.map(u=>(<tr key={u.id}><td style={{...S.td,fontFamily:"monospace",color:C.text3,fontSize:11}}>{u.id}</td><td style={{...S.td,fontWeight:600,color:C.text}}>{u.name}</td><td style={{...S.td,fontSize:12,color:C.text2}}>{u.email}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(u.balance)}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(u.portfolio)}</td><td style={S.td}><span style={S.tag(u.tier==="Elite"?"yellow":u.tier==="Pro"?"purple":"")}>{u.tier}</span></td><td style={S.td}><span style={S.tag(u.status==="Active"?"green":"red")}>{u.status}</span></td><td style={{...S.td,color:C.text3,fontSize:12}}>{u.joined}</td><td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>setModal({type:"fundUser",user:u})}>+ Fund</button><button style={{...S.btn("ghost"),padding:"3px 10px",fontSize:11}} onClick={()=>setModal({type:"userDetail",user:u})}>View</button><button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>setUsers(prev=>prev.filter(x=>x.id!==u.id))}>Remove</button></div></td></tr>))}</tbody></table></div>
        )}
      </div>
    </div>
  );

  const AdminPending=()=>(
    <div>
      <div style={S.hd}>Pending Transactions</div><div style={S.sub}>All transactions awaiting review</div>
      <div style={{...S.g3,marginBottom:20}}>{[{l:"Total",v:pending.length,c:C.gold},{l:"Withdrawals",v:pendingW.length,c:C.red},{l:"Deposits",v:pendingD.length,c:C.green}].map((s,i)=>(<div key={i} style={{...S.scard,borderLeft:`3px solid ${s.c}`}}><div style={{fontSize:10,color:C.text3,marginBottom:4,textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:28,fontWeight:700,color:C.text}}>{s.v}</div></div>))}</div>
      <div style={S.card}><div style={{overflowX:"auto"}}><table style={S.tbl}><thead><tr>{["TX ID","User","Type","Coin","Amount","USD","Fee","Network","Submitted","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pending.map(tx=>(<tr key={tx.id}><td style={{...S.td,fontFamily:"monospace",color:C.text3,fontSize:11}}>{tx.id}</td><td style={{...S.td,fontSize:12}}>{tx.user}</td><td style={S.td}><span style={S.tag(tx.type==="Deposit"?"green":"red")}>{tx.type}</span></td><td style={{...S.td,fontWeight:600}}>{tx.coin}</td><td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.usd)}</td><td style={{...S.td,fontFamily:"monospace",color:C.gold}}>${fmt(tx.fee)}</td><td style={{...S.td,fontSize:11}}>{tx.network}</td><td style={{...S.td,fontSize:11,color:C.text3}}>{tx.submitted}</td><td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>removeTx(tx.id,"TX approved")}>Approve</button><button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>removeTx(tx.id,"TX rejected")}>Reject</button></div></td></tr>))}</tbody></table></div></div>
    </div>
  );

  const AdminWithdrawals=()=>(
    <div>
      <div style={S.hd}>Withdrawal Requests</div><div style={S.sub}>Review and process withdrawals</div>
      <div style={{...S.card,marginBottom:20}}>
        <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>Create Withdrawal Request</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
          <div><label style={S.label}>Client</label><select style={S.inp} value={withdrawForm.user} onChange={e=>setWithdrawForm(f=>({...f,user:e.target.value}))}><option value="">Select client</option>{users.map(u=><option key={u.email} value={u.email}>{u.name}</option>)}</select></div>
          <div><label style={S.label}>Coin</label><select style={S.inp} value={withdrawForm.coin} onChange={e=>setWithdrawForm(f=>({...f,coin:e.target.value}))}>{COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}</select></div>
          <div><label style={S.label}>Network</label><select style={S.inp} value={withdrawForm.network} onChange={e=>setWithdrawForm(f=>({...f,network:e.target.value}))}>{["ERC-20","BEP-20","TRC-20","Native"].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
          <div><label style={S.label}>Amount (USD)</label><input type="number" min="0" style={S.inp} value={withdrawForm.amount} onChange={e=>setWithdrawForm(f=>({...f,amount:e.target.value}))} placeholder="1000"/></div>
        </div>
        <button style={{...S.btn("success"),padding:"10px 20px"}} onClick={doAdminWithdraw}>Create Request</button>
      </div>
      <div style={S.card}><table style={S.tbl}><thead><tr>{["TX ID","User","Coin","Amount","USD","Fee","Network","Submitted","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pendingW.length===0?<tr><td colSpan={9} style={{...S.td,textAlign:"center",color:C.text3}}>No pending withdrawals.</td></tr>:pendingW.map(tx=>(<tr key={tx.id}><td style={{...S.td,fontFamily:"monospace",color:C.text3,fontSize:11}}>{tx.id}</td><td style={{...S.td,fontSize:12}}>{tx.user}</td><td style={{...S.td,fontWeight:600}}>{tx.coin}</td><td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.usd)}</td><td style={{...S.td,fontFamily:"monospace",color:C.gold}}>${fmt(tx.fee)}</td><td style={{...S.td,fontSize:11}}>{tx.network}</td><td style={{...S.td,fontSize:11,color:C.text3}}>{tx.submitted}</td><td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>removeTx(tx.id,"Withdrawal approved")}>Approve</button><button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>removeTx(tx.id,"Withdrawal removed")}>Remove</button></div></td></tr>))}</tbody></table></div>
    </div>
  );

  const AdminDeposits=()=>(
    <div>
      <div style={S.hd}>Deposit Desk</div><div style={S.sub}>Credit deposits to client accounts</div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:20,marginBottom:20}}>
        <div style={S.card}>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:16}}>Manual Vault Deposit</div>
          <div style={{display:"grid",gap:12}}>
            <div><label style={S.label}>Client</label><select style={S.inp} value={adminDepForm.user} onChange={e=>setAdminDepForm(f=>({...f,user:e.target.value}))}><option value="">Select client</option>{users.map(u=><option key={u.email} value={u.email}>{u.name} — {u.email}</option>)}</select></div>
            <div><label style={S.label}>Coin</label><select style={S.inp} value={adminDepForm.coin} onChange={e=>setAdminDepForm(f=>({...f,coin:e.target.value}))}>{COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}</select></div>
            <div><label style={S.label}>Network</label><select style={S.inp} value={adminDepForm.network} onChange={e=>setAdminDepForm(f=>({...f,network:e.target.value}))}>{["ERC-20","BEP-20","TRC-20","Native"].map(n=><option key={n} value={n}>{n}</option>)}</select></div>
            <div><label style={S.label}>Amount (USD)</label><input type="number" min="0" style={S.inp} placeholder="1000.00" value={adminDepForm.amount} onChange={e=>setAdminDepForm(f=>({...f,amount:e.target.value}))}/></div>
            <div style={{display:"flex",gap:10}}><button style={{...S.btn("success"),flex:1,justifyContent:"center"}} onClick={doAdminDeposit}>Credit Deposit</button><button style={{...S.btn("ghost"),flex:1,justifyContent:"center"}} onClick={()=>setAdminDepForm({user:"",coin:"BTC",amount:"",network:"ERC-20"})}>Reset</button></div>
            <div style={{fontSize:12,color:C.text3}}>Credits the client's balance and logs the deposit in their history.</div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>Vault Health</div>
          <div style={{display:"grid",gap:10}}>
            {[{label:"Total Clients",value:users.length},{label:"Total Equity",value:"$"+fmt(users.reduce((a,u)=>a+u.balance,0))},{label:"Pending Deposits",value:pendingD.length},{label:"Live Tickers",value:COINS.length}].map(item=>(
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",background:`rgba(138,43,226,.06)`,borderRadius:10}}>
                <span style={{color:C.text2,fontSize:13}}>{item.label}</span><strong style={{color:C.text}}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={S.card}><div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>Deposit Log</div>
      <div style={{overflowX:"auto"}}><table style={S.tbl}><thead><tr>{["TX ID","User","Coin","Amount","USD","Fee","Network","Submitted","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{pendingD.length===0?<tr><td colSpan={9} style={{...S.td,textAlign:"center",color:C.text3}}>No pending deposits.</td></tr>:pendingD.map(tx=>(<tr key={tx.id}><td style={{...S.td,fontFamily:"monospace",color:C.text3,fontSize:11}}>{tx.id}</td><td style={{...S.td,fontSize:12}}>{tx.user}</td><td style={{...S.td,fontWeight:600}}>{tx.coin}</td><td style={{...S.td,fontFamily:"monospace"}}>{tx.amount}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(tx.usd)}</td><td style={{...S.td,fontFamily:"monospace",color:C.green}}>${fmt(tx.fee)}</td><td style={{...S.td,fontSize:11}}>{tx.network}</td><td style={{...S.td,fontSize:11,color:C.text3}}>{tx.submitted}</td><td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>removeTx(tx.id,"Deposit confirmed")}>Confirm</button><button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>removeTx(tx.id,"Deposit removed")}>Remove</button></div></td></tr>))}</tbody></table></div></div>
    </div>
  );

  const AdminFees=()=>{
    const rev=pending.reduce((a,b)=>a+b.fee,0)*.6;
    return(
      <div>
        <div style={{...S.rowsb,marginBottom:20}}><div><div style={S.hd}>Fee Collection</div><div style={S.sub}>Issue and manage fee requests</div></div><button style={S.btn("success")} onClick={()=>toast$("Refreshed","success")}>Refresh</button></div>
        <div style={{...S.g4,marginBottom:20}}>{[{l:"Clients",v:users.length,c:C.purple3,i:"👥"},{l:"Pending",v:feeReqs.length,c:C.green,i:"⏳"},{l:"Collected",v:"$"+fmt(rev),c:C.gold,i:"💰"},{l:"Sync",v:"Live",c:C.accent,i:"🔗"}].map((s,i)=>(<div key={i} style={{...S.card,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:12,right:14,fontSize:22}}>{s.i}</div><div style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>{s.l}</div><div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div></div>))}</div>
        <div style={{...S.card,marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:14}}>Request Fee Payment</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
            <div><label style={S.label}>Client</label><select style={S.inp} value={feeForm.user} onChange={e=>setFeeForm(f=>({...f,user:e.target.value}))}><option value="">Select client</option>{users.map(u=><option key={u.email} value={u.email}>{u.name}</option>)}</select></div>
            <div><label style={S.label}>Amount</label><input type="number" min="1" style={S.inp} value={feeForm.amount} onChange={e=>setFeeForm(f=>({...f,amount:e.target.value}))} placeholder="100"/></div>
            <div><label style={S.label}>Currency</label><select style={S.inp} value={feeForm.currency} onChange={e=>setFeeForm(f=>({...f,currency:e.target.value}))}>{["USD","BTC","ETH"].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={S.label}>Reason</label><input style={S.inp} value={feeForm.reason} onChange={e=>setFeeForm(f=>({...f,reason:e.target.value}))} placeholder="Maintenance fee"/></div>
          </div>
          <button style={{...S.btn("success"),padding:"10px 20px"}} onClick={doAdminFee}>Send Fee Request</button>
        </div>
        <div style={S.card}><div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>Outstanding Requests</div>
        <table style={S.tbl}><thead><tr>{["Req ID","Client","Amount","Reason","Currency","Status","Created","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{feeReqs.length===0?<tr><td colSpan={8} style={{...S.td,textAlign:"center",color:C.text3}}>No fee requests yet.</td></tr>:feeReqs.map(r=>(<tr key={r.id}><td style={{...S.td,fontFamily:"monospace",color:C.text3,fontSize:11}}>{r.id}</td><td style={{...S.td,fontSize:12}}>{r.user}</td><td style={{...S.td,fontFamily:"monospace"}}>{r.amount}</td><td style={S.td}>{r.reason}</td><td style={{...S.td,fontFamily:"monospace"}}>{r.currency}</td><td style={S.td}><span style={S.tag(r.status==="Pending"?"yellow":"green")}>{r.status}</span></td><td style={{...S.td,color:C.text3}}>{r.created}</td><td style={S.td}><button style={{...S.btn("danger"),padding:"4px 10px",fontSize:11}} onClick={()=>{setFeeReqs(prev=>prev.filter(x=>x.id!==r.id));toast$("Removed","info");}}>Remove</button></td></tr>))}</tbody></table></div>
      </div>
    );
  };

  const AdminMarkets=()=>(
    <div>
      <div style={S.hd}>Live Markets</div><div style={S.sub}><span style={S.ldot}/>Real-time across all pairs</div>
      <div style={S.card}><table style={S.tbl}><thead><tr>{["Asset","Price","24h Change","Bid","Ask","Volume","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
      <tbody>{COINS.map(coin=>{const p=prices[coin.sym],up=p.change>=0;return(<tr key={coin.sym}><td style={S.td}><div style={S.row}><div style={{width:24,height:24,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:coin.color}}>{coin.sym.slice(0,3)}</div><span style={{fontWeight:600,color:C.text}}>{coin.sym}</span></div></td><td style={{...S.td,fontFamily:"monospace",fontWeight:600,color:C.text}}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td><td style={S.td}>{fmtP(p.change)}</td><td style={{...S.td,fontFamily:"monospace",color:C.green}}>${fmt(p.price*.999)}</td><td style={{...S.td,fontFamily:"monospace",color:C.red}}>${fmt(p.price*1.001)}</td><td style={{...S.td,fontFamily:"monospace"}}>${fmt(p.price*21000/1000,1)}K</td><td style={S.td}><span style={S.tag("green")}>Active</span></td></tr>);})}</tbody></table></div>
    </div>
  );

  const AdminSettings=()=>(
    <div>
      <div style={S.hd}>Platform Settings</div><div style={S.sub}>Configure VaultXcrypto parameters</div>
      <div style={S.g2}>{[{title:"Trading",fields:[["Fee (%)","0.10"],["Min ($)","10"],["Max ($)","100,000"],["Daily Limit ($)","50,000"]]},{title:"Security",fields:[["2FA","Enabled"],["KYC","Level 2"],["Session (min)","30"],["IP Whitelist","Disabled"]]},{title:"Email",fields:[["SMTP","smtp.sendgrid.net"],["From","noreply@vaultx.io"],["Verification","Enabled"],["Alerts","Enabled"]]},{title:"Network Fees",fields:[["BTC","0.0005 BTC"],["ETH Gas","Auto"],["BNB","0.0005 BNB"],["SOL","0.000025 SOL"]]}].map((s,i)=>(<div key={i} style={S.card}><div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:14}}>{s.title}</div>{s.fields.map(([l,v])=>(<div key={l} style={{marginBottom:10}}><label style={S.label}>{l}</label><input style={S.inp} defaultValue={v}/></div>))}<button style={{...S.btn("success"),marginTop:6,padding:"8px 18px"}} onClick={()=>toast$("Settings saved!","success")}>Save</button></div>))}</div>
    </div>
  );

  // ── MODALS ───────────────────────────────────────────────────────────────────
  const Modal=()=>{
    if(!modal)return null;
    const close=()=>setModal(null);

    if(modal==="deposit")return(
      <div style={S.modal} onClick={close}><div style={S.modalBox} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>Deposit Crypto</div>
        <div style={{fontSize:12,color:C.text3,marginBottom:18}}>Contact our team for a dedicated deposit address.</div>
        <div style={{background:`rgba(138,43,226,.08)`,border:`1px solid ${C.border}`,borderRadius:12,padding:18,marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:8}}>How to deposit</div>
          <div style={{fontSize:12,color:C.text2,lineHeight:1.7}}>For security compliance, deposit wallets are generated per-transaction. Contact support with your desired coin and amount — we'll send you a wallet address within minutes.</div>
        </div>
        <div style={{fontSize:12,color:C.text3,marginBottom:16}}>📧 support@vaultxcrypto.io</div>
        <div style={{display:"flex",gap:10}}><button style={{...S.btn("success"),flex:1,justifyContent:"center"}} onClick={()=>{window.open("mailto:support@vaultxcrypto.io?subject=Deposit%20Request","_blank");toast$("Opening support email…","info");}}>Contact Support</button><button style={{...S.btn("ghost"),flex:1,justifyContent:"center"}} onClick={close}>Close</button></div>
      </div></div>
    );

    if(modal==="send")return(
      <div style={S.modal} onClick={close}><div style={S.modalBox} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>Send Crypto</div>
        <div style={{fontSize:12,color:C.text3,marginBottom:18}}>Transfer to any wallet address</div>
        <div style={{marginBottom:12}}><label style={S.label}>Recipient Address</label><input style={S.inp} value={sendForm.address} onChange={e=>setSendForm(f=>({...f,address:e.target.value}))} placeholder="0x…"/></div>
        <div style={{...S.g2,marginBottom:12}}>
          <div><label style={S.label}>Coin</label><select style={{...S.inp,cursor:"pointer"}} value={sendForm.coin} onChange={e=>setSendForm(f=>({...f,coin:e.target.value}))}>{COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}</select></div>
          <div><label style={S.label}>Amount (USD)</label><input style={S.inp} type="number" value={sendForm.amount} onChange={e=>setSendForm(f=>({...f,amount:e.target.value}))} placeholder="0.00"/></div>
        </div>
        <div style={{...S.row,gap:10,marginTop:16}}><button style={{...S.btn("ghost"),flex:1,justifyContent:"center"}} onClick={close}>Cancel</button><button style={{...S.btn("success"),flex:1,justifyContent:"center"}} onClick={()=>{doSend();close();}}>Send →</button></div>
      </div></div>
    );

    if(modal?.type==="userDetail")return(
      <div style={S.modal} onClick={close}><div style={S.modalBox} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:16}}>Client Detail</div>
        <div style={{...S.scard,marginBottom:14}}>{[["Name",modal.user?.name],["Email",modal.user?.email],["Balance","$"+fmt(modal.user?.balance)],["Portfolio","$"+fmt(modal.user?.portfolio)],["Tier",modal.user?.tier],["Status",modal.user?.status],["Joined",modal.user?.joined]].map(([l,v])=>(<div key={l} style={{...S.rowsb,padding:"7px 0",borderBottom:`1px solid ${C.border2}`}}><span style={{color:C.text3,fontSize:12}}>{l}</span><span style={{color:C.text,fontWeight:500,fontSize:13}}>{v}</span></div>))}</div>
        <div style={{...S.g2,marginBottom:10}}><button style={{...S.btn("success"),justifyContent:"center",padding:9}} onClick={()=>setModal({type:"fundUser",user:modal.user})}>+ Fund Account</button><button style={{...S.btn("danger"),justifyContent:"center",padding:9}} onClick={()=>{toast$("Account suspended","info");close();}}>Suspend</button></div>
        <button style={{...S.btn("ghost"),width:"100%",justifyContent:"center"}} onClick={close}>Close</button>
      </div></div>
    );

    if(modal?.type==="fundUser"){
      const FundModal=()=>{
        const[amt,setAmt]=useState("");
        const[coin,setCoin]=useState("BTC");
        return(
          <div style={S.modal} onClick={close}><div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>Fund Account</div>
            <div style={{fontSize:12,color:C.text3,marginBottom:18}}>Credit funds to {modal.user?.name}</div>
            <div style={{marginBottom:12}}><label style={S.label}>Coin</label><select style={S.inp} value={coin} onChange={e=>setCoin(e.target.value)}>{COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}</select></div>
            <div style={{marginBottom:18}}><label style={S.label}>Amount (USD)</label><input type="number" style={S.inp} value={amt} onChange={e=>setAmt(e.target.value)} placeholder="1000.00" autoFocus/></div>
            <div style={{...S.row,gap:10}}>
              <button style={{...S.btn("ghost"),flex:1,justifyContent:"center"}} onClick={close}>Cancel</button>
              <button style={{...S.btn("success"),flex:1,justifyContent:"center"}} onClick={()=>{
                const amount=Number(amt);if(!amount||amount<=0){toast$("Enter valid amount","info");return;}
                const idx=users.findIndex(u=>u.email===modal.user.email);if(idx===-1)return;
                const updated=[...users];updated[idx]={...updated[idx],balance:+(updated[idx].balance+amount).toFixed(2),portfolio:+(updated[idx].portfolio+amount).toFixed(2)};
                setUsers(updated);if(user&&user.email===modal.user.email)setUser(updated[idx]);
                addTx(modal.user.email,{id:`DP${Date.now()}`,type:"Deposit",symbol:coin,amount:+(amount/(BASE_PRICES[coin]||1)).toFixed(6),value:amount,fee:+(amount*.001).toFixed(2),status:"Completed",date:new Date().toLocaleDateString()});
                toast$(`$${fmt(amount)} credited to ${modal.user.name}`,"success");close();
              }}>Credit Funds</button>
            </div>
          </div></div>
        );
      };
      return<FundModal/>;
    }
    return null;
  };

  const Toast=()=>!toast?null:(
    <div style={{position:"fixed",bottom:22,right:22,zIndex:9999,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 18px",fontSize:13,color:C.text,display:"flex",alignItems:"center",gap:8,minWidth:220,boxShadow:`0 0 30px rgba(138,43,226,.2)`}}>
      <span>{toast.type==="success"?"✅":toast.type==="info"?"💜":"⚠️"}</span>{toast.msg}
    </div>
  );

  return(
    <PriceCtx.Provider value={prices}>
      <div style={S.app}>
        <style>{globalCSS}</style>
        {view==="landing"  &&<Landing/>}
        {view==="login"    &&<AuthPage mode="login"/>}
        {view==="register" &&<AuthPage mode="register"/>}
        {view==="dashboard"&&<Dashboard/>}
        {view==="admin"    &&<AdminPanel/>}
        <Modal/>
        <Toast/>
      </div>
    </PriceCtx.Provider>
  );
}
