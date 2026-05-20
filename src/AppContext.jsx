import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://rrbdeqhxrdbtzjuhmrst.supabase.co",
  "sb_publishable_8aLEoyOMisBF80u72nOYlg__FP9eC5b"
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const COINS = [
  { sym:"BTC",  name:"Bitcoin",  color:"#F7931A", bg:"#1a0f00" },
  { sym:"ETH",  name:"Ethereum", color:"#7B8CDE", bg:"#0a0d1a" },
  { sym:"SOL",  name:"Solana",   color:"#9945FF", bg:"#0d0020" },
  { sym:"BNB",  name:"BNB",      color:"#F0B90B", bg:"#1a1200" },
  { sym:"XRP",  name:"XRP",      color:"#00AAE4", bg:"#001520" },
  { sym:"ADA",  name:"Cardano",  color:"#4A90E2", bg:"#000d1a" },
  { sym:"DOGE", name:"Dogecoin", color:"#C2A633", bg:"#181200" },
  { sym:"MATIC",name:"Polygon",  color:"#8247E5", bg:"#0d0020" },
];

export const BASE_PRICES = {
  BTC:67842, ETH:3521, SOL:172, BNB:598,
  XRP:0.62, ADA:0.48, DOGE:0.14, MATIC:0.88
};

export const ADMIN_CREDS = { username:"admin", password:"admin123" };

export const fmt = (n,d=2) => typeof n==="number" ? n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : String(n);
export const coinInfo = sym => COINS.find(c=>c.sym===sym)||COINS[0];

function genSparkline(base,n=20){
  const p=[base];
  for(let i=1;i<n;i++) p.push(p[i-1]*(1+(Math.random()-.495)*.03));
  return p;
}

export function createHoldings(pf=0){
  const w=[.35,.25,.18,.12,.10];
  return COINS.slice(0,5).map((c,i)=>({sym:c.sym,qty:+((pf*w[i])/(BASE_PRICES[c.sym]||1)).toFixed(6)}));
}

export function createStaking(pf=0){
  return [
    {sym:"ETH",qty:+((pf*.04)/BASE_PRICES.ETH).toFixed(6),apy:4.8},
    {sym:"SOL",qty:+((pf*.03)/BASE_PRICES.SOL).toFixed(6),apy:7.2},
    {sym:"ADA",qty:+((pf*.02)/BASE_PRICES.ADA).toFixed(6),apy:5.1},
  ].filter(s=>s.qty>0);
}

function genPendingTx(){
  const t=["Withdrawal","Deposit"],co=["BTC","ETH","USDT","SOL","BNB"];
  return Array.from({length:6},(_,i)=>({
    id:`PX${String(200+i).padStart(6,"0")}`,
    user:["alice@email.com","bob@email.com","clara@email.com","dave@email.com"][i%4],
    type:t[i%2], coin:co[i%5],
    amount:+(Math.random()*5+.01).toFixed(4),
    usd:+(Math.random()*15000+100).toFixed(2),
    fee:+(Math.random()*20+1).toFixed(2),
    submitted:new Date(Date.now()-i*3600000*2).toLocaleString(),
    network:["ERC-20","BEP-20","TRC-20","Native"][i%4],
  }));
}

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
export const PriceContext = createContext({});
export const AppContext   = createContext({});
export const usePrices    = () => useContext(PriceContext);
export const useApp       = () => useContext(AppContext);

// ─── PRICE PROVIDER (isolated - never causes form re-renders) ─────────────────
export function PriceProvider({ children }) {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(COINS.map(c=>[c.sym,{
      price:BASE_PRICES[c.sym],
      change:+(Math.random()*10-5).toFixed(2),
      spark:genSparkline(BASE_PRICES[c.sym])
    }]))
  );

  useEffect(()=>{
    let active=true;
    const go=async()=>{
      try{
        const r=await Promise.all(COINS.map(async c=>{
          const res=await fetch(`https://api.coinbase.com/v2/prices/${c.sym}-USD/spot`);
          const j=await res.json();
          return[c.sym,Number(j?.data?.amount)];
        }));
        if(!active)return;
        setPrices(prev=>{
          const next={...prev};
          r.forEach(([sym,price])=>{
            if(!price||!next[sym])return;
            const old=next[sym];
            next[sym]={price,change:+((price-old.price)/Math.max(old.price,1)*100).toFixed(2),spark:[...old.spark.slice(1),price]};
          });
          return next;
        });
      }catch(e){}
    };
    go();
    const id=setInterval(go,10000);
    return()=>{active=false;clearInterval(id);};
  },[]);

  useEffect(()=>{
    const id=setInterval(()=>{
      setPrices(prev=>{
        const next={...prev};
        COINS.forEach(c=>{
          const o=next[c.sym],p=o.price*(1+(Math.random()-.495)*.002);
          next[c.sym]={price:p,change:+(o.change+(Math.random()-.495)*.05).toFixed(2),spark:[...o.spark.slice(1),p]};
        });
        return next;
      });
    },2500);
    return()=>clearInterval(id);
  },[]);

  return <PriceContext.Provider value={prices}>{children}</PriceContext.Provider>;
}

