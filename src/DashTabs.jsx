import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, BASE_PRICES, fmt, coinInfo, createHoldings, createStaking } from "./AppContext";
import { C, S, btn } from "./theme";
import { Spark, MiniChart, CoinIcon, Tag, EmptyState } from "./components";

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
export function DashOverview() {
  const { user, updateUser, addTx, getTxs, setModal, setDashTab, showAlert, showToast } = useApp();
  const prices = usePrices();
  const [coin, setCoin] = useState("BTC");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");

  const totalVal = (user?.balance || 0) + (user?.portfolio || 0);
  const holdings = user?.holdings || [];
  const txs = getTxs(user?.email);

  const doTrade = useCallback(() => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    const price = prices[coin]?.price || 1;
    const qty = +(amt / price).toFixed(6);
    const hs = [...(user.holdings || [])];
    if (side === "buy") {
      if (amt > user.balance) { showAlert("Insufficient balance"); return; }
      const idx = hs.findIndex(h => h.sym === coin);
      if (idx !== -1) hs[idx] = { ...hs[idx], qty: +(hs[idx].qty + qty).toFixed(6) };
      else hs.push({ sym: coin, qty });
      updateUser({ ...user, balance: +(user.balance - amt).toFixed(2), portfolio: +(user.portfolio + amt).toFixed(2), holdings: hs });
      addTx(user.email, { id: `TX${Date.now()}`, type: "Buy", symbol: coin, amount: qty, value: amt, fee: +(amt * .001).toFixed(2), status: "Completed", date: new Date().toLocaleDateString() });
      showToast(`Bought ${qty} ${coin}`, "success");
    } else {
      const h = hs.find(h => h.sym === coin);
      if (!h || qty > h.qty) { showAlert(`Insufficient ${coin}`); return; }
      updateUser({ ...user, balance: +(user.balance + amt).toFixed(2), portfolio: Math.max(0, +(user.portfolio - amt).toFixed(2)), holdings: hs.map(h => h.sym === coin ? { ...h, qty: +(h.qty - qty).toFixed(6) } : h).filter(h => h.qty > 0) });
      addTx(user.email, { id: `TX${Date.now()}`, type: "Sell", symbol: coin, amount: qty, value: amt, fee: +(amt * .001).toFixed(2), status: "Completed", date: new Date().toLocaleDateString() });
      showToast(`Sold ${qty} ${coin}`, "success");
    }
    setAmount("");
  }, [amount, coin, side, prices, user, updateUser, addTx, showAlert, showToast]);

  return (
    <div>
      <div style={{ ...S.rowsb, marginBottom: 22 }}>
        <div>
          <div style={S.hd}>Good day, {user?.name?.split(" ")[0]} 👋</div>
          <div style={S.sub}>Here's your account at a glance</div>
        </div>
        <div style={S.row}>
          <button style={{ ...btn("success"), padding: "9px 18px" }} onClick={() => setModal("deposit")}>+ Deposit</button>
          <button style={{ ...btn(), padding: "9px 18px" }} onClick={() => setModal("send")}>↗ Send</button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ ...S.g4, marginBottom: 22 }}>
        {[
          { label: "Total Balance", val: "$" + fmt(totalVal), sub: "All assets combined", c: C.purple3 },
          { label: "Available Cash", val: "$" + fmt(user?.balance || 0), sub: "Ready to trade", c: C.green },
          { label: "Invested", val: "$" + fmt(user?.portfolio || 0), sub: "In crypto assets", c: C.accent },
          { label: "Est. Monthly Yield", val: "$" + fmt(+(user?.portfolio || 0) * .005, 2), sub: "From staking", c: C.gold },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -12, right: -12, width: 70, height: 70, borderRadius: "50%", background: s.c + "15" }} />
            <div style={{ fontSize: 11, color: C.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{s.val}</div>
            <div style={{ fontSize: 12, color: s.c, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={S.g2}>
        {/* Quick Trade */}
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Quick Trade</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["buy", "sell"].map(s => (
              <button key={s} style={{ ...btn(side === s ? (s === "buy" ? "success" : "danger") : "ghost"), flex: 1, padding: "10px" }} onClick={() => setSide(s)}>
                {s === "buy" ? "▲ Buy" : "▼ Sell"}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Asset</label>
            <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
              {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price < 1 ? prices[c.sym]?.price.toFixed(4) : fmt(prices[c.sym]?.price)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.inp} placeholder="0.00" type="number" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === "Enter" && doTrade()} />
          </div>
          {amount && Number(amount) > 0 && (
            <div style={{ ...S.scard, marginBottom: 14, fontSize: 13 }}>
              <span style={{ color: C.text2 }}>You {side} ≈ </span>
              <strong style={{ color: C.text }}>{(Number(amount) / (prices[coin]?.price || 1)).toFixed(6)} {coin}</strong>
              <span style={{ color: C.text3 }}> · Fee: ${(Number(amount) * .001).toFixed(2)}</span>
            </div>
          )}
          <button style={{ ...btn(side === "buy" ? "success" : "danger"), width: "100%", padding: "12px", fontSize: 14 }} onClick={doTrade}>
            {side === "buy" ? "Buy " + coin : "Sell " + coin}
          </button>
        </div>

        {/* Holdings */}
        <div style={S.card}>
          <div style={{ ...S.rowsb, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>My Holdings</div>
            <button style={{ ...btn("ghost"), padding: "5px 12px", fontSize: 12 }} onClick={() => setDashTab("portfolio")}>View all →</button>
          </div>
          {holdings.length === 0 ? (
            <EmptyState icon="💼" text="No holdings yet. Make a deposit or trade to get started." />
          ) : holdings.slice(0, 6).map((h, i) => {
            const coin = coinInfo(h.sym), p = prices[h.sym], val = h.qty * (p?.price || 0), up = (p?.change || 0) >= 0;
            return (
              <div key={h.sym} style={{ ...S.rowsb, padding: "10px 0", borderBottom: i < holdings.length - 1 ? `1px solid ${C.border2}` : "none" }}>
                <div style={S.row}>
                  <CoinIcon sym={h.sym} size={30} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{h.sym}</div>
                    <div style={{ fontSize: 11, color: C.text3 }}>{h.qty.toFixed(6)} {h.sym}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: C.text }}>${fmt(val)}</div>
                  <div style={{ fontSize: 11, color: up ? C.purple3 : C.red }}>{up ? "+" : ""}{fmt(p?.change)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ ...S.card, marginTop: 18 }}>
        <div style={{ ...S.rowsb, marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Recent Activity</span>
          <button style={{ ...btn("ghost"), padding: "5px 14px", fontSize: 12 }} onClick={() => setDashTab("history")}>View all →</button>
        </div>
        {txs.length === 0 ? <EmptyState icon="📋" text="No transactions yet." /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["Type", "Asset", "Amount", "Value", "Status", "Date"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {txs.slice(0, 6).map(tx => (
                  <tr key={tx.id}>
                    <td style={S.td}><Tag c={tx.type === "Buy" ? "purple" : tx.type === "Sell" ? "yellow" : tx.type === "Deposit" ? "green" : "red"}>{tx.type}</Tag></td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{tx.symbol}</td>
                    <td style={{ ...S.td, fontFamily: "monospace" }}>{tx.amount}</td>
                    <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(tx.value)}</td>
                    <td style={S.td}><Tag c={tx.status === "Completed" ? "green" : tx.status === "Pending" ? "yellow" : "red"}>{tx.status}</Tag></td>
                    <td style={{ ...S.td, color: C.text3 }}>{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MARKETS ─────────────────────────────────────────────────────────────────
export function DashMarkets() {
  const prices = usePrices();
  const { setDashTab } = useApp();
  return (
    <div>
      <div style={S.hd}>Live Markets</div>
      <div style={S.sub}><span style={S.ldot} />Prices updating every 2.5 seconds</div>
      <div style={{ ...S.g4, marginBottom: 22 }}>
        {COINS.slice(0, 4).map(coin => {
          const p = prices[coin.sym], up = p.change >= 0;
          return (
            <div key={coin.sym} style={S.card}>
              <div style={S.rowsb}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{coin.sym}</div>
                <Tag c={up ? "green" : "red"}>{up ? "+" : ""}{fmt(p.change)}%</Tag>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "10px 0" }}>${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}</div>
              <MiniChart prices={p.spark} color={up ? C.purple : C.red} />
            </div>
          );
        })}
      </div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["#", "Asset", "Price", "Change", "High 24h", "Low 24h", "Volume", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {COINS.map((coin, i) => {
                const p = prices[coin.sym], up = p.change >= 0;
                return (
                  <tr key={coin.sym}>
                    <td style={{ ...S.td, color: C.text3, fontWeight: 600 }}>{i + 1}</td>
                    <td style={S.td}>
                      <div style={S.row}>
                        <CoinIcon sym={coin.sym} size={26} />
                        <div><div style={{ fontWeight: 700, color: C.text }}>{coin.sym}</div><div style={{ fontSize: 11, color: C.text3 }}>{coin.name}</div></div>
                      </div>
                    </td>
                    <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: C.text }}>${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}</td>
                    <td style={S.td}><span style={{ color: up ? C.green : C.red, fontWeight: 600 }}>{up ? "+" : ""}{fmt(p.change)}%</span></td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.green }}>${fmt(p.price * 1.03)}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.red }}>${fmt(p.price * .97)}</td>
                    <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(p.price * 21000 / 1000, 1)}K</td>
                    <td style={S.td}>
                      <button style={{ ...btn("success"), padding: "5px 14px", fontSize: 12 }} onClick={() => setDashTab("overview")}>Trade</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── WALLET ───────────────────────────────────────────────────────────────────
export function DashWallet() {
  const { user, updateUser, addTx, setModal, showAlert, showToast } = useApp();
  const prices = usePrices();
  const [coin,    setCoin]    = useState("BTC");
  const [address, setAddress] = useState("");
  const [amount,  setAmount]  = useState("");
  const holdings = user?.holdings || [];

  const doSend = useCallback(() => {
    const amt = Number(amount);
    if (!address.trim()) { showAlert("Enter recipient address"); return; }
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    const price = prices[coin]?.price || 1;
    const qty = +(amt / price).toFixed(6);
    const h = user.holdings?.find(h => h.sym === coin);
    if (!h || qty > h.qty) { showAlert(`Insufficient ${coin} balance`); return; }
    updateUser({ ...user, portfolio: Math.max(0, +(user.portfolio - amt).toFixed(2)), holdings: (user.holdings || []).map(h => h.sym === coin ? { ...h, qty: +(h.qty - qty).toFixed(6) } : h).filter(h => h.qty > 0) });
    addTx(user.email, { id: `TX${Date.now()}`, type: "Withdrawal", symbol: coin, amount: qty, value: amt, fee: 1.2, status: "Completed", date: new Date().toLocaleDateString() });
    setAddress(""); setAmount("");
    showToast(`Sent ${qty} ${coin} to ${address.slice(0, 8)}…`, "success");
  }, [amount, coin, address, prices, user, updateUser, addTx, showAlert, showToast]);

  return (
    <div>
      <div style={S.hd}>Wallet</div>
      <div style={S.sub}>Manage your crypto balances, send and receive</div>
      <div style={S.g2}>
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>Send Crypto</div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Asset</label>
            <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
              {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price < 1 ? prices[c.sym]?.price.toFixed(4) : fmt(prices[c.sym]?.price)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Recipient Address</label>
            <input style={S.inp} placeholder="0x…" autoComplete="off" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.inp} type="number" autoComplete="off" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key === "Enter" && doSend()} />
          </div>
          {amount && <div style={{ ...S.scard, marginBottom: 14, fontSize: 13, color: C.text2 }}>Network fee: ~$1.20 · Estimated arrival: 1–3 min</div>}
          <button style={{ ...btn("success"), width: "100%", padding: "12px", fontSize: 14 }} onClick={doSend}>Send {coin} →</button>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>Receive Crypto</div>
          <div style={{ background: `rgba(138,43,226,.06)`, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".06em" }}>Your BTC Deposit Address</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: C.text2, wordBreak: "break-all", lineHeight: 1.9 }}>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 10 }}>
              <button style={{ ...btn("ghost"), padding: "7px 16px", fontSize: 12 }} onClick={() => showToast("Address copied!", "success")}>📋 Copy</button>
              <button style={{ ...btn("ghost"), padding: "7px 16px", fontSize: 12 }} onClick={() => setModal("deposit")}>+ Deposit</button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.7 }}>Only send BTC to this address. Sending any other asset may result in permanent loss. Contact support for other coin addresses.</div>
        </div>
      </div>
      <div style={{ ...S.card, marginTop: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>All Balances</div>
        {holdings.length === 0 ? (
          <EmptyState icon="💳" text={<>Your wallet is empty. <button style={{ ...btn("success"), padding: "6px 16px", fontSize: 12, marginLeft: 8 }} onClick={() => setModal("deposit")}>+ Deposit now</button></>} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["Asset", "Holdings", "USD Value", "24h Change", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {holdings.map(h => {
                  const c = coinInfo(h.sym), p = prices[h.sym], up = (p?.change || 0) >= 0;
                  return (
                    <tr key={h.sym}>
                      <td style={S.td}><div style={S.row}><CoinIcon sym={h.sym} size={26} /><span style={{ fontWeight: 700, color: C.text }}>{c.name}</span></div></td>
                      <td style={{ ...S.td, fontFamily: "monospace" }}>{h.qty.toFixed(6)} {h.sym}</td>
                      <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: C.text }}>${fmt(h.qty * (p?.price || 0))}</td>
                      <td style={S.td}><span style={{ color: up ? C.green : C.red, fontWeight: 600 }}>{up ? "+" : ""}{fmt(p?.change || 0)}%</span></td>
                      <td style={S.td}>
                        <div style={S.row}>
                          <button style={{ ...btn("success"), padding: "5px 12px", fontSize: 12 }} onClick={() => { setCoin(h.sym); }}>Buy More</button>
                          <button style={{ ...btn("ghost"), padding: "5px 12px", fontSize: 12 }} onClick={() => setCoin(h.sym)}>Send</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
export function DashPortfolio() {
  const { user } = useApp();
  const prices = usePrices();
  const holdings = user?.holdings || [];
  const allocs = holdings.map(h => ({ ...h, val: h.qty * (prices[h.sym]?.price || 0) }));
  const total = allocs.reduce((a, b) => a + b.val, 0);

  return (
    <div>
      <div style={S.hd}>Portfolio</div>
      <div style={S.sub}>Your crypto allocation and performance overview</div>
      <div style={S.g2}>
        <div style={S.card}>
          <div style={{ fontSize: 14, color: C.text3, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Total Portfolio Value</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.text, marginBottom: 6 }}>${fmt(total)}</div>
          <div style={{ fontSize: 13, color: C.purple3, marginBottom: 24 }}>Cash available: ${fmt(user?.balance || 0)}</div>
          {allocs.length === 0 ? (
            <EmptyState icon="📊" text="No holdings to display. Start trading to build your portfolio." />
          ) : allocs.map(a => {
            const pct = total > 0 ? (a.val / total) * 100 : 0;
            const c = coinInfo(a.sym);
            return (
              <div key={a.sym} style={{ marginBottom: 16 }}>
                <div style={{ ...S.rowsb, marginBottom: 7 }}>
                  <div style={S.row}>
                    <CoinIcon sym={a.sym} size={20} />
                    <span style={{ fontSize: 13, color: C.text2 }}>{a.sym}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pct.toFixed(1)}% · ${fmt(a.val)}</span>
                </div>
                <div style={{ height: 6, background: `rgba(138,43,226,.1)`, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", background: `linear-gradient(90deg,${c.color}80,${c.color})`, borderRadius: 4, transition: "width .5s" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Holdings Detail</div>
          {allocs.length === 0 ? (
            <EmptyState icon="📈" text="Make your first trade to see portfolio details." />
          ) : (
            <table style={S.tbl}>
              <thead><tr>{["Asset", "Qty", "Price", "Value", "P&L"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {allocs.map(a => {
                  const p = prices[a.sym], up = (p?.change || 0) >= 0;
                  return (
                    <tr key={a.sym}>
                      <td style={S.td}><div style={S.row}><CoinIcon sym={a.sym} size={22} /><span style={{ fontWeight: 700, color: C.text }}>{a.sym}</span></div></td>
                      <td style={{ ...S.td, fontFamily: "monospace" }}>{a.qty.toFixed(6)}</td>
                      <td style={{ ...S.td, fontFamily: "monospace" }}>${p?.price < 1 ? p?.price.toFixed(4) : fmt(p?.price)}</td>
                      <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: C.text }}>${fmt(a.val)}</td>
                      <td style={S.td}><span style={{ color: up ? C.green : C.red, fontWeight: 600 }}>{up ? "+" : ""}{fmt(p?.change)}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STAKING ─────────────────────────────────────────────────────────────────
export function DashStaking() {
  const { user, setDashTab, showToast } = useApp();
  const prices = usePrices();
  const holdings = user?.holdings || [];
  const STAKE = [
    { sym: "ETH", name: "Ethereum", apy: 4.8, color: "#7B8CDE", bg: "#0a0d1a" },
    { sym: "SOL", name: "Solana", apy: 7.2, color: "#9945FF", bg: "#0d0020" },
    { sym: "ADA", name: "Cardano", apy: 5.1, color: "#4A90E2", bg: "#000d1a" },
    { sym: "BNB", name: "BNB", apy: 8.4, color: "#F0B90B", bg: "#1a1200" },
    { sym: "MATIC", name: "Polygon", apy: 12.6, color: "#8247E5", bg: "#0d0020" },
    { sym: "XRP", name: "XRP", apy: 3.2, color: "#00AAE4", bg: "#001520" },
  ];

  return (
    <div>
      <div style={S.hd}>Staking & Yield</div>
      <div style={S.sub}>Earn passive income on your crypto holdings</div>
      <div style={{ ...S.g3 }}>
        {STAKE.map((s, i) => {
          const p = prices[s.sym] || prices["BNB"];
          const h = holdings.find(x => x.sym === s.sym);
          const staked = h?.qty || 0;
          const val = staked * (p?.price || 0);
          const monthly = val * s.apy / 100 / 12;
          const yearly = val * s.apy / 100;
          return (
            <div key={i} style={{ ...S.card, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "50%", background: s.color + "15", transform: "translate(20px,-20px)" }} />
              <div style={{ ...S.rowsb, marginBottom: 14 }}>
                <div style={S.row}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: s.bg, border: `1px solid ${s.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: s.color }}>{s.sym.slice(0, 3)}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.text }}>{s.sym}</div>
                    <div style={{ fontSize: 11, color: C.text3 }}>{s.name}</div>
                  </div>
                </div>
                <Tag c="green">{s.apy}% APY</Tag>
              </div>
              <div style={S.g2}>
                <div style={{ ...S.scard, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: C.text3, marginBottom: 4, textTransform: "uppercase" }}>Staked</div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 13 }}>{staked.toFixed(4)} {s.sym}</div>
                </div>
                <div style={{ ...S.scard, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: C.text3, marginBottom: 4, textTransform: "uppercase" }}>Monthly</div>
                  <div style={{ fontWeight: 700, color: C.green, fontSize: 13 }}>${fmt(monthly)}</div>
                </div>
              </div>
              {staked > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: C.text3 }}>Yearly est: <strong style={{ color: C.green }}>${fmt(yearly)}</strong></div>
              )}
              <div style={{ marginTop: 14 }}>
                <button
                  style={{ ...btn(staked > 0 ? "ghost" : "success"), width: "100%", padding: "10px", fontSize: 13 }}
                  onClick={() => {
                    if (staked <= 0) { setDashTab("overview"); showToast("Buy " + s.sym + " first to stake", "info"); }
                    else showToast("Staking increased for " + s.sym + "!", "success");
                  }}>
                  {staked > 0 ? "+ Add Stake" : "Buy to Stake"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────
export function DashHistory() {
  const { user, getTxs } = useApp();
  const txs = getTxs(user?.email);
  return (
    <div>
      <div style={S.hd}>Transaction History</div>
      <div style={S.sub}>All your trades, transfers and deposits</div>
      <div style={S.card}>
        {txs.length === 0 ? <EmptyState icon="📋" text="No transactions yet. Start trading to see your history here." /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["TX ID", "Type", "Asset", "Amount", "Value", "Fee", "Status", "Date"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {txs.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.text3, fontSize: 11 }}>{tx.id}</td>
                    <td style={S.td}><Tag c={tx.type === "Buy" ? "purple" : tx.type === "Sell" ? "yellow" : tx.type === "Deposit" ? "green" : "red"}>{tx.type}</Tag></td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{tx.symbol}</td>
                    <td style={{ ...S.td, fontFamily: "monospace" }}>{tx.amount}</td>
                    <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(tx.value)}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.text3 }}>${fmt(tx.fee)}</td>
                    <td style={S.td}><Tag c={tx.status === "Completed" ? "green" : tx.status === "Pending" ? "yellow" : "red"}>{tx.status}</Tag></td>
                    <td style={{ ...S.td, color: C.text3 }}>{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
