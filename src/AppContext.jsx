import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rrbdeqhxrdbtzjuhmrst.supabase.co",
  "sb_publishable_8aLEoyOMisBF80u72nOYlg__FP9eC5b"
);

export const COINS = [
  { sym:"BTC",  name:"Bitcoin",   color:"#F7931A", bg:"#1a0f00" },
  { sym:"ETH",  name:"Ethereum",  color:"#7B8CDE", bg:"#0a0d1a" },
  { sym:"SOL",  name:"Solana",    color:"#9945FF", bg:"#0d0020" },
  { sym:"BNB",  name:"BNB",       color:"#F0B90B", bg:"#1a1200" },
  { sym:"XRP",  name:"XRP",       color:"#00AAE4", bg:"#001520" },
  { sym:"ADA",  name:"Cardano",   color:"#4A90E2", bg:"#000d1a" },
  { sym:"DOGE", name:"Dogecoin",  color:"#C2A633", bg:"#181200" },
  { sym:"USDT", name:"Tether",    color:"#26A17B", bg:"#002318" },
];

export const BASE_PRICES = {
  BTC:67842, ETH:3521, SOL:172, BNB:598,
  XRP:0.62, ADA:0.48, DOGE:0.14, USDT:1.00
};

export const ADMIN_CREDS = { username:"admin", password:"admin123" };

export const fmt = (n, d=2) => typeof n==="number"
  ? n.toLocaleString("en-US", { minimumFractionDigits:d, maximumFractionDigits:d })
  : String(n ?? "");

export const fmtCrypto = (n) => typeof n==="number" ? n.toFixed(6) : "0.000000";
export const coinInfo  = sym => COINS.find(c=>c.sym===sym) || COINS[0];

function genSparkline(base, n=20) {
  const p = [base];
  for (let i=1; i<n; i++) p.push(p[i-1] * (1 + (Math.random()-.495) * .03));
  return p;
}

export function createHoldings(pf=0) {
  if (pf <= 0) return [];
  const w = [.35,.25,.18,.12,.10];
  return COINS.slice(0,5).map((c,i) => ({
    sym: c.sym,
    qty: +((pf * w[i]) / (BASE_PRICES[c.sym]||1)).toFixed(8),
    avgBuy: BASE_PRICES[c.sym],
  })).filter(h => h.qty > 0);
}

export function createStaking() { return []; }

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
export const PriceContext = createContext({});
export const AppContext   = createContext({});
export const usePrices    = () => useContext(PriceContext);
export const useApp       = () => useContext(AppContext);