// ─── APP PROVIDER ─────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [view,      setView]      = useState("landing");
  const [user,      setUser]      = useState(null);
  const [dashTab,   setDashTab]   = useState("overview");
  const [adminTab,  setAdminTab]  = useState("users");
  const [users,     setUsers]     = useState([]);
  const [txHistory, setTxHistory] = useState({});
  const [pending,   setPending]   = useState([]);
  const [feeReqs,   setFeeReqs]   = useState([]);
  const [toast,     setToast]     = useState(null);
  const [modal,     setModal]     = useState(null);
  const [alert,     setAlert]     = useState("");
  const [loading,   setLoading]   = useState(true);

  // ── LOAD DATA ON STARTUP ────────────────────────────────────────────────────
  useEffect(()=>{
    const load = async () => {
      try {
        const [
          { data: usersData },
          { data: pendingData },
          { data: feesData },
          { data: txData },
        ] = await Promise.all([
          supabase.from("vx_users").select("*"),
          supabase.from("vx_pending").select("*"),
          supabase.from("vx_fees").select("*"),
          supabase.from("vx_transactions").select("*").order("date", { ascending: false }),
        ]);

        if (usersData) setUsers(usersData.map(u=>({...u, holdings:u.holdings||[], staking:u.staking||[]})));
        if (pendingData && pendingData.length > 0) setPending(pendingData.map(t=>({...t,user:t.user_email||t.user})));
        else setPending(genPendingTx());
        if (feesData) setFeeReqs(feesData.map(r=>({...r,user:r.user_email||r.user})));
        if (txData) {
          const hist = {};
          txData.forEach(tx => {
            const key = tx.user_email;
            if (!hist[key]) hist[key] = [];
            hist[key].push(tx);
          });
          setTxHistory(hist);
        }
      } catch(e) {
        console.warn("Supabase unavailable, using localStorage", e);
        try {
          setUsers(JSON.parse(localStorage.getItem("vx_users")||"[]"));
          setTxHistory(JSON.parse(localStorage.getItem("vx_history")||"{}"));
          setPending(JSON.parse(localStorage.getItem("vx_pending")||"null")||genPendingTx());
          setFeeReqs(JSON.parse(localStorage.getItem("vx_fees")||"[]"));
        } catch(e2) {}
      }
      setLoading(false);
    };
    load();
  },[]);

  // ── HELPERS ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg,type="info")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3500);
  },[]);

  const showAlert = useCallback((text)=>{
    setAlert(text); setTimeout(()=>setAlert(""),4000);
  },[]);

  // ── UPDATE USER (saves to Supabase) ──────────────────────────────────────────
  const updateUser = useCallback(async (u)=>{
    setUser(u);
    setUsers(prev=>prev.map(x=>x.email===u.email?u:x));
    try {
      await supabase.from("vx_users").upsert({
        id:u.id, name:u.name, email:u.email, password:u.password,
        balance:u.balance, portfolio:u.portfolio,
        holdings:u.holdings, staking:u.staking,
        joined:u.joined, verified:u.verified,
        status:u.status, tier:u.tier,
      });
    } catch(e) {
      const all = JSON.parse(localStorage.getItem("vx_users")||"[]").map(x=>x.email===u.email?u:x);
      localStorage.setItem("vx_users", JSON.stringify(all));
    }
  },[]);

  // ── ADD TRANSACTION ──────────────────────────────────────────────────────────
  const addTx = useCallback(async (email, tx)=>{
    setTxHistory(prev=>({...prev,[email]:[tx,...(prev[email]||[])]}));
    try {
      await supabase.from("vx_transactions").insert({
        id:tx.id, user_email:email, type:tx.type,
        symbol:tx.symbol, amount:tx.amount, value:tx.value,
        fee:tx.fee, status:tx.status, date:tx.date,
      });
    } catch(e) {
      const hist = JSON.parse(localStorage.getItem("vx_history")||"{}");
      hist[email] = [tx,...(hist[email]||[])];
      localStorage.setItem("vx_history", JSON.stringify(hist));
    }
  },[]);

  const getTxs = useCallback((email)=>txHistory[email]||[],[txHistory]);

  // ── SET USERS (saves to Supabase) ────────────────────────────────────────────
  const setUsersAndSave = useCallback((updater)=>{
  setUsers(prev=>{
    const next = typeof updater==="function" ? updater(prev) : updater;
    // Save to localStorage immediately
    localStorage.setItem("vx_users", JSON.stringify(next));
    // Save to Supabase async
    (async () => {
      try {
        for (const u of next) {
          await supabase.from("vx_users").upsert({
            id:u.id, name:u.name, email:u.email, password:u.password,
            balance:u.balance, portfolio:u.portfolio,
            holdings:u.holdings, staking:u.staking,
            joined:u.joined, verified:u.verified,
            status:u.status, tier:u.tier,
          });
        }
      } catch(e) { console.warn("Supabase save failed", e); }
    })();
    return next;
  });
},[]);

  // ── SET PENDING (saves to Supabase) ──────────────────────────────────────────
  const setPendingAndSave = useCallback((updater)=>{
    setPending(prev=>{
      const next = typeof updater==="function" ? updater(prev) : updater;
      supabase.from("vx_pending").delete().neq("id","__none__")
        .then(()=>{
          if(next.length>0){
            supabase.from("vx_pending").insert(next.map(t=>({
              id:t.id, user_email:t.user||t.user_email,
              type:t.type, coin:t.coin,
              amount:t.amount, usd:t.usd, fee:t.fee,
              submitted:t.submitted, network:t.network,
            }))).catch(()=>{});
          }
        }).catch(()=>{});
      localStorage.setItem("vx_pending", JSON.stringify(next));
      return next;
    });
  },[]);

  // ── SET FEE REQUESTS (saves to Supabase) ─────────────────────────────────────
  const setFeeReqsAndSave = useCallback((updater)=>{
    setFeeReqs(prev=>{
      const next = typeof updater==="function" ? updater(prev) : updater;
      supabase.from("vx_fees").delete().neq("id","__none__")
        .then(()=>{
          if(next.length>0){
            supabase.from("vx_fees").insert(next.map(r=>({
              id:r.id, user_email:r.user||r.user_email,
              amount:r.amount, reason:r.reason,
              currency:r.currency, created:r.created, status:r.status,
            }))).catch(()=>{});
          }
        }).catch(()=>{});
      localStorage.setItem("vx_fees", JSON.stringify(next));
      return next;
    });
  },[]);

  const removePending = useCallback((id,label="Transaction")=>{
    setPendingAndSave(prev=>prev.filter(t=>t.id!==id));
    showToast(label+" processed","info");
  },[setPendingAndSave,showToast]);

  const doLogout = useCallback(()=>{
    setUser(null); setView("landing"); showToast("Signed out");
  },[showToast]);

  // Loading spinner while fetching from Supabase
  if (loading) {
    return (
      <div style={{background:"#07050f",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        <div style={{width:44,height:44,borderRadius:"50%",border:"3px solid rgba(138,43,226,.2)",borderTopColor:"#a855f7",animation:"spin 0.8s linear infinite"}}/>
        <div style={{color:"#9d8ec4",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Loading VaultX…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const value = {
    view, setView,
    user, setUser,
    dashTab, setDashTab,
    adminTab, setAdminTab,
    users,
    setUsers: setUsersAndSave,
    txHistory, setTxHistory,
    pending,
    setPending: setPendingAndSave,
    feeReqs,
    setFeeReqs: setFeeReqsAndSave,
    toast, setToast,
    modal, setModal,
    alert, setAlert,
    showToast, showAlert,
    updateUser, addTx, getTxs,
    removePending, doLogout,
    supabase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
