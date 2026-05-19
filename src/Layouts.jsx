import { useApp } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { TickerMini } from "./components";
import { DashOverview, DashMarkets, DashWallet, DashPortfolio, DashStaking, DashHistory } from "./DashTabs";
import { AdminUsers, AdminDeposits, AdminWithdrawals, AdminPending, AdminFees, AdminMarkets, AdminSettings } from "./AdminTabs";

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user, dashTab, setDashTab, doLogout } = useApp();

  const navItems = [
    { id: "overview",  icon: "⬡", label: "Overview"  },
    { id: "markets",   icon: "◈", label: "Markets"   },
    { id: "wallet",    icon: "◎", label: "Wallet"    },
    { id: "portfolio", icon: "◑", label: "Portfolio" },
    { id: "staking",   icon: "◆", label: "Staking"   },
    { id: "history",   icon: "◫", label: "History"   },
  ];

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <style>{globalCSS}</style>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.logo}>
          <div style={S.logoMark}>VX</div>VaultXcrypto
        </div>
        <TickerMini />
        <div style={S.row}>
          <div style={{ fontSize: 13, color: C.text2, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.purple2},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, color: C.text }}>{user?.name}</span>
          </div>
          <button style={{ ...btn("ghost"), padding: "7px 16px", fontSize: 12 }} onClick={doLogout}>Logout</button>
        </div>
      </nav>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          {navItems.map(it => (
            <button key={it.id} style={S.sitem(dashTab === it.id)} onClick={() => setDashTab(it.id)}>
              <span style={{ fontSize: 15, color: dashTab === it.id ? C.purple3 : C.text3 }}>{it.icon}</span>
              {it.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* Portfolio widget */}
          <div style={{ padding: "14px 16px", background: `rgba(138,43,226,.1)`, border: `1px solid ${C.border}`, borderRadius: 12, marginTop: 10 }}>
            <div style={{ fontSize: 10, color: C.text3, marginBottom: 5, textTransform: "uppercase", letterSpacing: ".06em" }}>Portfolio</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.purple3 }}>${(user?.portfolio || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>Cash: ${(user?.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {dashTab === "overview"  && <DashOverview />}
          {dashTab === "markets"   && <DashMarkets />}
          {dashTab === "wallet"    && <DashWallet />}
          {dashTab === "portfolio" && <DashPortfolio />}
          {dashTab === "staking"   && <DashStaking />}
          {dashTab === "history"   && <DashHistory />}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
export function AdminPanel() {
  const { adminTab, setAdminTab, doLogout } = useApp();

  const navItems = [
    { id: "users",       icon: "👥", label: "Users & Funds"  },
    { id: "deposits",    icon: "📥", label: "Deposits"       },
    { id: "withdrawals", icon: "📤", label: "Withdrawals"    },
    { id: "pending",     icon: "⏳", label: "Pending Tx"     },
    { id: "fees",        icon: "💰", label: "Fees"           },
    { id: "markets",     icon: "📈", label: "Markets"        },
    { id: "settings",    icon: "⚙️", label: "Settings"       },
  ];

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <style>{globalCSS}</style>

      {/* Admin Nav */}
      <nav style={{ ...S.nav, borderBottom: "1px solid rgba(239,68,68,.2)" }}>
        <div style={S.logo}>
          <div style={{ ...S.logoMark, background: "linear-gradient(135deg,#b91c1c,#dc2626)", boxShadow: "0 0 20px rgba(220,38,38,.4)" }}>AD</div>
          VaultXcrypto
          <span style={{ ...S.tag("red"), marginLeft: 10, fontSize: 11 }}>Admin</span>
        </div>
        <div style={S.row}>
          <span style={{ fontSize: 12, color: C.text3 }}>🔐 admin@system</span>
          <button style={{ ...btn("ghost"), padding: "7px 16px", fontSize: 12 }} onClick={doLogout}>Logout</button>
        </div>
      </nav>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          {navItems.map(it => (
            <button key={it.id} style={S.sitem(adminTab === it.id)} onClick={() => setAdminTab(it.id)}>
              <span style={{ fontSize: 15 }}>{it.icon}</span>
              {it.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {adminTab === "users"       && <AdminUsers />}
          {adminTab === "deposits"    && <AdminDeposits />}
          {adminTab === "withdrawals" && <AdminWithdrawals />}
          {adminTab === "pending"     && <AdminPending />}
          {adminTab === "fees"        && <AdminFees />}
          {adminTab === "markets"     && <AdminMarkets />}
          {adminTab === "settings"    && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
