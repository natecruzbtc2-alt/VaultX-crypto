import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, BASE_PRICES, fmt, createHoldings, createStaking } from "./AppContext";
import { C, S, btn } from "./theme";
import { CoinIcon, Tag, EmptyState } from "./components";

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
export function AdminUsers() {
  const { users, setUsers, setModal, showToast, showAlert } = useApp();
  const [form, setForm] = useState({ name: "", email: "", password: "", tier: "Basic" });

  const doAdd = useCallback(() => {
    if (!form.name || !form.email || !form.password) { showAlert("Name, email and password required"); return; }
    if (users.some(u => u.email === form.email)) { showAlert("Email already exists"); return; }
    const nu = {
      id: `U${String(users.length + 1).padStart(4, "0")}`,
      name: form.name, email: form.email, password: form.password,
      balance: 0, portfolio: 0,
      holdings: createHoldings(0), staking: createStaking(0),
      joined: new Date().toLocaleDateString(),
      verified: true, status: "Active", tier: form.tier,
    };
    setUsers(prev => [nu, ...prev]);
    setForm({ name: "", email: "", password: "", tier: "Basic" });
    showToast("Client added: " + form.name, "success");
  }, [form, users, setUsers, showAlert, showToast]);

  return (
    <div>
      <div style={{ ...S.rowsb, marginBottom: 22 }}>
        <div><div style={S.hd}>Users & Funds</div><div style={S.sub}>Manage all client accounts and balances</div></div>
        <button style={btn()} onClick={() => showToast("CSV exported", "success")}>Export CSV</button>
      </div>

      {/* Stats */}
      <div style={{ ...S.g4, marginBottom: 22 }}>
        {[
          { l: "Total Clients", v: users.length },
          { l: "Active", v: users.filter(u => u.status === "Active").length },
          { l: "Verified", v: users.filter(u => u.verified).length },
          { l: "Total Equity", v: "$" + fmt(users.reduce((a, u) => a + u.balance, 0)) },
        ].map((s, i) => (
          <div key={i} style={S.scard}>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Add client form */}
      <div style={{ ...S.card, marginBottom: 22 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>Add New Client</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Full Name</label>
            <input style={S.inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
          </div>
          <div>
            <label style={S.label}>Email</label>
            <input style={S.inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@email.com" />
          </div>
          <div>
            <label style={S.label}>Password</label>
            <input style={S.inp} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••" />
          </div>
          <div>
            <label style={S.label}>Tier</label>
            <select style={S.sel} value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
              {["Basic", "Pro", "Elite"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button style={{ ...btn("success"), padding: "11px 24px", fontSize: 14 }} onClick={doAdd}>+ Add Client</button>
      </div>

      {/* Users table */}
      <div style={S.card}>
        {users.length === 0 ? (
          <EmptyState icon="👥" text="No clients yet. Add one above." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["ID", "Name", "Email", "Balance", "Portfolio", "Tier", "Status", "Joined", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.text3, fontSize: 11 }}>{u.id}</td>
                    <td style={{ ...S.td, fontWeight: 700, color: C.text }}>{u.name}</td>
                    <td style={{ ...S.td, fontSize: 12, color: C.text2 }}>{u.email}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.green }}>${fmt(u.balance)}</td>
                    <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(u.portfolio)}</td>
                    <td style={S.td}><Tag c={u.tier === "Elite" ? "yellow" : u.tier === "Pro" ? "purple" : ""}>{u.tier}</Tag></td>
                    <td style={S.td}><Tag c={u.status === "Active" ? "green" : "red"}>{u.status}</Tag></td>
                    <td style={{ ...S.td, color: C.text3, fontSize: 12 }}>{u.joined}</td>
                    <td style={S.td}>
                      <div style={S.row}>
                        <button style={{ ...btn("success"), padding: "4px 12px", fontSize: 12 }} onClick={() => setModal({ type: "fundUser", user: u })}>+ Fund</button>
                        <button style={{ ...btn("ghost"), padding: "4px 12px", fontSize: 12 }} onClick={() => setModal({ type: "userDetail", user: u })}>View</button>
                        <button style={{ ...btn("danger"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setUsers(prev => prev.filter(x => x.id !== u.id)); showToast("Client removed", "info"); }}>Remove</button>
                      </div>
                    </td>
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

// ─── ADMIN DEPOSITS ───────────────────────────────────────────────────────────
export function AdminDeposits() {
  const { users, setUsers, setUser, user, pending, setPending, addTx, showAlert, showToast } = useApp();
  const [form, setForm] = useState({ user: "", coin: "BTC", amount: "", network: "ERC-20" });
  const pendingD = pending.filter(p => p.type === "Deposit");

  const doDeposit = useCallback(() => {
    const target = form.user;
    const amount = Number(form.amount);
    if (!target || !amount || amount <= 0) { showAlert("Select client and enter amount"); return; }
    const idx = users.findIndex(u => u.email === target);
    if (idx === -1) { showAlert("User not found"); return; }
    const updated = [...users];
    updated[idx] = { ...updated[idx], balance: +(updated[idx].balance + amount).toFixed(2), portfolio: +(updated[idx].portfolio + amount).toFixed(2) };
    setUsers(updated);
    if (user && user.email === target) setUser(updated[idx]);
    const tx = {
      id: `DP${Date.now()}`, user: target, type: "Deposit", coin: form.coin,
      amount: +(amount / (BASE_PRICES[form.coin] || 1)).toFixed(6),
      usd: amount, fee: +(amount * .001).toFixed(2),
      submitted: new Date().toLocaleString(), network: form.network,
    };
    setPending(prev => [tx, ...prev]);
    addTx(target, { id: tx.id, type: "Deposit", symbol: form.coin, amount: tx.amount, value: amount, fee: tx.fee, status: "Completed", date: new Date().toLocaleDateString() });
    setForm({ user: "", coin: "BTC", amount: "", network: "ERC-20" });
    showToast("Deposit credited to " + target, "success");
  }, [form, users, user, setUsers, setUser, setPending, addTx, showAlert, showToast]);

  return (
    <div>
      <div style={S.hd}>Deposit Desk</div>
      <div style={S.sub}>Credit deposits directly to client accounts</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 20, marginBottom: 22 }}>
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>Manual Vault Deposit</div>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={S.label}>Client</label>
              <select style={S.sel} value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))}>
                <option value="">Select client…</option>
                {users.map(u => <option key={u.email} value={u.email}>{u.name} — {u.email}</option>)}
              </select>
            </div>
            <div style={S.g2}>
              <div>
                <label style={S.label}>Coin</label>
                <select style={S.sel} value={form.coin} onChange={e => setForm(f => ({ ...f, coin: e.target.value }))}>
                  {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Network</label>
                <select style={S.sel} value={form.network} onChange={e => setForm(f => ({ ...f, network: e.target.value }))}>
                  {["ERC-20", "BEP-20", "TRC-20", "Native"].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={S.label}>Amount (USD)</label>
              <input type="number" min="0" style={S.inp} placeholder="1000.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} onKeyDown={e => e.key === "Enter" && doDeposit()} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...btn("success"), flex: 1, padding: "12px", fontSize: 14 }} onClick={doDeposit}>Credit Deposit</button>
              <button style={{ ...btn("ghost"), padding: "12px 20px" }} onClick={() => setForm({ user: "", coin: "BTC", amount: "", network: "ERC-20" })}>Reset</button>
            </div>
            <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.6 }}>Credits the selected client's balance and logs the deposit in their transaction history immediately.</div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Vault Health</div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { label: "Total Clients", value: users.length },
              { label: "Total Equity", value: "$" + fmt(users.reduce((a, u) => a + u.balance, 0)) },
              { label: "Total Portfolio", value: "$" + fmt(users.reduce((a, u) => a + u.portfolio, 0)) },
              { label: "Pending Deposits", value: pendingD.length },
              { label: "Live Tickers", value: COINS.length },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", background: `rgba(138,43,226,.06)`, borderRadius: 10 }}>
                <span style={{ color: C.text2, fontSize: 13 }}>{item.label}</span>
                <strong style={{ color: C.text }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Deposit Log</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID", "Client", "Coin", "Amount", "USD Value", "Fee", "Network", "Submitted", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pendingD.length === 0 ? (
                <tr><td colSpan={9} style={{ ...S.td, textAlign: "center", color: C.text3, padding: "30px" }}>No deposits yet.</td></tr>
              ) : pendingD.map(tx => (
                <tr key={tx.id}>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.text3, fontSize: 11 }}>{tx.id}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>{tx.user}</td>
                  <td style={S.td}><div style={S.row}><CoinIcon sym={tx.coin} size={20} /><span style={{ fontWeight: 700 }}>{tx.coin}</span></div></td>
                  <td style={{ ...S.td, fontFamily: "monospace" }}>{tx.amount}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: C.green }}>${fmt(tx.usd)}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.text3 }}>${fmt(tx.fee)}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>{tx.network}</td>
                  <td style={{ ...S.td, fontSize: 11, color: C.text3 }}>{tx.submitted}</td>
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={{ ...btn("success"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setPending(prev => prev.filter(t => t.id !== tx.id)); showToast("Deposit confirmed", "success"); }}>Confirm</button>
                      <button style={{ ...btn("danger"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setPending(prev => prev.filter(t => t.id !== tx.id)); showToast("Deposit removed", "info"); }}>Remove</button>
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
}

// ─── ADMIN WITHDRAWALS ────────────────────────────────────────────────────────
export function AdminWithdrawals() {
  const { users, pending, setPending, showAlert, showToast } = useApp();
  const [form, setForm] = useState({ user: "", coin: "BTC", amount: "", network: "ERC-20" });
  const pendingW = pending.filter(p => p.type === "Withdrawal");

  const doCreate = useCallback(() => {
    const target = form.user;
    const amount = Number(form.amount);
    if (!target || !amount || amount <= 0) { showAlert("Select client and enter amount"); return; }
    const tx = {
      id: `WD${Date.now()}`, user: target, type: "Withdrawal", coin: form.coin,
      amount: +(amount / (BASE_PRICES[form.coin] || 1)).toFixed(6),
      usd: amount, fee: +(amount * .0015).toFixed(2),
      submitted: new Date().toLocaleString(), network: form.network,
    };
    setPending(prev => [tx, ...prev]);
    setForm({ user: "", coin: "BTC", amount: "", network: "ERC-20" });
    showToast("Withdrawal request created", "success");
  }, [form, setPending, showAlert, showToast]);

  return (
    <div>
      <div style={S.hd}>Withdrawal Requests</div>
      <div style={S.sub}>Review and process client withdrawal requests</div>

      <div style={{ ...S.g3, marginBottom: 22 }}>
        {[
          { l: "Pending Withdrawals", v: "$" + fmt(pendingW.reduce((a, b) => a + b.usd, 0)) },
          { l: "Avg Amount", v: "$" + fmt(pendingW.length > 0 ? pendingW.reduce((a, b) => a + b.usd, 0) / pendingW.length : 0) },
          { l: "Total Fees", v: "$" + fmt(pendingW.reduce((a, b) => a + b.fee, 0)) },
        ].map((s, i) => (
          <div key={i} style={S.scard}>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, marginBottom: 22 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>Create Withdrawal Request</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Client</label>
            <select style={S.sel} value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))}>
              <option value="">Select client…</option>
              {users.map(u => <option key={u.email} value={u.email}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Coin</label>
            <select style={S.sel} value={form.coin} onChange={e => setForm(f => ({ ...f, coin: e.target.value }))}>
              {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Network</label>
            <select style={S.sel} value={form.network} onChange={e => setForm(f => ({ ...f, network: e.target.value }))}>
              {["ERC-20", "BEP-20", "TRC-20", "Native"].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Amount (USD)</label>
            <input type="number" min="0" style={S.inp} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="1000" onKeyDown={e => e.key === "Enter" && doCreate()} />
          </div>
        </div>
        <button style={{ ...btn("success"), padding: "11px 24px", fontSize: 14 }} onClick={doCreate}>Create Request</button>
      </div>

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID", "Client", "Coin", "Amount", "USD", "Fee", "Network", "Submitted", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pendingW.length === 0 ? (
                <tr><td colSpan={9} style={{ ...S.td, textAlign: "center", color: C.text3, padding: "30px" }}>No pending withdrawals.</td></tr>
              ) : pendingW.map(tx => (
                <tr key={tx.id}>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.text3, fontSize: 11 }}>{tx.id}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>{tx.user}</td>
                  <td style={S.td}><div style={S.row}><CoinIcon sym={tx.coin} size={20} /><span style={{ fontWeight: 700 }}>{tx.coin}</span></div></td>
                  <td style={{ ...S.td, fontFamily: "monospace" }}>{tx.amount}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700 }}>${fmt(tx.usd)}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.gold }}>${fmt(tx.fee)}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>{tx.network}</td>
                  <td style={{ ...S.td, fontSize: 11, color: C.text3 }}>{tx.submitted}</td>
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={{ ...btn("success"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setPending(prev => prev.filter(t => t.id !== tx.id)); showToast("Withdrawal approved", "success"); }}>Approve</button>
                      <button style={{ ...btn("danger"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setPending(prev => prev.filter(t => t.id !== tx.id)); showToast("Withdrawal rejected", "info"); }}>Reject</button>
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
}

// ─── ADMIN PENDING ────────────────────────────────────────────────────────────
export function AdminPending() {
  const { pending, setPending, showToast } = useApp();
  const pendingW = pending.filter(p => p.type === "Withdrawal");
  const pendingD = pending.filter(p => p.type === "Deposit");

  return (
    <div>
      <div style={S.hd}>Pending Transactions</div>
      <div style={S.sub}>All transactions awaiting review or processing</div>
      <div style={{ ...S.g3, marginBottom: 22 }}>
        {[
          { l: "Total Pending", v: pending.length, c: C.gold },
          { l: "Withdrawals", v: pendingW.length, c: C.red },
          { l: "Deposits", v: pendingD.length, c: C.green },
        ].map((s, i) => (
          <div key={i} style={{ ...S.scard, borderLeft: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 6, textTransform: "uppercase" }}>{s.l}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.text }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID", "Client", "Type", "Coin", "Amount", "USD", "Fee", "Network", "Submitted", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={10} style={{ ...S.td, textAlign: "center", color: C.text3, padding: "30px" }}>No pending transactions.</td></tr>
              ) : pending.map(tx => (
                <tr key={tx.id}>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.text3, fontSize: 11 }}>{tx.id}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>{tx.user}</td>
                  <td style={S.td}><Tag c={tx.type === "Deposit" ? "green" : "red"}>{tx.type}</Tag></td>
                  <td style={S.td}><div style={S.row}><CoinIcon sym={tx.coin} size={20} /><span style={{ fontWeight: 700 }}>{tx.coin}</span></div></td>
                  <td style={{ ...S.td, fontFamily: "monospace" }}>{tx.amount}</td>
                  <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(tx.usd)}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.gold }}>${fmt(tx.fee)}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>{tx.network}</td>
                  <td style={{ ...S.td, fontSize: 11, color: C.text3 }}>{tx.submitted}</td>
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={{ ...btn("success"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setPending(prev => prev.filter(t => t.id !== tx.id)); showToast("TX approved: " + tx.id, "success"); }}>Approve</button>
                      <button style={{ ...btn("danger"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setPending(prev => prev.filter(t => t.id !== tx.id)); showToast("TX rejected", "info"); }}>Reject</button>
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
}

// ─── ADMIN FEES ───────────────────────────────────────────────────────────────
export function AdminFees() {
  const { users, feeReqs, setFeeReqs, pending, showAlert, showToast } = useApp();
  const [form, setForm] = useState({ user: "", amount: "", reason: "Service fee", currency: "USD" });
  const rev = pending.reduce((a, b) => a + b.fee, 0) * .6;

  const doCreate = useCallback(() => {
    const target = form.user;
    const amount = Number(form.amount);
    if (!target || !amount || amount <= 0) { showAlert("Select client and enter amount"); return; }
    setFeeReqs(prev => [{
      id: `FR${String(prev.length + 1).padStart(5, "0")}`,
      user: target, amount, reason: form.reason || "Service fee",
      currency: form.currency, created: new Date().toLocaleString(), status: "Pending",
    }, ...prev]);
    setForm({ user: "", amount: "", reason: "Service fee", currency: "USD" });
    showToast("Fee request issued", "success");
  }, [form, setFeeReqs, showAlert, showToast]);

  return (
    <div>
      <div style={{ ...S.rowsb, marginBottom: 22 }}>
        <div><div style={S.hd}>Fee Collection</div><div style={S.sub}>Issue and manage fee requests from clients</div></div>
        <button style={btn("success")} onClick={() => showToast("Dashboard refreshed", "success")}>Refresh</button>
      </div>

      <div style={{ ...S.g4, marginBottom: 22 }}>
        {[
          { l: "Active Clients", v: users.length, c: C.purple3, icon: "👥" },
          { l: "Pending Requests", v: feeReqs.length, c: C.green, icon: "⏳" },
          { l: "Collected Fees", v: "$" + fmt(rev), c: C.gold, icon: "💰" },
          { l: "Price Feed", v: "Live", c: C.accent, icon: "🔗" },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 14, right: 16, fontSize: 24 }}>{s.icon}</div>
            <div style={{ fontSize: 10, color: C.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.card, marginBottom: 22 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 18 }}>Request Fee Payment</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={S.label}>Client</label>
            <select style={S.sel} value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))}>
              <option value="">Select client…</option>
              {users.map(u => <option key={u.email} value={u.email}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Amount</label>
            <input type="number" min="1" style={S.inp} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="100" />
          </div>
          <div>
            <label style={S.label}>Currency</label>
            <select style={S.sel} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              {["USD", "BTC", "ETH"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Reason</label>
            <input style={S.inp} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Maintenance fee" />
          </div>
        </div>
        <button style={{ ...btn("success"), padding: "11px 24px", fontSize: 14 }} onClick={doCreate}>Send Fee Request</button>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Outstanding Requests</div>
        <div style={{ overflowX: "auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["Req ID", "Client", "Amount", "Reason", "Currency", "Status", "Created", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {feeReqs.length === 0 ? (
                <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: C.text3, padding: "30px" }}>No fee requests yet.</td></tr>
              ) : feeReqs.map(r => (
                <tr key={r.id}>
                  <td style={{ ...S.td, fontFamily: "monospace", color: C.text3, fontSize: 11 }}>{r.id}</td>
                  <td style={{ ...S.td, fontSize: 12 }}>{r.user}</td>
                  <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700 }}>{r.amount}</td>
                  <td style={S.td}>{r.reason}</td>
                  <td style={{ ...S.td, fontFamily: "monospace" }}>{r.currency}</td>
                  <td style={S.td}><Tag c={r.status === "Pending" ? "yellow" : "green"}>{r.status}</Tag></td>
                  <td style={{ ...S.td, color: C.text3, fontSize: 12 }}>{r.created}</td>
                  <td style={S.td}>
                    <button style={{ ...btn("danger"), padding: "4px 12px", fontSize: 12 }} onClick={() => { setFeeReqs(prev => prev.filter(x => x.id !== r.id)); showToast("Removed", "info"); }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN MARKETS ────────────────────────────────────────────────────────────
export function AdminMarkets() {
  const prices = usePrices();
  return (
    <div>
      <div style={S.hd}>Live Markets</div>
      <div style={S.sub}><span style={S.ldot} />Real-time prices across all pairs</div>
      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["Asset", "Price", "24h Change", "Bid", "Ask", "Volume", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {COINS.map(coin => {
                const p = prices[coin.sym], up = p.change >= 0;
                return (
                  <tr key={coin.sym}>
                    <td style={S.td}>
                      <div style={S.row}><CoinIcon sym={coin.sym} size={26} /><div><div style={{ fontWeight: 700, color: C.text }}>{coin.sym}</div><div style={{ fontSize: 11, color: C.text3 }}>{coin.name}</div></div></div>
                    </td>
                    <td style={{ ...S.td, fontFamily: "monospace", fontWeight: 700, color: C.text }}>${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}</td>
                    <td style={S.td}><span style={{ color: up ? C.green : C.red, fontWeight: 600 }}>{up ? "+" : ""}{fmt(p.change)}%</span></td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.green }}>${fmt(p.price * .999)}</td>
                    <td style={{ ...S.td, fontFamily: "monospace", color: C.red }}>${fmt(p.price * 1.001)}</td>
                    <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(p.price * 21000 / 1000, 1)}K</td>
                    <td style={S.td}><Tag c="green">Active</Tag></td>
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

// ─── ADMIN SETTINGS ───────────────────────────────────────────────────────────
export function AdminSettings() {
  const { showToast } = useApp();
  return (
    <div>
      <div style={S.hd}>Platform Settings</div>
      <div style={S.sub}>Configure VaultXcrypto platform parameters</div>
      <div style={S.g2}>
        {[
          { title: "Trading", fields: [["Trading Fee (%)", "0.10"], ["Min Trade ($)", "10"], ["Max Trade ($)", "100,000"], ["Daily Withdrawal Limit ($)", "50,000"]] },
          { title: "Security", fields: [["2FA Required", "Enabled"], ["KYC Level", "Level 2"], ["Session Timeout (min)", "30"], ["IP Whitelist", "Disabled"]] },
          { title: "Email", fields: [["SMTP Host", "smtp.sendgrid.net"], ["From Email", "noreply@vaultx.io"], ["Email Verification", "Enabled"], ["Deposit Alerts", "Enabled"]] },
          { title: "Network Fees", fields: [["BTC Network", "0.0005 BTC"], ["ETH Gas (Gwei)", "Auto"], ["BNB Fee", "0.0005 BNB"], ["SOL Fee", "0.000025 SOL"]] },
        ].map((s, i) => (
          <div key={i} style={S.card}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>{s.title}</div>
            {s.fields.map(([l, v]) => (
              <div key={l} style={{ marginBottom: 14 }}>
                <label style={S.label}>{l}</label>
                <input style={S.inp} defaultValue={v} />
              </div>
            ))}
            <button style={{ ...btn("success"), marginTop: 6, padding: "10px 20px" }} onClick={() => showToast("Settings saved!", "success")}>Save Changes</button>
          </div>
        ))}
      </div>
    </div>
  );
}
