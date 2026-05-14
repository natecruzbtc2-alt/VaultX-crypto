'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

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

function createHoldings(portfolio = 0) {
  const weights = [0.35, 0.25, 0.18, 0.12, 0.1];
  return COINS.slice(0, 5).map((coin, idx) => ({
    sym: coin.sym,
    qty: +((portfolio * weights[idx]) / (BASE_PRICES[coin.sym] || 1)).toFixed(6),
  }));
}

function createStaking(portfolio = 0) {
  return [
    { sym: "ETH", qty: +((portfolio * 0.04) / BASE_PRICES.ETH).toFixed(6), apy: 4.8 },
    { sym: "SOL", qty: +((portfolio * 0.03) / BASE_PRICES.SOL).toFixed(6), apy: 7.2 },
    { sym: "ADA", qty: +((portfolio * 0.02) / BASE_PRICES.ADA).toFixed(6), apy: 5.1 },
  ].filter((s) => s.qty > 0);
}

function genUsers(n = 12) {
  const names = ["Alice Kovacs","Bob Tanaka","Clara Osei","Dave Müller","Emma Petit","Frank Lima",
    "Grace Yip","Hana Sato","Ivan Sokov","Julia Mao","Kevin Park","Lisa Torres"];
  return names.slice(0,n).map((name,i) => {
    const portfolio = +(Math.random()*40000+500).toFixed(2);
    return {
      id: `U${String(i+1).padStart(4,"0")}`,
      name,
      email: name.toLowerCase().replace(/ /g,".")+`@email.com`,
      balance: +(Math.random()*50000+1000).toFixed(2),
      portfolio,
      holdings: createHoldings(portfolio),
      staking: createStaking(portfolio),
      joined: new Date(Date.now() - (i*30+10)*86400000).toLocaleDateString(),
      verified: i % 3 !== 2,
      status: i % 5 === 4 ? "Suspended" : "Active",
      tier: ["Basic","Pro","Elite"][i%3],
    };
  });
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
  const [users, setUsers] = useState(genUsers);
  const [history]  = useState(genHistory);
  const [pending, setPending]  = useState(genPendingTx);
  const [feeRequests, setFeeRequests] = useState([]);
  const [toast, setToast]     = useState(null);
  const [modal, setModal]     = useState(null);
  const [loginForm, setLoginForm] = useState({ email:"", password:"", admin:"", adminPw:"", adminMode:false });
  const [regForm, setRegForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [sendForm, setSendForm] = useState({ coin:"BTC", amount:"", address:"" });
  const [tradeForm, setTradeForm] = useState({ coin:"BTC", side:"buy", amount:"" });
  const [adminDepositForm, setAdminDepositForm] = useState({ user:"", coin:"BTC", amount:"", network:"ERC-20" });
  const [adminUserForm, setAdminUserForm] = useState({ name:"", email:"", password:"", tier:"Basic" });
  const [feeRequestForm, setFeeRequestForm] = useState({ user:"", amount:"", reason:"Service fee", currency:"USD" });
  const [withdrawRequestForm, setWithdrawRequestForm] = useState({ user:"", coin:"BTC", amount:"", network:"ERC-20" });
  const [googleUser, setGoogleUser] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ text:"", type:"" });
  const tickerRef = useRef();

  const handleLoginInput = (e) => {
    const { name, value } = e.target;
    setLoginForm((f) => ({ ...f, [name]: value }));
  };
  const handleRegInput = (e) => {
    const { name, value } = e.target;
    setRegForm((f) => ({ ...f, [name]: value }));
  };
  const handleTradeInput = (e) => {
    const { name, value } = e.target;
    setTradeForm((f) => ({ ...f, [name]: value }));
  };
  const handleSendInput = (e) => {
    const { name, value } = e.target;
    setSendForm((f) => ({ ...f, [name]: value }));
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.email === updatedUser.email ? updatedUser : u)));
  };

  const toast$ = useCallback((msg, type="info") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  },[]);

  const handleTradeOrder = () => {
    const amount = Number(tradeForm.amount);
    const coin = tradeForm.coin;
    const side = tradeForm.side;
    if (!user) { showAlert("Please sign in first"); return; }
    if (!amount || amount <= 0) { showAlert("Enter a valid trade amount"); return; }
    const price = prices[coin]?.price || 1;
    const qty = +(amount / price).toFixed(6);
    const currentHolding = user.holdings?.find((h) => h.sym === coin) || { qty: 0 };
    if (side === "buy") {
      if (amount > user.balance) { showAlert("Insufficient USD balance"); return; }
      const updatedHoldings = [...(user.holdings || [])];
      const idx = updatedHoldings.findIndex((h) => h.sym === coin);
      if (idx !== -1) {
        updatedHoldings[idx] = { ...updatedHoldings[idx], qty: +(updatedHoldings[idx].qty + qty).toFixed(6) };
      } else {
        updatedHoldings.push({ sym: coin, qty });
      }
      const updated = {
        ...user,
        balance: +(user.balance - amount).toFixed(2),
        portfolio: +(user.portfolio + amount).toFixed(2),
        holdings: updatedHoldings,
      };
      updateCurrentUser(updated);
      toast$("Buy order placed", "success");
      setTradeForm((f) => ({ ...f, amount: "" }));
      return;
    }
    if (qty > currentHolding.qty) { showAlert(`Not enough ${coin} to sell`); return; }
    const updatedHoldings = (user.holdings || [])
      .map((h) => (h.sym === coin ? { ...h, qty: +(h.qty - qty).toFixed(6) } : h))
      .filter((h) => h.qty > 0);
    const updated = {
      ...user,
      balance: +(user.balance + amount).toFixed(2),
      portfolio: Math.max(0, +(user.portfolio - amount).toFixed(2)),
      holdings: updatedHoldings,
    };
    updateCurrentUser(updated);
    toast$("Sell order placed", "success");
    setTradeForm((f) => ({ ...f, amount: "" }));
  };

  const handleSendCrypto = () => {
    const amount = Number(sendForm.amount);
    const coin = sendForm.coin;
    const address = sendForm.address.trim();
    if (!user) { showAlert("Please sign in first"); return; }
    if (!address) { showAlert("Enter recipient address"); return; }
    if (!amount || amount <= 0) { showAlert("Enter a valid amount"); return; }
    const price = prices[coin]?.price || 1;
    const qty = +(amount / price).toFixed(6);
    const currentHolding = user.holdings?.find((h) => h.sym === coin) || { qty: 0 };
    if (qty > currentHolding.qty) { showAlert(`Insufficient ${coin} balance`); return; }
    const updatedHoldings = (user.holdings || [])
      .map((h) => (h.sym === coin ? { ...h, qty: +(h.qty - qty).toFixed(6) } : h))
      .filter((h) => h.qty > 0);
    const updated = {
      ...user,
      portfolio: Math.max(0, +(user.portfolio - amount).toFixed(2)),
      holdings: updatedHoldings,
    };
    updateCurrentUser(updated);
    setSendForm({ coin: "BTC", amount: "", address: "" });
    toast$(`Sent ${qty} ${coin} to ${address.slice(0, 6)}…`, "success");
  };

  useEffect(() => {
    let active = true;
    const fetchCoinbasePrices = async () => {
      try {
        const results = await Promise.all(COINS.map(async (c) => {
          const res = await fetch(`https://api.coinbase.com/v2/prices/${c.sym}-USD/spot`);
          const json = await res.json();
          const price = Number(json?.data?.amount);
          return [c.sym, price];
        }));
        if (!active) return;
        setPrices(prev => {
          const next = { ...prev };
          results.forEach(([sym, price]) => {
            if (!price || !next[sym]) return;
            const old = next[sym];
            const change = +((price - old.price) / Math.max(old.price, 1) * 100).toFixed(2);
            const spark = [...old.spark.slice(1), price];
            next[sym] = { price, change, spark };
          });
          return next;
        });
      } catch (err) {
        console.warn("Coinbase price update failed", err);
      }
    };
    fetchCoinbasePrices();
    const id = setInterval(fetchCoinbasePrices, 10000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // simulate live prices
  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = {...prev};
        COINS.forEach(c => {
          const old = next[c.sym];
          const newPrice = old.price * (1 + (Math.random()-0.495)*0.002);
          const spark = [...old.spark.slice(1), newPrice];
          next[c.sym] = { price: newPrice, change: +(old.change + (Math.random()-0.495)*0.05).toFixed(2), spark };
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

  const contactSupport = () => {
    window.open("mailto:support@vaultxcrypto.io?subject=VaultXcrypto%20Deposit%20Support", "_blank");
    toast$("Opening support contact...", "info");
  };

  const doLogin = () => {
    if (!loginForm.email || !loginForm.password) { showAlert("Fill in all fields"); return; }
    const u = users.find(u => u.email === loginForm.email);
    if (!u) { showAlert("User not found"); return; }
    if (u.password && u.password !== loginForm.password) { showAlert("Invalid credentials"); return; }
    setUser(u); setView("dashboard"); setDashTab("overview"); toast$("Welcome back, "+u.name.split(" ")[0]+"!", "success");
  };
  const doAdminLogin = () => {
    if (loginForm.admin !== ADMIN_USER.username || loginForm.adminPw !== ADMIN_USER.password) { showAlert("Invalid admin credentials"); return; }
    setIsAdmin(true); setView("admin"); setAdminTab("users"); toast$("Admin panel loaded", "success");
  };
  const doAdminDeposit = () => {
    const target = adminDepositForm.user || users[0]?.email;
    const amount = Number(adminDepositForm.amount);
    if (!target || !amount || amount <= 0) { showAlert("Enter a valid deposit user and amount"); return; }
    const userIndex = users.findIndex(u => u.email === target);
    if (userIndex === -1) { showAlert("Selected user not found"); return; }
    const updated = [...users];
    updated[userIndex] = {
      ...updated[userIndex],
      balance: +(updated[userIndex].balance + amount).toFixed(2),
      portfolio: +(updated[userIndex].portfolio + amount).toFixed(2),
    };
    const depositTx = {
      id: `DP${String(pending.length+1).padStart(6,'0')}`,
      user: target,
      type: "Deposit",
      coin: adminDepositForm.coin,
      amount: +(amount / (BASE_PRICES[adminDepositForm.coin] || 1)).toFixed(6),
      usd: amount,
      fee: +(amount * 0.001).toFixed(2),
      submitted: new Date().toLocaleString(),
      network: adminDepositForm.network,
    };
    setUsers(updated);
    setPending(prev => [depositTx, ...prev]);
    setAdminDepositForm({ user:"", coin:"BTC", amount:"", network:"ERC-20" });
    toast$("Deposit credited to " + target, "success");
  };

  const doAdminCreateWithdrawRequest = () => {
    const target = withdrawRequestForm.user || users[0]?.email;
    const amount = Number(withdrawRequestForm.amount);
    if (!target || !amount || amount <= 0) { showAlert("Enter a valid withdrawal user and amount"); return; }
    const tx = {
      id: `WD${String(pending.length+1).padStart(6,'0')}`,
      user: target,
      type: "Withdrawal",
      coin: withdrawRequestForm.coin,
      amount: +(amount / (BASE_PRICES[withdrawRequestForm.coin] || 1)).toFixed(6),
      usd: amount,
      fee: +(amount * 0.0015).toFixed(2),
      submitted: new Date().toLocaleString(),
      network: withdrawRequestForm.network,
    };
    setPending(prev => [tx, ...prev]);
    setWithdrawRequestForm({ user:"", coin:"BTC", amount:"", network:"ERC-20" });
    toast$("Withdrawal request created for " + target, "success");
  };

  const doAdminRequestFee = () => {
    const target = feeRequestForm.user || users[0]?.email;
    const amount = Number(feeRequestForm.amount);
    if (!target || !amount || amount <= 0) { showAlert("Enter a valid fee amount and client"); return; }
    const feeTx = {
      id: `FR${String(feeRequests.length+1).padStart(5,'0')}`,
      user: target,
      amount,
      reason: feeRequestForm.reason || "Service fee",
      currency: feeRequestForm.currency,
      created: new Date().toLocaleString(),
      status: "Pending",
    };
    setFeeRequests(prev => [feeTx, ...prev]);
    setFeeRequestForm({ user:"", amount:"", reason:"Service fee", currency:"USD" });
    toast$("Fee request issued to " + target, "success");
  };

  const removeFeeRequest = (id) => {
    setFeeRequests(prev => prev.filter(r => r.id !== id));
    toast$("Fee request removed", "info");
  };

  const doGoogleLogin = (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) { showAlert("Google login failed"); return; }
    try {
      const profile = jwt_decode(token);
      const email = profile?.email;
      if (!email) { showAlert("Google login did not return email"); return; }
      let existing = users.find(u => u.email === email);
      if (!existing) {
        existing = {
          id: `U${String(users.length + 1).padStart(4,'0')}`,
          name: profile?.name || profile?.email.split('@')[0],
          email,
          password: "",
          balance: 0,
          portfolio: 0,
          joined: new Date().toLocaleDateString(),
          verified: true,
          status: "Active",
          tier: "Basic",
        };
        setUsers(prev => [existing, ...prev]);
      }
      setUser(existing);
      setView("dashboard");
      setDashTab("overview");
      setGoogleUser(profile);
      toast$("Signed in with Google as " + existing.name, "success");
    } catch (err) {
      console.error(err);
      showAlert("Google authentication failed");
    }
  };

  const doGoogleError = () => {
    showAlert("Google authentication failed", "error");
  };
  const doRegister = () => {
    const {name,email,password,confirm} = regForm;
    if (!name||!email||!password||!confirm) { showAlert("All fields required"); return; }
    if (password !== confirm) { showAlert("Passwords don't match"); return; }
    const newUser = {
      id: `U${String(users.length+1).padStart(4,'0')}`,
      name,
      email,
      password,
      balance: 0,
      portfolio: 0,
      holdings: createHoldings(0),
      staking: createStaking(0),
      joined: new Date().toLocaleDateString(),
      verified: true,
      status: "Active",
      tier: "Basic",
    };
    setUsers(prev => [...prev, newUser]);
    setLoginForm({ ...loginForm, email, password: "" });
    setRegForm({ name:"", email:"", password:"", confirm:"" });
    toast$("Account created! Please sign in.", "success");
    setView("login");
  };
  const doLogout = () => { setUser(null); setIsAdmin(false); setView("landing"); toast$("Signed out"); };

  const removePendingTx = (txId, label = "Transaction") => {
    setPending(prev => prev.filter(tx => tx.id !== txId));
    toast$(label + " removed from queue", "info");
  };

  const doAdminAddUser = () => {
    const { name, email, password, tier } = adminUserForm;
    if (!name || !email || !password) {
      showAlert("Name, email, and password are required");
      return;
    }
    if (users.some(u => u.email === email)) {
      showAlert("A user with that email already exists");
      return;
    }
    const newUser = {
      id: `U${String(users.length + 1).padStart(4, '0')}`,
      name,
      email,
      password,
      balance: 0,
      portfolio: 0,
      holdings: createHoldings(0),
      staking: createStaking(0),
      joined: new Date().toLocaleDateString(),
      verified: true,
      status: "Active",
      tier,
    };
    setUsers(prev => [newUser, ...prev]);
    setAdminUserForm({ name:"", email:"", password:"", tier:"Basic" });
    toast$("Client added successfully", "success");
  };

  const doAdminRemoveUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast$("Client removed successfully", "info");
  };

  const fmt = (n, d=2) => typeof n === "number" ? n.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : n;
  const fmtP = (v) => { const c = v>=0 ? "#22c55e":"#ef4444"; return <span style={{color:c}}>{v>=0?"+":""}{fmt(v)}%</span>; };

  const totalPortfolioValue = COINS.slice(0,4).reduce((a,c,i) => a + (prices[c.sym]?.price||0)*(0.05/(i+1)), 0);
  const totalFees = pending.reduce((a,b) => a+b.fee, 0);
  const pendingWithdrawals = pending.filter(p => p.type === "Withdrawal");
  const pendingDeposits    = pending.filter(p => p.type === "Deposit");

  // ── STYLES ──────────────────────────────────────────────────────────────────
  const S = {
    app: { fontFamily:"'DM Sans',system-ui,sans-serif", background:"radial-gradient(circle at top left,#0b1120 0%,#02040f 35%,#02040f 100%)", color:"#e2e8f0", minHeight:"100vh", fontSize:14, lineHeight:1.5 },
    nav: { background:"rgba(6,11,23,.94)", backdropFilter:"blur(18px)", borderBottom:"1px solid rgba(255,255,255,.08)", padding:"0 24px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 24px 80px rgba(0,0,0,.2)" },
    logo: { display:"flex", alignItems:"center", gap:10, fontSize:18, fontWeight:700, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:"#f8fafc" },
    logoMark: { width:36, height:36, background:"linear-gradient(135deg,#6366f1,#06b6d4)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" },
    ticker: { background:"rgba(15,23,42,.85)", borderBottom:"1px solid rgba(255,255,255,.08)", padding:"8px 0", overflow:"hidden", whiteSpace:"nowrap" },
    btn: (v="primary") => ({
      cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, borderRadius:12,
      padding:"10px 18px", border:"none", display:"inline-flex", alignItems:"center", gap:8,
      background: v==="primary"?"linear-gradient(135deg,#6366f1,#06b6d4)" : v==="danger"?"linear-gradient(135deg,#dc2626,#f97316)" : v==="success"?"linear-gradient(135deg,#22c55e,#14b8a6)" : "rgba(255,255,255,.08)",
      color:v==="ghost"?"#e2e8f0":"#fff", boxShadow: v==="ghost"?"inset 0 0 0 1px rgba(255,255,255,.08)" : "0 12px 30px rgba(0,0,0,.18)", transition:"transform .15s,opacity .15s,box-shadow .15s",
      transform:"translateZ(0)",
      minHeight:36,
      justifyContent:"center",
    }),
    card: { background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:22, boxShadow:"0 24px 60px rgba(0,0,0,.15)" },
    scard: { background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:16, boxShadow:"inset 0 0 0 1px rgba(255,255,255,.04)" },
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
                <div style={{marginBottom:12}}><label style={S.label}>Email</label><input name="email" type="email" autoComplete="username" autoFocus style={S.inp} placeholder="you@email.com" value={loginForm.email} onChange={handleLoginInput}/></div>
                <div style={{marginBottom:16}}><label style={S.label}>Password</label><input name="password" type="password" autoComplete="current-password" style={S.inp} placeholder="••••••••" value={loginForm.password} onChange={handleLoginInput}/></div>
                <button style={{...S.btn(),width:"100%",padding:"11px",justifyContent:"center"}} onClick={doLogin}>Sign In →</button>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <div style={{marginTop:12,display:"flex",justifyContent:"center"}}>
                    <GoogleLogin onSuccess={doGoogleLogin} onError={doGoogleError} />
                  </div>
                ) : (
                  <div style={{fontSize:11,color:"#64748b",marginTop:12}}>Google sign-in available after setting VITE_GOOGLE_CLIENT_ID.</div>
                )}
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
                <div style={{marginBottom:12}}><label style={S.label}>Username</label><input name="admin" type="text" autoComplete="username" autoFocus style={S.inp} placeholder="admin" value={loginForm.admin} onChange={handleLoginInput}/></div>
                <div style={{marginBottom:16}}><label style={S.label}>Password</label><input name="adminPw" type="password" autoComplete="current-password" style={S.inp} placeholder="••••••••" value={loginForm.adminPw} onChange={handleLoginInput}/></div>
                <button style={{...S.btn(),width:"100%",padding:"11px",justifyContent:"center"}} onClick={doAdminLogin}>Admin Sign In →</button>
                <div style={{textAlign:"center",marginTop:12}}><span style={{fontSize:11,color:"#334155",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setLoginForm(f=>({...f,adminMode:false}))}>← Back to user login</span></div>
              </>
            )
          ) : (
            <>
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div style={{marginTop:12,display:"flex",justifyContent:"center"}}>
                  <GoogleLogin onSuccess={doGoogleLogin} onError={doGoogleError} />
                </div>
              ) : (
                <div style={{fontSize:11,color:"#64748b",marginTop:12}}>Google sign-up ready after setting VITE_GOOGLE_CLIENT_ID.</div>
              )}
              <div style={{fontSize:22,fontWeight:700,marginBottom:4,color:"#f1f5f9"}}>Create account</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:22}}>Join VaultXcrypto platform</div>
              {alertMsg.text && <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"9px 13px",fontSize:13,color:"#f87171",marginBottom:12}}>{alertMsg.text}</div>}
              {[["Full name","text","John Smith","name"],["Email","email","you@email.com","email"],["Password","password","Min 6 chars","password"],["Confirm password","password","Repeat password","confirm"]].map(([lbl,type,ph,key])=>(
                <div key={key} style={{marginBottom:12}}><label style={S.label}>{lbl}</label><input name={key} autoComplete={key === "name" ? "name" : key === "email" ? "email" : "new-password"} autoFocus={key === "name"} style={S.inp} type={type} placeholder={ph} value={regForm[key]} onChange={e=>setRegForm(f=>({...f,[key]:e.target.value}))}/></div>
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
            <select name="coin" style={{...S.inp,cursor:"pointer"}} value={sendForm.coin} onChange={handleSendInput}>
              {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price<1?prices[c.sym]?.price.toFixed(4):fmt(prices[c.sym]?.price)}</option>)}
            </select>
          </div>
          <div style={{marginBottom:12}}><label style={S.label}>Recipient Address</label><input name="address" style={S.inp} placeholder="0x..." autoComplete="off" value={sendForm.address} onChange={handleSendInput}/></div>
          <div style={{marginBottom:16}}><label style={S.label}>Amount</label><input name="amount" style={S.inp} type="number" inputMode="decimal" autoComplete="off" placeholder="0.00" value={sendForm.amount} onChange={handleSendInput}/></div>
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
      <div style={{...S.card,marginBottom:20}}>
        <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Add New Client</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
          <div><label style={S.label}>Full Name</label><input style={S.inp} value={adminUserForm.name} onChange={e=>setAdminUserForm(f=>({...f,name:e.target.value}))} placeholder="Jane Doe"/></div>
          <div><label style={S.label}>Email</label><input style={S.inp} value={adminUserForm.email} onChange={e=>setAdminUserForm(f=>({...f,email:e.target.value}))} placeholder="jane.doe@email.com"/></div>
          <div><label style={S.label}>Password</label><input type="password" style={S.inp} value={adminUserForm.password} onChange={e=>setAdminUserForm(f=>({...f,password:e.target.value}))} placeholder="••••••"/></div>
          <div><label style={S.label}>Tier</label><select style={S.inp} value={adminUserForm.tier} onChange={e=>setAdminUserForm(f=>({...f,tier:e.target.value}))}>
              {['Basic','Pro','Elite'].map(t=><option key={t} value={t}>{t}</option>)}
            </select></div>
        </div>
        <button style={{...S.btn("success"),padding:"10px 18px"}} onClick={doAdminAddUser}>Add Client</button>
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
                      <button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>doAdminRemoveUser(u.id)}>Remove</button>
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
      <div style={{...S.card,marginBottom:20}}>
        <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Create Withdrawal Request</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
          <div><label style={S.label}>User</label><select style={S.inp} value={withdrawRequestForm.user} onChange={e=>setWithdrawRequestForm(f=>({...f,user:e.target.value}))}>
              <option value="">Select client</option>
              {users.map(u=><option key={u.email} value={u.email}>{u.name} ({u.email})</option>)}
            </select></div>
          <div><label style={S.label}>Coin</label><select style={S.inp} value={withdrawRequestForm.coin} onChange={e=>setWithdrawRequestForm(f=>({...f,coin:e.target.value}))}>
              {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}
            </select></div>
          <div><label style={S.label}>Network</label><select style={S.inp} value={withdrawRequestForm.network} onChange={e=>setWithdrawRequestForm(f=>({...f,network:e.target.value}))}>
              {['ERC-20','BEP-20','TRC-20','Native'].map(net=><option key={net} value={net}>{net}</option>)}
            </select></div>
          <div><label style={S.label}>Amount (USD)</label><input type="number" min="0" style={S.inp} value={withdrawRequestForm.amount} onChange={e=>setWithdrawRequestForm(f=>({...f,amount:e.target.value}))} placeholder="1000"/></div>
        </div>
        <button style={{...S.btn("success"),padding:"10px 18px"}} onClick={doAdminCreateWithdrawRequest}>Create Request</button>
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
                <td style={S.td}><div style={S.row}><button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>removePendingTx(tx.id, "Withdrawal approved")}>Approve</button><button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>removePendingTx(tx.id, "Withdrawal removed")}>Remove</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AdminDeposits = () => (
    <div>
      <div style={{...S.rowsb,flexWrap:"wrap",gap:20}}>
        <div>
          <div style={S.hd}>Deposit Desk</div>
          <div style={S.sub}>Admin-managed deposits and vault funding</div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <div style={{...S.scard,background:"rgba(56,189,248,.08)",borderLeft:"4px solid #38bdf8"}}>
            <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Vault Reserve</div>
            <div style={{fontSize:24,fontWeight:700,color:"#f1f5f9"}}>${fmt(users.reduce((a,u)=>a+u.balance,0) + pending.reduce((a,b)=>a+b.usd,0))}</div>
          </div>
          <div style={{...S.scard,background:"rgba(34,197,94,.08)",borderLeft:"4px solid #22c55e"}}>
            <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:6}}>Recent deposits</div>
            <div style={{fontSize:24,fontWeight:700,color:"#f1f5f9"}}>${fmt(pendingDeposits.slice(0,5).reduce((a,b)=>a+b.usd,0))}</div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",gap:20,marginTop:20,marginBottom:20}}>
        <div style={{...S.card,background:"rgba(15,23,42,.95)",border:"1px solid rgba(255,255,255,.07)",boxShadow:"0 24px 80px rgba(0,0,0,.18)"}}>
          <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Manual Vault Deposit</div>
          <div style={{display:"grid",gap:12}}>
            <div><label style={S.label}>User</label><select name="user" style={S.inp} value={adminDepositForm.user} onChange={e=>setAdminDepositForm(f=>({...f,[e.target.name]:e.target.value}))}>
                <option value="">Select user</option>
                {users.map(u=><option key={u.email} value={u.email}>{u.name} ({u.email})</option>)}
              </select></div>
            <div><label style={S.label}>Coin</label><select name="coin" style={S.inp} value={adminDepositForm.coin} onChange={e=>setAdminDepositForm(f=>({...f,[e.target.name]:e.target.value}))}>
                {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}
              </select></div>
            <div><label style={S.label}>Network</label><select name="network" style={S.inp} value={adminDepositForm.network} onChange={e=>setAdminDepositForm(f=>({...f,[e.target.name]:e.target.value}))}>
                {['ERC-20','BEP-20','TRC-20','Native'].map(net=><option key={net} value={net}>{net}</option>)}
              </select></div>
            <div><label style={S.label}>Amount (USD)</label><input name="amount" type="number" min="0" style={S.inp} placeholder="1000" value={adminDepositForm.amount} onChange={e=>setAdminDepositForm(f=>({...f,[e.target.name]:e.target.value}))}/></div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button style={{...S.btn("success"),flex:1,justifyContent:"center"}} onClick={doAdminDeposit}>Credit Deposit</button>
              <button style={{...S.btn("ghost"),flex:1,justifyContent:"center"}} onClick={()=>setAdminDepositForm({user:"",coin:"BTC",amount:"",network:"ERC-20"})}>Reset</button>
            </div>
            <div style={{fontSize:12,color:"#94a3b8"}}>This action credits the selected user's balance and logs a deposit transaction in the vault ledger.</div>
          </div>
        </div>
        <div style={{...S.card,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)",padding:24}}>
          <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Vault Health</div>
          <div style={{display:"grid",gap:12}}>
            {[
              {label:"Total Users",value:users.length},
              {label:"Tickers Active",value:COINS.length},
              {label:"Pending Deposits",value:pendingDeposits.length},
              {label:"Vault Equity",value:"$"+fmt(users.reduce((a,u)=>a+u.balance,0))},
            ].map(item=>(
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:"rgba(255,255,255,.04)",borderRadius:12}}>
                <span style={{color:"#94a3b8"}}>{item.label}</span>
                <strong style={{color:"#f1f5f9"}}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{overflowX:"auto"}}>
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
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={{...S.btn("success"),padding:"3px 10px",fontSize:11}} onClick={()=>removePendingTx(tx.id, "Deposit confirmed")}>Confirm</button>
                      <button style={{...S.btn("danger"),padding:"3px 10px",fontSize:11}} onClick={()=>removePendingTx(tx.id, "Deposit removed")}>Remove</button>
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

  const AdminFees = () => {
    const tradeFeesTotal  = history.reduce((a,b)=>a+b.fee,0);
    const networkFees = pending.reduce((a,b)=>a+b.fee*0.4,0);
    const platformRev = tradeFeesTotal * 0.6;
    return (
      <div>
        <div style={S.rowsb}>
          <div>
            <div style={S.hd}>Fee Collection</div>
            <div style={S.sub}>Issue fee requests and collect payments from clients</div>
          </div>
          <button style={S.btn("success")} onClick={()=>toast$("Fee collection dashboard refreshed","success")}>Refresh</button>
        </div>

        <div style={S.g4}>
          {[
            {l:"Active Clients",v:users.length,c:"#818cf8",icon:"👥"},
            {l:"Pending Requests",v:feeRequests.length,c:"#4ade80",icon:"⏳"},
            {l:"Collected Fees",v:"$"+fmt(platformRev),c:"#fb923c",icon:"💰"},
            {l:"Coinbase Sync",v:"Live",c:"#38bdf8",icon:"🔗"},
          ].map((s,i)=>(
            <div key={i} style={{...S.card,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:12,right:14,fontSize:22}}>{s.icon}</div>
              <div style={{fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>{s.l}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        <div style={{...S.card,marginTop:16}}>
          <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Request Fee Payment</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
            <div><label style={S.label}>Client</label><select style={S.inp} value={feeRequestForm.user} onChange={e=>setFeeRequestForm(f=>({...f,user:e.target.value}))}>
                <option value="">Select client</option>
                {users.map(u=><option key={u.email} value={u.email}>{u.name} ({u.email})</option>)}
              </select></div>
            <div><label style={S.label}>Amount</label><input type="number" min="1" style={S.inp} value={feeRequestForm.amount} onChange={e=>setFeeRequestForm(f=>({...f,amount:e.target.value}))} placeholder="100"/></div>
            <div><label style={S.label}>Currency</label><select style={S.inp} value={feeRequestForm.currency} onChange={e=>setFeeRequestForm(f=>({...f,currency:e.target.value}))}>
                {['USD','BTC','ETH'].map(c=><option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label style={S.label}>Reason</label><input style={S.inp} value={feeRequestForm.reason} onChange={e=>setFeeRequestForm(f=>({...f,reason:e.target.value}))} placeholder="Maintenance fee"/></div>
          </div>
          <button style={{...S.btn("success"),padding:"10px 18px"}} onClick={doAdminRequestFee}>Send Fee Request</button>
        </div>

        <div style={{...S.card,marginTop:14}}>
          <div style={{fontSize:15,fontWeight:600,color:"#e2e8f0",marginBottom:14}}>Outstanding Fee Requests</div>
          <div style={{overflowX:"auto"}}>
            <table style={S.tbl}>
              <thead><tr>{["Req ID","Client","Amount","Reason","Currency","Status","Created","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {feeRequests.length > 0 ? feeRequests.map(req=>(
                  <tr key={req.id} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.02)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{...S.td,fontFamily:"monospace",color:"#64748b",fontSize:11}}>{req.id}</td>
                    <td style={{...S.td,fontSize:12}}>{req.user}</td>
                    <td style={{...S.td,fontFamily:"monospace"}}>{req.amount}</td>
                    <td style={{...S.td}}>{req.reason}</td>
                    <td style={{...S.td,fontFamily:"monospace"}}>{req.currency}</td>
                    <td style={S.td}><span style={S.tag(req.status==="Pending"?"yellow":"green")}>{req.status}</span></td>
                    <td style={{...S.td,color:"#64748b"}}>{req.created}</td>
                    <td style={S.td}><button style={{...S.btn("danger"),padding:"4px 10px",fontSize:11}} onClick={()=>removeFeeRequest(req.id)}>Remove</button></td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} style={{...S.td,textAlign:"center",color:"#94a3b8"}}>No fee requests created yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
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
          <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>Deposit Support</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:18}}>Crypto deposits require a real wallet generated by our team.</div>
          <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:18,marginBottom:18}}>
            <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:10}}>How it works</div>
            <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>
              For security and compliance, we do not generate deposit wallets automatically. Please contact our support team and we will provide a dedicated wallet address for your deposit.
            </div>
          </div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>
            Contact us for crypto deposit setup: support@vaultxcrypto.io
          </div>
          <div style={{display:"flex",gap:10}}>
            <button style={{...S.btn("success"),flex:1,justifyContent:"center"}} onClick={contactSupport}>Contact Support</button>
            <button style={{...S.btn("ghost"),flex:1,justifyContent:"center"}} onClick={close}>Close</button>
          </div>
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
