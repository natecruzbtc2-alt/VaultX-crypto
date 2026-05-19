import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, BASE_PRICES, fmt } from "./AppContext";
import { C, S, btn } from "./theme";

export function Modals() {
  const { modal, setModal } = useApp();
  if (!modal) return null;
  const close = () => setModal(null);

  if (modal === "deposit")          return <DepositModal close={close} />;
  if (modal === "send")             return <SendModal close={close} />;
  if (modal?.type === "userDetail") return <UserDetailModal close={close} />;
  if (modal?.type === "fundUser")   return <FundModal close={close} />;
  return null;
}

function DepositModal({ close }) {
  const { showToast } = useApp();
  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Deposit Crypto</div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>Contact our team for a secure deposit wallet address.</div>
        <div style={{ background: `rgba(138,43,226,.08)`, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>🔐 How deposits work</div>
          <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.8 }}>
            For security and compliance, deposit wallets are generated per-transaction by our team.
            Contact support with your desired coin and amount — you'll receive a dedicated wallet address within minutes.
          </div>
        </div>
        <div style={{ ...S.scard, marginBottom: 20, fontSize: 13 }}>
          <div style={{ color: C.text3, marginBottom: 4 }}>Support Email</div>
          <div style={{ color: C.purple3, fontWeight: 600 }}>📧 support@vaultxcrypto.io</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ ...btn("success"), flex: 1, padding: "12px" }} onClick={() => { window.open("mailto:support@vaultxcrypto.io?subject=Deposit%20Request", "_blank"); showToast("Opening support email…", "info"); }}>
            Contact Support
          </button>
          <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Close</button>
        </div>
      </div>
    </div>
  );
}

function SendModal({ close }) {
  const { user, updateUser, addTx, showAlert, showToast } = useApp();
  const prices = usePrices();
  const [address, setAddress] = useState("");
  const [coin, setCoin] = useState("BTC");
  const [amount, setAmount] = useState("");

  const doSend = useCallback(() => {
    const amt = Number(amount);
    if (!address.trim()) { showAlert("Enter recipient address"); return; }
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    const price = prices[coin]?.price || 1;
    const qty = +(amt / price).toFixed(6);
    const h = user?.holdings?.find(h => h.sym === coin);
    if (!h || qty > h.qty) { showAlert(`Insufficient ${coin} balance`); return; }
    updateUser({
      ...user,
      portfolio: Math.max(0, +(user.portfolio - amt).toFixed(2)),
      holdings: (user.holdings || []).map(h => h.sym === coin ? { ...h, qty: +(h.qty - qty).toFixed(6) } : h).filter(h => h.qty > 0),
    });
    addTx(user.email, { id: `TX${Date.now()}`, type: "Withdrawal", symbol: coin, amount: qty, value: amt, fee: 1.2, status: "Completed", date: new Date().toLocaleDateString() });
    showToast(`Sent ${qty} ${coin} to ${address.slice(0, 8)}…`, "success");
    close();
  }, [amount, coin, address, prices, user, updateUser, addTx, showAlert, showToast, close]);

  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Send Crypto</div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>Transfer to any wallet address instantly</div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Recipient Address</label>
          <input style={S.inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="0x… or wallet address" autoFocus />
        </div>
        <div style={{ ...S.g2, marginBottom: 14 }}>
          <div>
            <label style={S.label}>Coin</label>
            <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
              {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.inp} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" onKeyDown={e => e.key === "Enter" && doSend()} />
          </div>
        </div>
        {amount && <div style={{ ...S.scard, marginBottom: 14, fontSize: 13, color: C.text2 }}>Network fee: ~$1.20 · Estimated arrival: 1–3 minutes</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Cancel</button>
          <button style={{ ...btn("success"), flex: 1, padding: "12px" }} onClick={doSend}>Send →</button>
        </div>
      </div>
    </div>
  );
}

function UserDetailModal({ close }) {
  const { modal, setModal, showToast } = useApp();
  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 18 }}>Client Detail</div>
        <div style={{ ...S.scard, marginBottom: 18 }}>
          {[
            ["Name",      modal.user?.name],
            ["Email",     modal.user?.email],
            ["Balance",   "$" + fmt(modal.user?.balance)],
            ["Portfolio", "$" + fmt(modal.user?.portfolio)],
            ["Tier",      modal.user?.tier],
            ["Status",    modal.user?.status],
            ["Joined",    modal.user?.joined],
          ].map(([l, v]) => (
            <div key={l} style={{ ...S.rowsb, padding: "10px 0", borderBottom: `1px solid ${C.border2}` }}>
              <span style={{ color: C.text3, fontSize: 13 }}>{l}</span>
              <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...S.g2, marginBottom: 14 }}>
          <button style={{ ...btn("success"), justifyContent: "center", padding: "11px" }} onClick={() => setModal({ type: "fundUser", user: modal.user })}>
            + Fund Account
          </button>
          <button style={{ ...btn("danger"), justifyContent: "center", padding: "11px" }} onClick={() => { showToast("Account suspended", "info"); close(); }}>
            Suspend User
          </button>
        </div>
        <button style={{ ...btn("ghost"), width: "100%", padding: "11px" }} onClick={close}>Close</button>
      </div>
    </div>
  );
}

