import { useState, useCallback, useMemo } from "react";
import { useApp, usePrices, COINS, BASE_PRICES, fmt, fmtCrypto, coinInfo, createHoldings, createStaking } from "./AppContext";
import { C, S, btn } from "./theme";
import { Spark, MiniChart, CoinIcon, Tag, EmptyState } from "./components";

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
export function DashOverview() {
  const { user, updateUser, addTx, getTxs, setModal, setDashTab, showAlert, showToast, getUserFeeReqs, getUserWallet, hasPendingFees, payFee } = useApp();
  const prices = usePrices();

  const [coin,   setCoin]   = useState("BTC");
  const [side,   setSide]   = useState("buy");
  const [amount, setAmount] = useState("");

  const holdings    = user?.holdings || [];
  const txs         = getTxs(user?.email);
  const pendingFees = getUserFeeReqs(user?.email);
  const wallet      = getUserWallet(user?.email);

  const totalCryptoValue = useMemo(() =>
    holdings.reduce((sum, h) => sum + h.qty * (prices[h.sym]?.price || 0), 0),
  [holdings, prices]);

  const totalVal = (user?.balance || 0) + totalCryptoValue;

  const doTrade = useCallback(() => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    const price = prices[coin]?.price || 1;
    const qty   = +(amt / price).toFixed(8);
    const hs    = [...(user.holdings || [])];

    if (side === "buy") {
      if (amt > user.balance) { showAlert("Insufficient balance"); return; }
      const idx = hs.findIndex(h => h.sym === coin);
      if (idx !== -1) {
        const old = hs[idx];
        const newQty = +(old.qty + qty).toFixed(8);
        const newAvg = ((old.qty * old.avgBuy) + (qty * price)) / newQty;
        hs[idx] = { ...old, qty: newQty, avgBuy: +newAvg.toFixed(2) };
      } else {
        hs.push({ sym: coin, qty, avgBuy: +price.toFixed(2) });
      }
      updateUser({ ...user, balance: +(user.balance - amt).toFixed(2), portfolio: +(user.portfolio + amt).toFixed(2), holdings: hs });
      addTx(user.email, { id:`TX${Date.now()}`, type:"Buy", symbol:coin, amount:qty, value:amt, fee:+(amt*.001).toFixed(2), status:"Completed", date:new Date().toLocaleDateString() });
      showToast(`✅ Bought ${fmtCrypto(qty, coin)} ${coin} for $${fmt(amt)}`, "success");
    } else {
      const h = hs.find(h => h.sym === coin);
      if (!h || qty > h.qty) { showAlert(`Insufficient ${coin} — you have ${fmtCrypto(h?.qty||0, coin)} ${coin}`); return; }
      const newHs = hs.map(h => h.sym === coin ? { ...h, qty: +(h.qty - qty).toFixed(8) } : h).filter(h => h.qty > 0);
      updateUser({ ...user, balance: +(user.balance + amt).toFixed(2), portfolio: Math.max(0, +(user.portfolio - amt).toFixed(2)), holdings: newHs });
      addTx(user.email, { id:`TX${Date.now()}`, type:"Sell", symbol:coin, amount:qty, value:amt, fee:+(amt*.001).toFixed(2), status:"Completed", date:new Date().toLocaleDateString() });
      showToast(`✅ Sold ${fmtCrypto(qty, coin)} ${coin} for $${fmt(amt)}`, "success");
    }
    setAmount("");
  }, [amount, coin, side, prices, user, updateUser, addTx, showAlert, showToast]);

  return (
    <div>
      {/* Fee notification banner */}
      {pendingFees.length > 0 && (
        <div style={{ background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.4)", borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontWeight:700, color:C.gold, fontSize:14 }}>⚠️ Outstanding Fee — Action Required</div>
            <div style={{ fontSize:13, color:C.text2, marginTop:4 }}>
              You have {pendingFees.length} pending fee request{pendingFees.length>1?"s":""}.
              {" "}Withdrawals are blocked until all fees are paid.
            </div>
            <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:4 }}>
              {pendingFees.map(f => (
                <div key={f.id} style={{ fontSize:13, color:C.text }}>
                  • {f.reason}: <strong style={{ color:C.gold }}>{f.amount} {f.currency}</strong>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {pendingFees.map(f => (
              <button key={f.id} style={{ ...btn("success"), padding:"9px 20px" }} onClick={() => payFee(f.id)}>
                Pay {f.amount} {f.currency}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deposit wallet notification */}
      {wallet && (
        <div style={{ background:"rgba(138,43,226,.08)", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontWeight:700, color:C.purple3, fontSize:14 }}>💰 Deposit Address Ready</div>
            <div style={{ fontSize:13, color:C.text2, marginTop:4 }}>
              Your {wallet.coin} deposit address has been assigned. Click to view.
            </div>
          </div>
          <button style={{ ...btn(), padding:"9px 20px" }} onClick={() => setModal("deposit")}>View Deposit Address</button>
        </div>
      )}

      <div style={{ ...S.rowsb, marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={S.hd}>Good day, {user?.name?.split(" ")[0]} 👋</div>
          <div style={S.sub}>Here's your account overview</div>
        </div>
        <div style={S.row}>
          <button style={{ ...btn("success"), padding:"9px 18px" }} onClick={() => setModal("deposit")}>+ Deposit</button>
          <button style={{ ...btn(), padding:"9px 18px" }} onClick={() => setModal("send")}>↗ Withdraw</button>
        </div>
      </div>

      {/* Balance cards */}
      <div style={{ ...S.g4, marginBottom:22 }}>
        {[
          { label:"Total Balance",    val:"$"+fmt(totalVal),           sub:"All assets combined",    c:C.purple3 },
          { label:"Available Cash",   val:"$"+fmt(user?.balance||0),   sub:"Ready to trade or withdraw", c:C.green },
          { label:"Crypto Value",     val:"$"+fmt(totalCryptoValue),   sub:holdings.length+" asset"+(holdings.length!==1?"s":"")+" held", c:C.accent },
          { label:"Est. Monthly Yield", val:"$"+fmt(totalCryptoValue*.005,2), sub:"From staking rewards", c:C.gold },
        ].map((s,i) => (
          <div key={i} style={{ ...S.card, position:"relative", overflow:"hidden", cursor:"default" }}>
            <div style={{ position:"absolute", top:-12, right:-12, width:70, height:70, borderRadius:"50%", background:s.c+"15" }}/>
            <div style={{ fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.text }}>{s.val}</div>
            <div style={{ fontSize:11, color:s.c, marginTop:5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={S.g2}>
        {/* Quick Trade */}
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>Quick Trade</div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["buy","sell"].map(s => (
              <button key={s} style={{ ...btn(side===s?(s==="buy"?"success":"danger"):"ghost"), flex:1, padding:"10px" }} onClick={() => setSide(s)}>
                {s==="buy" ? "▲ Buy" : "▼ Sell"}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Asset</label>
            <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
              {COINS.map(c => (
                <option key={c.sym} value={c.sym}>
                  {c.sym} — ${prices[c.sym]?.price < 1 ? prices[c.sym]?.price.toFixed(4) : fmt(prices[c.sym]?.price)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.inp} placeholder="0.00" type="number" value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key==="Enter" && doTrade()} />
          </div>
          {amount && Number(amount) > 0 && (
            <div style={{ ...S.scard, marginBottom:14, fontSize:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:C.text3 }}>You {side}</span>
                <strong style={{ color:C.text }}>{fmtCrypto(Number(amount)/(prices[coin]?.price||1), coin)} {coin}</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:C.text3 }}>Price</span>
                <span style={{ color:C.text }}>${fmt(prices[coin]?.price||0)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.text3 }}>Fee (0.10%)</span>
                <span style={{ color:C.gold }}>${(Number(amount)*.001).toFixed(2)}</span>
              </div>
            </div>
          )}
          <button style={{ ...btn(side==="buy"?"success":"danger"), width:"100%", padding:"12px", fontSize:14 }} onClick={doTrade}>
            {side==="buy" ? `Buy ${coin}` : `Sell ${coin}`}
          </button>
          {side==="sell" && holdings.length > 0 && (
            <div style={{ marginTop:10, fontSize:12, color:C.text3 }}>
              Available: {fmtCrypto(holdings.find(h=>h.sym===coin)?.qty||0, coin)} {coin}
            </div>
          )}
        </div>

        {/* Holdings */}
        <div style={S.card}>
          <div style={{ ...S.rowsb, marginBottom:16 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.text }}>My Portfolio</div>
            <button style={{ ...btn("ghost"), padding:"5px 12px", fontSize:12 }} onClick={() => setDashTab("portfolio")}>Full view →</button>
          </div>
          {holdings.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>💼</div>
              <div style={{ fontSize:14, color:C.text2, marginBottom:8 }}>No crypto holdings yet</div>
              <div style={{ fontSize:12, color:C.text3, marginBottom:16 }}>Start trading or make a deposit to build your portfolio</div>
              <button style={{ ...btn("success"), padding:"8px 20px", fontSize:13 }} onClick={() => setModal("deposit")}>+ Deposit Now</button>
            </div>
          ) : (
            <>
              {holdings.slice(0,5).map((h,i) => {
                const coin   = coinInfo(h.sym);
                const p      = prices[h.sym];
                const val    = h.qty * (p?.price||0);
                const cost   = h.qty * (h.avgBuy||0);
                const pnl    = val - cost;
                const pnlPct = cost > 0 ? (pnl/cost)*100 : 0;
                const up     = (p?.change||0) >= 0;
                return (
                  <div key={h.sym} style={{ ...S.rowsb, padding:"11px 0", borderBottom:i<holdings.length-1?`1px solid ${C.border2}`:"none" }}>
                    <div style={S.row}>
                      <CoinIcon sym={h.sym} size={32} />
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{h.sym}</div>
                        <div style={{ fontSize:12, color:C.text3 }}>{fmtCrypto(h.qty, h.sym)} {h.sym}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:700, fontSize:14, color:C.text }}>${fmt(val)}</div>
                      <div style={{ fontSize:11, color:pnl>=0?C.green:C.red }}>
                        {pnl>=0?"+":""}{fmt(pnl)} ({pnlPct>=0?"+":""}{pnlPct.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop:12, padding:"10px 0", borderTop:`1px solid ${C.border2}`, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, color:C.text3 }}>Total Crypto Value</span>
                <span style={{ fontSize:14, fontWeight:700, color:C.purple3 }}>${fmt(totalCryptoValue)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ ...S.card, marginTop:18 }}>
        <div style={{ ...S.rowsb, marginBottom:16 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Recent Activity</span>
          <button style={{ ...btn("ghost"), padding:"5px 14px", fontSize:12 }} onClick={() => setDashTab("history")}>View all →</button>
        </div>
        {txs.length === 0 ? (
          <EmptyState icon="📋" text="No transactions yet. Start trading to see your activity here." />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["Type","Asset","Amount","Value","Fee","Status","Date"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {txs.slice(0,7).map(tx => (
                  <tr key={tx.id}>
                    <td style={S.td}><Tag c={tx.type==="Buy"?"purple":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":tx.type==="Fee Payment"?"yellow":"red"}>{tx.type}</Tag></td>
                    <td style={{ ...S.td, fontWeight:700 }}>
                      <div style={S.row}><CoinIcon sym={tx.symbol} size={20}/><span>{tx.symbol}</span></div>
                    </td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(tx.amount, tx.symbol)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700 }}>${fmt(tx.value)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.gold }}>${fmt(tx.fee)}</td>
                    <td style={S.td}><Tag c={tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red"}>{tx.status}</Tag></td>
                    <td style={{ ...S.td, color:C.text3 }}>{tx.date}</td>
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

// ─── MARKETS ──────────────────────────────────────────────────────────────────
export function DashMarkets() {
  const prices = usePrices();
  const { setDashTab, showToast } = useApp();
  const [search, setSearch] = useState("");
  const filtered = COINS.filter(c => c.sym.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={S.hd}>Live Markets</div>
      <div style={S.sub}><span style={S.ldot}/>Prices updating every 2.5 seconds</div>

      <div style={{ ...S.g4, marginBottom:22 }}>
        {COINS.slice(0,4).map(coin => {
          const p = prices[coin.sym], up = p.change >= 0;
          return (
            <div key={coin.sym} style={{ ...S.card, cursor:"pointer" }} onClick={() => setDashTab("overview")}>
              <div style={S.rowsb}>
                <div style={S.row}><CoinIcon sym={coin.sym} size={28}/><div><div style={{ fontSize:14, fontWeight:700, color:C.text }}>{coin.sym}</div><div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div></div></div>
                <Tag c={up?"green":"red"}>{up?"+":""}{fmt(p.change)}%</Tag>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:C.text, margin:"10px 0" }}>
                ${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}
              </div>
              <MiniChart prices={p.spark} color={up?C.purple:C.red}/>
              <div style={{ marginTop:8, display:"flex", justifyContent:"space-between", fontSize:11 }}>
                <span style={{ color:C.green }}>H: ${fmt(p.high||p.price*1.03)}</span>
                <span style={{ color:C.red }}>L: ${fmt(p.low||p.price*0.97)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={S.card}>
        <div style={{ ...S.rowsb, marginBottom:16 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>All Markets</span>
          <input style={{ ...S.inp, width:200, padding:"7px 12px", fontSize:13 }} placeholder="Search coin…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["#","Asset","Price","24h Change","24h High","24h Low","Volume","Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((coin,i) => {
                const p = prices[coin.sym], up = p.change >= 0;
                return (
                  <tr key={coin.sym}>
                    <td style={{ ...S.td, color:C.text3, fontWeight:600 }}>{i+1}</td>
                    <td style={S.td}>
                      <div style={S.row}>
                        <CoinIcon sym={coin.sym} size={26}/>
                        <div><div style={{ fontWeight:700, color:C.text }}>{coin.sym}</div><div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div></div>
                      </div>
                    </td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700, color:C.text }}>
                      ${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}
                    </td>
                    <td style={S.td}><span style={{ color:up?C.green:C.red, fontWeight:600 }}>{up?"+":""}{fmt(p.change)}%</span></td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.green }}>${fmt(p.high||p.price*1.03)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.red }}>${fmt(p.low||p.price*0.97)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt((p.vol||p.price*21000)/1000,1)}K</td>
                    <td style={S.td}>
                      <button style={{ ...btn("success"), padding:"5px 14px", fontSize:12 }}
                        onClick={() => { setDashTab("overview"); showToast("Select "+coin.sym+" in Quick Trade", "info"); }}>
                        Trade
                      </button>
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
  const { user, updateUser, addTx, setModal, showAlert, showToast, getUserFeeReqs, hasPendingFees, getUserWallet } = useApp();
  const prices = usePrices();
  const [coin,    setCoin]    = useState("BTC");
  const [address, setAddress] = useState("");
  const [amount,  setAmount]  = useState("");
  const [network, setNetwork] = useState("ERC-20");

  const holdings     = user?.holdings || [];
  const wallet       = getUserWallet(user?.email);
  const pendingFees  = getUserFeeReqs(user?.email);
  const feesBlocking = pendingFees.length > 0;

  const doWithdraw = useCallback(() => {
    if (feesBlocking) {
      showAlert("⚠️ You have outstanding fees. Please pay all fees before withdrawing.");
      return;
    }
    const amt = Number(amount);
    if (!address.trim()) { showAlert("Enter recipient wallet address"); return; }
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    if (amt > (user?.balance||0)) { showAlert("Insufficient balance"); return; }

    // Create pending withdrawal request
    const tx = {
      id: `WR${Date.now()}`,
      user: user.email,
      type: "Withdrawal",
      coin, amount: +(amt/(prices[coin]?.price||1)).toFixed(8),
      usd: amt, fee: +(amt*.001).toFixed(2),
      submitted: new Date().toLocaleString(),
      network, address,
      status: "Pending",
    };
    // Don't deduct yet — admin must approve first
    showToast("✅ Withdrawal request submitted! Awaiting admin approval.", "success");
    setAddress(""); setAmount("");
    // Add to pending tx visible to admin
    addTx(user.email, {
      id: tx.id, type:"Withdrawal Request", symbol:coin,
      amount: tx.amount, value: amt, fee: tx.fee,
      status:"Pending", date: new Date().toLocaleDateString(),
      notes: `To: ${address} | Network: ${network}`,
    });
  }, [feesBlocking, amount, address, coin, network, prices, user, addTx, showAlert, showToast]);

  return (
    <div>
      <div style={S.hd}>Wallet</div>
      <div style={S.sub}>Manage your assets, deposit and withdraw</div>

      {feesBlocking && (
        <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.3)", borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
          <div style={{ fontWeight:700, color:C.red, fontSize:14, marginBottom:6 }}>🔒 Withdrawals Locked</div>
          <div style={{ fontSize:13, color:C.text2 }}>
            You have {pendingFees.length} outstanding fee{pendingFees.length>1?"s":""} totalling{" "}
            <strong>${pendingFees.reduce((a,f)=>a+Number(f.amount),0)} {pendingFees[0]?.currency}</strong>.
            Please pay your fees in the Overview tab to unlock withdrawals.
          </div>
        </div>
      )}

      <div style={S.g2}>
        {/* Withdraw */}
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Withdraw Crypto</div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Asset</label>
            <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
              {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price < 1 ? prices[c.sym]?.price.toFixed(4) : fmt(prices[c.sym]?.price)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Network</label>
            <select style={S.sel} value={network} onChange={e => setNetwork(e.target.value)}>
              {["ERC-20 (ETH)","BEP-20 (BSC)","TRC-20 (TRON)","Native BTC","Native SOL","Polygon"].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Recipient Wallet Address</label>
            <input style={S.inp} placeholder="0x… or wallet address" autoComplete="off" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.inp} type="number" autoComplete="off" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key==="Enter" && doWithdraw()} />
          </div>
          {amount && Number(amount) > 0 && (
            <div style={{ ...S.scard, marginBottom:14, fontSize:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:C.text3 }}>You withdraw</span>
                <strong style={{ color:C.text }}>{fmtCrypto(Number(amount)/(prices[coin]?.price||1), coin)} {coin}</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:C.text3 }}>Network fee</span>
                <span style={{ color:C.gold }}>~$1.20</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.text3 }}>Processing time</span>
                <span style={{ color:C.text2 }}>1–24 hours</span>
              </div>
            </div>
          )}
          <button style={{ ...btn(feesBlocking?"ghost":"success"), width:"100%", padding:"12px", fontSize:14 }} onClick={doWithdraw}>
            {feesBlocking ? "🔒 Pay Fees to Unlock" : `Request ${coin} Withdrawal →`}
          </button>
          <div style={{ marginTop:10, fontSize:12, color:C.text3 }}>
            Available balance: <strong style={{ color:C.green }}>${fmt(user?.balance||0)}</strong>
          </div>
        </div>

        {/* Deposit */}
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Deposit Crypto</div>
          {wallet ? (
            <>
              <div style={{ background:`rgba(34,197,94,.06)`, border:`1px solid rgba(34,197,94,.2)`, borderRadius:12, padding:20, marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <CoinIcon sym={wallet.coin} size={24}/>
                  <div>
                    <div style={{ fontWeight:700, color:C.text }}>{wallet.walletName || wallet.coin + " Deposit"}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>Network: {wallet.network}</div>
                  </div>
                  <span style={{ ...S.tag("green"), marginLeft:"auto" }}>Active</span>
                </div>
                <div style={{ fontSize:11, color:C.text3, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>Deposit Address</div>
                <div style={{ fontFamily:"monospace", fontSize:12, color:C.text, wordBreak:"break-all", lineHeight:1.8, background:`rgba(138,43,226,.06)`, padding:"10px 14px", borderRadius:8 }}>
                  {wallet.address}
                </div>
                {wallet.fee && (
                  <div style={{ marginTop:10, fontSize:12, color:C.gold }}>
                    ⚠️ Deposit fee: {wallet.fee}
                  </div>
                )}
                <div style={{ marginTop:12, display:"flex", gap:8 }}>
                  <button style={{ ...btn("ghost"), padding:"7px 14px", fontSize:12, flex:1 }}
                    onClick={() => { navigator.clipboard?.writeText(wallet.address); showToast("Address copied!", "success"); }}>
                    📋 Copy Address
                  </button>
                </div>
              </div>
              <div style={{ fontSize:12, color:C.text3, lineHeight:1.7 }}>
                ⚠️ Only send <strong>{wallet.coin}</strong> via <strong>{wallet.network}</strong> to this address.
                Sending wrong coin or network may result in permanent loss of funds.
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🏦</div>
              <div style={{ fontSize:14, color:C.text2, marginBottom:8 }}>No deposit address assigned yet</div>
              <div style={{ fontSize:13, color:C.text3, marginBottom:16, lineHeight:1.7 }}>
                Contact our support team to receive your personal deposit wallet address.
              </div>
              <button style={{ ...btn("success"), padding:"10px 24px" }}
                onClick={() => window.open("mailto:support@vaultxcrypto.io?subject=Deposit%20Wallet%20Request", "_blank")}>
                📧 Request Deposit Address
              </button>
            </div>
          )}
        </div>
      </div>

      {/* All Balances */}
      <div style={{ ...S.card, marginTop:18 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>All Balances</div>

        {/* USD Cash */}
        <div style={{ ...S.rowsb, padding:"14px 0", borderBottom:`1px solid ${C.border2}` }}>
          <div style={S.row}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(34,197,94,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>$</div>
            <div><div style={{ fontWeight:700, color:C.text }}>USD Cash</div><div style={{ fontSize:11, color:C.text3 }}>Available for trading</div></div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontWeight:700, fontSize:14, color:C.green }}>${fmt(user?.balance||0)}</div>
            <div style={{ fontSize:11, color:C.text3 }}>1.00 USD</div>
          </div>
        </div>

        {holdings.length === 0 ? (
          <EmptyState icon="💳" text="No crypto holdings. Make a deposit to get started." />
        ) : (
          holdings.map((h,i) => {
            const c = coinInfo(h.sym), p = prices[h.sym];
            const val = h.qty * (p?.price||0);
            const pnl = val - (h.qty * (h.avgBuy||0));
            return (
              <div key={h.sym} style={{ ...S.rowsb, padding:"14px 0", borderBottom:`1px solid ${C.border2}` }}>
                <div style={S.row}>
                  <CoinIcon sym={h.sym} size={32}/>
                  <div>
                    <div style={{ fontWeight:700, color:C.text }}>{c.name}</div>
                    <div style={{ fontSize:12, color:C.text3 }}>{fmtCrypto(h.qty, h.sym)} {h.sym}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.text }}>${fmt(val)}</div>
                  <div style={{ fontSize:11, color:pnl>=0?C.green:C.red }}>
                    {pnl>=0?"+":""}{fmt(pnl)} P&L
                  </div>
                </div>
              </div>
            );
          })
        )}

        {holdings.length > 0 && (
          <div style={{ paddingTop:14, display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, color:C.text3 }}>Total Portfolio Value</span>
            <span style={{ fontSize:15, fontWeight:800, color:C.purple3 }}>
              ${fmt((user?.balance||0) + holdings.reduce((s,h)=>s+h.qty*(prices[h.sym]?.price||0),0))}
            </span>
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
  const allocs = holdings.map(h => ({ ...h, val: h.qty * (prices[h.sym]?.price||0), cost: h.qty * (h.avgBuy||0) }));
  const totalVal  = allocs.reduce((a,b)=>a+b.val,0);
  const totalCost = allocs.reduce((a,b)=>a+b.cost,0);
  const totalPnl  = totalVal - totalCost;

  return (
    <div>
      <div style={S.hd}>Portfolio</div>
      <div style={S.sub}>Crypto allocation, performance and P&L tracking</div>

      {/* Summary */}
      <div style={{ ...S.g3, marginBottom:22 }}>
        {[
          { label:"Total Invested",  val:"$"+fmt(totalCost),  c:C.text2 },
          { label:"Current Value",   val:"$"+fmt(totalVal),   c:C.purple3 },
          { label:"Total P&L",       val:(totalPnl>=0?"+":"")+fmt(totalPnl)+" ("+(totalCost>0?(totalPnl/totalCost*100).toFixed(2):0)+"%))", c:totalPnl>=0?C.green:C.red },
        ].map((s,i) => (
          <div key={i} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:s.c }}>{s.val}</div>
          </div>
        ))}
      </div>

      {holdings.length === 0 ? (
        <div style={{ ...S.card, textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:8 }}>Your portfolio is empty</div>
          <div style={{ fontSize:14, color:C.text3, marginBottom:20 }}>Start trading or deposit crypto to see your portfolio breakdown here</div>
        </div>
      ) : (
        <div style={S.g2}>
          {/* Allocation chart */}
          <div style={S.card}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>Asset Allocation</div>
            {allocs.map(a => {
              const pct = totalVal > 0 ? (a.val/totalVal)*100 : 0;
              const c = coinInfo(a.sym);
              return (
                <div key={a.sym} style={{ marginBottom:16 }}>
                  <div style={{ ...S.rowsb, marginBottom:7 }}>
                    <div style={S.row}>
                      <CoinIcon sym={a.sym} size={22}/>
                      <div>
                        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{a.sym}</span>
                        <span style={{ fontSize:11, color:C.text3, marginLeft:6 }}>{fmtCrypto(a.qty, a.sym)}</span>
                      </div>
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{pct.toFixed(1)}% · ${fmt(a.val)}</span>
                  </div>
                  <div style={{ height:8, background:`rgba(138,43,226,.1)`, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:pct+"%", background:`linear-gradient(90deg,${c.color}80,${c.color})`, borderRadius:4, transition:"width .5s" }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed table */}
          <div style={S.card}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>Holdings Detail</div>
            <table style={S.tbl}>
              <thead><tr>{["Asset","Qty","Avg Buy","Price","Value","P&L"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {allocs.map(a => {
                  const p = prices[a.sym];
                  const pnl = a.val - a.cost;
                  const pnlPct = a.cost > 0 ? (pnl/a.cost)*100 : 0;
                  return (
                    <tr key={a.sym}>
                      <td style={S.td}><div style={S.row}><CoinIcon sym={a.sym} size={22}/><span style={{ fontWeight:700, color:C.text }}>{a.sym}</span></div></td>
                      <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(a.qty, a.sym)}</td>
                      <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt(a.avgBuy||0)}</td>
                      <td style={{ ...S.td, fontFamily:"monospace" }}>${p?.price<1?p?.price.toFixed(4):fmt(p?.price)}</td>
                      <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700, color:C.text }}>${fmt(a.val)}</td>
                      <td style={S.td}>
                        <span style={{ color:pnl>=0?C.green:C.red, fontWeight:600 }}>
                          {pnl>=0?"+":""}{fmt(pnl)} ({pnlPct>=0?"+":""}{pnlPct.toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STAKING ──────────────────────────────────────────────────────────────────
export function DashStaking() {
  const { user, updateUser, addTx, setDashTab, showToast, showAlert } = useApp();
  const prices = usePrices();
  const holdings = user?.holdings || [];
  const staking  = user?.staking  || [];

  const STAKE = [
    { sym:"ETH",  name:"Ethereum", apy:4.8,  minStake:0.01, lockDays:0,  color:"#7B8CDE", bg:"#0a0d1a" },
    { sym:"SOL",  name:"Solana",   apy:7.2,  minStake:0.1,  lockDays:0,  color:"#9945FF", bg:"#0d0020" },
    { sym:"ADA",  name:"Cardano",  apy:5.1,  minStake:10,   lockDays:0,  color:"#4A90E2", bg:"#000d1a" },
    { sym:"BNB",  name:"BNB",      apy:8.4,  minStake:0.01, lockDays:30, color:"#F0B90B", bg:"#1a1200" },
    { sym:"XRP",  name:"XRP",      apy:3.2,  minStake:10,   lockDays:0,  color:"#00AAE4", bg:"#001520" },
    { sym:"DOGE", name:"Dogecoin", apy:2.1,  minStake:100,  lockDays:0,  color:"#C2A633", bg:"#181200" },
  ];

  const totalStakedVal = staking.reduce((sum,s) => sum + s.qty*(prices[s.sym]?.price||0), 0);
  const totalMonthly   = staking.reduce((sum,s) => sum + s.qty*(prices[s.sym]?.price||0)*(s.apy/100/12), 0);

  const doStake = useCallback((sym, apy) => {
    const h = holdings.find(x => x.sym === sym);
    if (!h || h.qty <= 0) {
      showAlert(`You need ${sym} to stake. Buy some first.`);
      setDashTab("overview");
      return;
    }
    const stakeQty = +(h.qty * 0.5).toFixed(8); // stake 50%
    const newHoldings = holdings.map(x => x.sym===sym ? {...x, qty:+(x.qty-stakeQty).toFixed(8)} : x).filter(x=>x.qty>0);
    const existing = staking.find(s => s.sym === sym);
    let newStaking;
    if (existing) {
      newStaking = staking.map(s => s.sym===sym ? {...s, qty:+(s.qty+stakeQty).toFixed(8)} : s);
    } else {
      newStaking = [...staking, { sym, qty:stakeQty, apy, stakedAt:Date.now() }];
    }
    updateUser({ ...user, holdings:newHoldings, staking:newStaking });
    addTx(user.email, { id:`ST${Date.now()}`, type:"Stake", symbol:sym, amount:stakeQty, value:stakeQty*(prices[sym]?.price||0), fee:0, status:"Completed", date:new Date().toLocaleDateString() });
    showToast(`✅ Staked ${fmtCrypto(stakeQty, sym)} ${sym} at ${apy}% APY`, "success");
  }, [holdings, staking, user, updateUser, addTx, prices, showAlert, showToast, setDashTab]);

  const doUnstake = useCallback((sym) => {
    const s = staking.find(x => x.sym===sym);
    if (!s) return;
    const newHoldings = [...holdings];
    const idx = newHoldings.findIndex(h => h.sym===sym);
    if (idx!==-1) newHoldings[idx] = {...newHoldings[idx], qty:+(newHoldings[idx].qty+s.qty).toFixed(8)};
    else newHoldings.push({ sym, qty:s.qty, avgBuy:prices[sym]?.price||0 });
    const newStaking = staking.filter(x => x.sym!==sym);
    updateUser({ ...user, holdings:newHoldings, staking:newStaking });
    addTx(user.email, { id:`US${Date.now()}`, type:"Unstake", symbol:sym, amount:s.qty, value:s.qty*(prices[sym]?.price||0), fee:0, status:"Completed", date:new Date().toLocaleDateString() });
    showToast(`Unstaked ${fmtCrypto(s.qty, sym)} ${sym}`, "info");
  }, [staking, holdings, user, updateUser, addTx, prices, showToast]);

  return (
    <div>
      <div style={S.hd}>Staking & Yield</div>
      <div style={S.sub}>Earn passive income by staking your crypto assets</div>

      {/* Summary */}
      {staking.length > 0 && (
        <div style={{ ...S.g3, marginBottom:22 }}>
          {[
            { label:"Total Staked Value", val:"$"+fmt(totalStakedVal), c:C.purple3 },
            { label:"Est. Monthly Yield", val:"$"+fmt(totalMonthly,2), c:C.green },
            { label:"Est. Annual Yield",  val:"$"+fmt(totalMonthly*12,2), c:C.gold },
          ].map((s,i) => (
            <div key={i} style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.g3}>
        {STAKE.map((s,i) => {
          const p       = prices[s.sym] || { price:0, change:0 };
          const holding = holdings.find(h => h.sym===s.sym);
          const staked  = staking.find(x => x.sym===s.sym);
          const stakedQty  = staked?.qty || 0;
          const stakedVal  = stakedQty * (p?.price||0);
          const monthly    = stakedVal * s.apy/100/12;
          const available  = holding?.qty || 0;

          return (
            <div key={i} style={{ ...S.card, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, right:0, width:60, height:60, borderRadius:"50%", background:s.color+"15", transform:"translate(20px,-20px)" }}/>
              <div style={{ ...S.rowsb, marginBottom:14 }}>
                <div style={S.row}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:s.bg, border:`1px solid ${s.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:s.color }}>{s.sym.slice(0,3)}</div>
                  <div><div style={{ fontWeight:700, color:C.text }}>{s.sym}</div><div style={{ fontSize:11, color:C.text3 }}>{s.name}</div></div>
                </div>
                <Tag c="green">{s.apy}% APY</Tag>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                <div style={{ ...S.scard, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:C.text3, marginBottom:3, textTransform:"uppercase" }}>Staked</div>
                  <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{fmtCrypto(stakedQty, s.sym)}</div>
                  <div style={{ fontSize:11, color:C.text3 }}>${fmt(stakedVal)}</div>
                </div>
                <div style={{ ...S.scard, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:C.text3, marginBottom:3, textTransform:"uppercase" }}>Monthly</div>
                  <div style={{ fontWeight:700, color:C.green, fontSize:13 }}>${fmt(monthly)}</div>
                  <div style={{ fontSize:11, color:C.text3 }}>{s.apy}% yearly</div>
                </div>
              </div>

              {available > 0 && (
                <div style={{ fontSize:12, color:C.text3, marginBottom:10 }}>
                  Available: {fmtCrypto(available, s.sym)} {s.sym}
                </div>
              )}

              {s.lockDays > 0 && (
                <div style={{ fontSize:11, color:C.gold, marginBottom:10 }}>
                  🔒 {s.lockDays}-day lock period
                </div>
              )}

              <div style={{ display:"flex", gap:8 }}>
                {stakedQty > 0 ? (
                  <>
                    <button style={{ ...btn("success"), flex:1, padding:"9px", fontSize:12 }} onClick={() => doStake(s.sym, s.apy)}>
                      + Add
                    </button>
                    <button style={{ ...btn("ghost"), flex:1, padding:"9px", fontSize:12 }} onClick={() => doUnstake(s.sym)}>
                      Unstake
                    </button>
                  </>
                ) : (
                  <button style={{ ...btn(available>0?"success":"ghost"), width:"100%", padding:"10px", fontSize:13 }} onClick={() => doStake(s.sym, s.apy)}>
                    {available > 0 ? `Stake ${s.sym}` : `Buy ${s.sym} to Stake`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
export function DashHistory() {
  const { user, getTxs } = useApp();
  const [filter, setFilter] = useState("All");
  const allTxs = getTxs(user?.email);
  const types = ["All", "Buy", "Sell", "Deposit", "Withdrawal", "Stake", "Fee Payment"];
  const filtered = filter==="All" ? allTxs : allTxs.filter(t=>t.type===filter);

  return (
    <div>
      <div style={S.hd}>Transaction History</div>
      <div style={S.sub}>Complete record of all your trades, deposits and withdrawals</div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {types.map(t => (
          <button key={t} style={{ ...btn(filter===t?"primary":"ghost"), padding:"6px 14px", fontSize:12 }} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>

      <div style={S.card}>
        {filtered.length === 0 ? (
          <EmptyState icon="📋" text={`No ${filter === "All" ? "" : filter + " "}transactions yet.`} />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["TX ID","Type","Asset","Amount","Value","Fee","Status","Date","Notes"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.text3, fontSize:11 }}>{tx.id}</td>
                    <td style={S.td}><Tag c={tx.type==="Buy"?"purple":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":tx.type==="Fee Payment"?"yellow":"red"}>{tx.type}</Tag></td>
                    <td style={S.td}><div style={S.row}><CoinIcon sym={tx.symbol} size={20}/><span style={{ fontWeight:700 }}>{tx.symbol}</span></div></td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(tx.amount, tx.symbol)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700 }}>${fmt(tx.value)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.gold }}>${fmt(tx.fee)}</td>
                    <td style={S.td}><Tag c={tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red"}>{tx.status}</Tag></td>
                    <td style={{ ...S.td, color:C.text3 }}>{tx.date}</td>
                    <td style={{ ...S.td, fontSize:11, color:C.text3, maxWidth:160 }}>{tx.notes||"—"}</td>
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