// ─── PRICE PROVIDER ───────────────────────────────────────────────────────────
export function PriceProvider({ children }) {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(COINS.map(c => [c.sym, {
      price: BASE_PRICES[c.sym],
      change: +(Math.random()*10-5).toFixed(2),
      spark: genSparkline(BASE_PRICES[c.sym]),
      high: BASE_PRICES[c.sym]*1.03, low: BASE_PRICES[c.sym]*0.97,
      vol: BASE_PRICES[c.sym]*21000,
    }]))
  );

  useEffect(() => {
    let active = true;
    const go = async () => {
      try {
        const r = await Promise.all(COINS.map(async c => {
          const res = await fetch(`https://api.coinbase.com/v2/prices/${c.sym}-USD/spot`);
          const j   = await res.json();
          return [c.sym, Number(j?.data?.amount)];
        }));
        if (!active) return;
        setPrices(prev => {
          const next = {...prev};
          r.forEach(([sym, price]) => {
            if (!price || !next[sym]) return;
            const old = next[sym];
            next[sym] = {
              price, change: +((price-old.price)/Math.max(old.price,1)*100).toFixed(2),
              spark: [...old.spark.slice(1), price],
              high: Math.max(old.high||price, price), low: Math.min(old.low||price, price),
              vol: old.vol || price*21000,
            };
          });
          return next;
        });
      } catch(e) {}
    };
    go();
    const id = setInterval(go, 10000);
    return () => { active = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        const next = {...prev};
        COINS.forEach(c => {
          const o = next[c.sym], p = o.price * (1 + (Math.random()-.495)*.002);
          next[c.sym] = { ...o, price:p, change:+(o.change+(Math.random()-.495)*.05).toFixed(2), spark:[...o.spark.slice(1),p] };
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return <PriceContext.Provider value={prices}>{children}</PriceContext.Provider>;
}

// ─── HELPERS for mapping Supabase rows ────────────────────────────────────────
const mapUser = (u) => ({ ...u, holdings: u.holdings||[], staking: u.staking||[] });
const mapPending = (t) => ({ ...t, user: t.user_email || t.user });
const mapFee = (r) => ({ ...r, user: r.user_email || r.user });
const mapWallet = (w) => ({ coin:w.coin, address:w.address, network:w.network, walletName:w.wallet_name, fee:w.fee, assignedAt:w.assigned_at });

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
  const [walletAssignments, setWalletAssignments] = useState({});
  const [toast,     setToast]     = useState(null);
  const [modal,     setModal]     = useState(null);
  const [alert,     setAlert]     = useState("");
  const [loading,   setLoading]   = useState(true);

  const userRef = useRef(null);
  useEffect(() => { userRef.current = user; }, [user]);

  // ── LOAD ALL DATA ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [
        { data: usersData },
        { data: pendingData },
        { data: feesData },
        { data: txData },
        { data: walletsData },
      ] = await Promise.all([
        supabase.from("vx_users").select("*"),
        supabase.from("vx_pending").select("*"),
        supabase.from("vx_fees").select("*"),
        supabase.from("vx_transactions").select("*"),
        supabase.from("vx_wallets").select("*"),
      ]);

      if (usersData) {
        setUsers(usersData.map(mapUser));
        // refresh current logged-in user
        const cu = userRef.current;
        if (cu) {
          const fresh = usersData.find(u => u.email === cu.email);
          if (fresh) setUser(mapUser(fresh));
        }
      }
      if (pendingData) setPending(pendingData.map(mapPending));
      if (feesData)    setFeeReqs(feesData.map(mapFee));
      if (txData) {
        const hist = {};
        txData.forEach(tx => {
          if (!hist[tx.user_email]) hist[tx.user_email] = [];
          hist[tx.user_email].push(tx);
        });
        // sort each by id desc (newest first)
        Object.keys(hist).forEach(k => hist[k].sort((a,b)=>String(b.id).localeCompare(String(a.id))));
        setTxHistory(hist);
      }
      if (walletsData) {
        const wa = {};
        walletsData.forEach(w => { wa[w.user_email] = mapWallet(w); });
        setWalletAssignments(wa);
      }
    } catch(e) {
      console.warn("Load error", e);
    }
  }, []);

  // ── INITIAL LOAD + REALTIME SUBSCRIPTIONS ─────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadAll();
      if (mounted) setLoading(false);
    })();

    // Real-time: reload all data whenever ANY table changes (from any device)
    const channel = supabase
      .channel("vx_all_changes")
      .on("postgres_changes", { event:"*", schema:"public", table:"vx_users" },        () => loadAll())
      .on("postgres_changes", { event:"*", schema:"public", table:"vx_pending" },      () => loadAll())
      .on("postgres_changes", { event:"*", schema:"public", table:"vx_fees" },         () => loadAll())
      .on("postgres_changes", { event:"*", schema:"public", table:"vx_transactions" }, () => loadAll())
      .on("postgres_changes", { event:"*", schema:"public", table:"vx_wallets" },      () => loadAll())
      .subscribe();

    // Fallback: also poll every 8 seconds in case realtime isn't enabled
    const pollId = setInterval(loadAll, 8000);

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      clearInterval(pollId);
    };
  }, [loadAll]);

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type="info") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 4000);
  }, []);
  const showAlert = useCallback((text) => {
    setAlert(text); setTimeout(() => setAlert(""), 4000);
  }, []);

  const getUserFeeReqs = useCallback((email) =>
    feeReqs.filter(r => (r.user||r.user_email) === email && r.status === "Pending"),
  [feeReqs]);
  const getUserWallet = useCallback((email) => walletAssignments[email] || null, [walletAssignments]);
  const hasPendingFees = useCallback((email) => getUserFeeReqs(email).length > 0, [getUserFeeReqs]);
  const getTxs = useCallback((email) => txHistory[email] || [], [txHistory]);

  // ── WRITE OPERATIONS (all go to Supabase, realtime syncs the rest) ───────────
  const upsertUserRow = async (u) => {
    await supabase.from("vx_users").upsert({
      id:u.id, name:u.name, email:u.email, password:u.password,
      balance:u.balance, portfolio:u.portfolio,
      holdings:u.holdings||[], staking:u.staking||[],
      joined:u.joined, verified:u.verified, status:u.status, tier:u.tier,
    });
  };

  const updateUser = useCallback(async (u) => {
    setUser(u);
    setUsers(prev => prev.map(x => x.email===u.email ? u : x));
    try { await upsertUserRow(u); } catch(e) {}
  }, []);

  const addTx = useCallback(async (email, tx) => {
    setTxHistory(prev => ({ ...prev, [email]: [tx, ...(prev[email]||[])] }));
    try {
      await supabase.from("vx_transactions").insert({
        id:tx.id, user_email:email, type:tx.type, symbol:tx.symbol,
        amount:tx.amount, value:tx.value, fee:tx.fee,
        status:tx.status, date:tx.date, notes:tx.notes||"",
      });
    } catch(e) {}
  }, []);

  // Users — write to Supabase, realtime updates other clients
  const setUsersAndSave = useCallback((updater) => {
    setUsers(prev => {
      const next = typeof updater==="function" ? updater(prev) : updater;
      (async () => {
        try {
          // Find added/changed and removed
          const prevEmails = new Set(prev.map(u=>u.email));
          const nextEmails = new Set(next.map(u=>u.email));
          // upsert all in next
          for (const u of next) await upsertUserRow(u);
          // delete removed
          for (const u of prev) {
            if (!nextEmails.has(u.email)) {
              await supabase.from("vx_users").delete().eq("email", u.email);
            }
          }
        } catch(e) {}
      })();
      return next;
    });
  }, []);

  // Pending — full sync
  const setPendingAndSave = useCallback((updater) => {
    setPending(prev => {
      const next = typeof updater==="function" ? updater(prev) : updater;
      (async () => {
        try {
          const nextIds = new Set(next.map(t=>t.id));
          // delete removed
          for (const t of prev) {
            if (!nextIds.has(t.id)) await supabase.from("vx_pending").delete().eq("id", t.id);
          }
          // upsert all
          for (const t of next) {
            await supabase.from("vx_pending").upsert({
              id:t.id, user_email:t.user||t.user_email,
              type:t.type, coin:t.coin, amount:t.amount, usd:t.usd, fee:t.fee,
              submitted:t.submitted, network:t.network,
              address:t.address||"", status:t.status||"Pending",
            });
          }
        } catch(e) {}
      })();
      return next;
    });
  }, []);

  // Fees — full sync
  const setFeeReqsAndSave = useCallback((updater) => {
    setFeeReqs(prev => {
      const next = typeof updater==="function" ? updater(prev) : updater;
      (async () => {
        try {
          const nextIds = new Set(next.map(r=>r.id));
          for (const r of prev) {
            if (!nextIds.has(r.id)) await supabase.from("vx_fees").delete().eq("id", r.id);
          }
          for (const r of next) {
            await supabase.from("vx_fees").upsert({
              id:r.id, user_email:r.user||r.user_email,
              amount:r.amount, reason:r.reason, currency:r.currency,
              created:r.created, status:r.status,
            });
          }
        } catch(e) {}
      })();
      return next;
    });
  }, []);

  // Wallet assignment — now in Supabase (synced across devices)
  const assignWallet = useCallback((email, w) => {
    setWalletAssignments(prev => ({ ...prev, [email]: w }));
    (async () => {
      try {
        await supabase.from("vx_wallets").upsert({
          user_email: email, coin:w.coin, address:w.address,
          network:w.network, wallet_name:w.walletName,
          fee:w.fee, assigned_at:w.assignedAt,
        });
      } catch(e) {}
    })();
    showToast("Wallet assigned & synced to cloud", "success");
  }, [showToast]);

  const removeWallet = useCallback((email) => {
    setWalletAssignments(prev => { const n={...prev}; delete n[email]; return n; });
    (async () => { try { await supabase.from("vx_wallets").delete().eq("user_email", email); } catch(e) {} })();
  }, []);

  // ── APPROVE WITHDRAWAL ────────────────────────────────────────────────────────
  const approveWithdrawal = useCallback(async (txId) => {
    const tx = pending.find(t => t.id === txId);
    if (!tx) return;
    const targetEmail = tx.user || tx.user_email;
    const targetUser  = users.find(u => u.email === targetEmail);
    if (targetUser) {
      const newBalance   = Math.max(0, +(targetUser.balance - tx.usd).toFixed(2));
      const newPortfolio = Math.max(0, +(targetUser.portfolio - tx.usd).toFixed(2));
      const updated = { ...targetUser, balance:newBalance, portfolio:newPortfolio };
      await updateUser(updated);
      await addTx(targetEmail, {
        id:`WD${Date.now()}`, type:"Withdrawal", symbol:tx.coin,
        amount:tx.amount, value:tx.usd, fee:tx.fee,
        status:"Completed", date:new Date().toLocaleDateString(),
        notes:`Approved by admin. Network: ${tx.network}`,
      });
    }
    setPendingAndSave(prev => prev.filter(t => t.id !== txId));
    showToast("Withdrawal approved & processed", "success");
  }, [pending, users, updateUser, addTx, setPendingAndSave, showToast]);

  // ── PAY FEE — now requires EXTERNAL wallet payment, NOT platform balance ──────
  // This just marks intent — admin confirms once they receive funds to wallet
  const requestFeePayment = useCallback((feeId) => {
    const fee = feeReqs.find(r => r.id === feeId);
    if (!fee) return;
    // Mark as "Payment Submitted" — awaiting admin confirmation of external transfer
    setFeeReqsAndSave(prev => prev.map(r => r.id===feeId ? { ...r, status:"Awaiting Confirmation" } : r));
    showToast("Mark the fee as paid once you've sent funds from your external wallet. Admin will confirm receipt.", "info");
  }, [feeReqs, setFeeReqsAndSave, showToast]);

  // Admin confirms they received the external fee payment
  const confirmFeePaid = useCallback((feeId) => {
    setFeeReqsAndSave(prev => prev.map(r => r.id===feeId ? { ...r, status:"Paid" } : r));
    showToast("Fee marked as paid — client withdrawals unlocked", "success");
  }, [setFeeReqsAndSave, showToast]);

  const removePending = useCallback((id, label="Transaction") => {
    setPendingAndSave(prev => prev.filter(t => t.id !== id));
    showToast(label + " processed", "info");
  }, [setPendingAndSave, showToast]);

  const doLogout = useCallback(() => {
    setUser(null); setView("landing"); showToast("Signed out");
  }, [showToast]);

  if (loading) {
    return (
      <div style={{ background:"#0a0a0a", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ width:48, height:48, borderRadius:"50%", border:"3px solid rgba(255,200,0,.2)", borderTopColor:"#ffc800", animation:"spin 0.8s linear infinite" }}/>
        <div style={{ color:"#707070", fontSize:14, fontFamily:"'DM Sans',sans-serif", letterSpacing:".05em" }}>Connecting to VaultX…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const value = {
    view, setView, user, setUser, dashTab, setDashTab, adminTab, setAdminTab,
    users, setUsers: setUsersAndSave,
    txHistory, setTxHistory,
    pending, setPending: setPendingAndSave,
    feeReqs, setFeeReqs: setFeeReqsAndSave,
    walletAssignments, assignWallet, removeWallet,
    toast, setToast, modal, setModal, alert, setAlert,
    showToast, showAlert,
    updateUser, addTx, getTxs,
    getUserFeeReqs, getUserWallet, hasPendingFees,
    removePending, doLogout,
    approveWithdrawal, requestFeePayment, confirmFeePaid,
    refreshData: loadAll,
    supabase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