function FundModal({ close }) {
  const { modal, users, setUsers, user, setUser, addTx, showToast } = useApp();
  const [amt, setAmt] = useState("");
  const [coin, setCoin] = useState("BTC");

  const doFund = useCallback(() => {
    const amount = Number(amt);
    if (!amount || amount <= 0) { showToast("Enter a valid amount", "info"); return; }
    const idx = users.findIndex(u => u.email === modal.user.email);
    if (idx === -1) return;
    const updated = [...users];
    updated[idx] = {
      ...updated[idx],
      balance:   +(updated[idx].balance + amount).toFixed(2),
      portfolio: +(updated[idx].portfolio + amount).toFixed(2),
    };
    setUsers(updated);
    if (user && user.email === modal.user.email) setUser(updated[idx]);
    addTx(modal.user.email, {
      id: `DP${Date.now()}`, type: "Deposit", symbol: coin,
      amount: +(amount / (BASE_PRICES[coin] || 1)).toFixed(6),
      value: amount, fee: +(amount * .001).toFixed(2),
      status: "Completed", date: new Date().toLocaleDateString(),
    });
    showToast(`$${fmt(amount)} credited to ${modal.user.name}`, "success");
    close();
  }, [amt, coin, users, setUsers, user, setUser, addTx, showToast, modal, close]);

  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Fund Account</div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>
          Credit funds to <strong style={{ color: C.purple3 }}>{modal.user?.name}</strong>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Coin</label>
          <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
            {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={S.label}>Amount (USD)</label>
          <input type="number" style={S.inp} value={amt} onChange={e => setAmt(e.target.value)} placeholder="1000.00" autoFocus onKeyDown={e => e.key === "Enter" && doFund()} />
        </div>
        {amt && Number(amt) > 0 && (
          <div style={{ ...S.scard, marginBottom: 16, fontSize: 13, color: C.text2 }}>
            ≈ {(Number(amt) / (BASE_PRICES[coin] || 1)).toFixed(6)} {coin} will be credited
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Cancel</button>
          <button style={{ ...btn("success"), flex: 1, padding: "12px" }} onClick={doFund}>Credit Funds</button>
        </div>
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#0d0a1a", border: `1px solid rgba(138,43,226,.35)`,
      borderRadius: 12, padding: "13px 20px", fontSize: 13, color: C.text,
      display: "flex", alignItems: "center", gap: 10, minWidth: 240,
      boxShadow: `0 8px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(138,43,226,.2)`,
    }}>
      <span style={{ fontSize: 18 }}>
        {toast.type === "success" ? "✅" : toast.type === "info" ? "💜" : "⚠️"}
      </span>
      {toast.msg}
    </div>
  );
}
