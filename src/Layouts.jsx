import { useApp } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { TickerMini } from "./components";
import { DashOverview, DashMarkets, DashWallet, DashPortfolio, DashStaking, DashHistory } from "./DashTabs";
import { AdminUsers, AdminDeposits, AdminWallets, AdminWithdrawals, AdminPending, AdminFees, AdminMarkets, AdminSettings, AgentDepositBoard } from "./AdminTabs";

export function Dashboard() {
  const { user, dashTab, setDashTab, setView, doLogout, getUserFeeReqs } = useApp();
  const pendingFees = getUserFeeReqs(user?.email);

  const navItems = [
    { id:"overview",  icon:"⬡", label:"Overview"  },
    { id:"markets",   icon:"◈", label:"Markets"   },
    { id:"wallet",    icon:"◎", label:"Wallet"    },
    { id:"portfolio", icon:"◑", label:"Portfolio" },
    { id:"staking",   icon:"◆", label:"Staking"   },
    { id:"history",   icon:"◫", label:"History"   },
  ];

  return (
    <div style={{ ...S.app, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setView("landing")}>
          <img src="/logo.png" style={{ width:36, height:36, borderRadius:10, objectFit:"cover" }} alt="VaultX" onError={e=>{e.target.style.display="none";}}/>
          <span style={{ fontSize:17, fontWeight:800, textTransform:"uppercase", letterSpacing:"-.5px", color:C.text }}>VaultXcrypto</span>
        </div>
        <TickerMini />
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {pendingFees.length > 0 && (
            <div style={{ background:"rgba(245,158,11,.15)", border:"1px solid rgba(245,158,11,.4)", borderRadius:8, padding:"5px 12px", fontSize:12, color:C.gold, cursor:"pointer" }}
              onClick={() => setDashTab("overview")}>
              ⚠️ {pendingFees.length} pending fee{pendingFees.length>1?"s":""}
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"6px 10px", borderRadius:8, transition:"background .15s" }}
            onClick={() => setView("settings")}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(138,43,226,.1)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple2},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight:600, color:C.text, fontSize:13 }}>{user?.name?.split(" ")[0]}</span>
          </div>
          <button style={{ ...btn("ghost"), padding:"7px 16px", fontSize:12 }} onClick={doLogout}>Logout</button>
        </div>
      </nav>

      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>
        <div style={S.sidebar}>
          {navItems.map(it => (
            <button key={it.id} style={S.sitem(dashTab===it.id)} onClick={() => setDashTab(it.id)}>
              <span style={{ fontSize:15, color:dashTab===it.id?C.purple3:C.text3 }}>{it.icon}</span>
              {it.label}
              {it.id==="overview" && pendingFees.length>0 && (
                <span style={{ marginLeft:"auto", background:"rgba(245,158,11,.3)", color:C.gold, borderRadius:10, fontSize:10, padding:"1px 7px", fontWeight:700 }}>
                  {pendingFees.length}
                </span>
              )}
            </button>
          ))}
          <div style={{ flex:1 }}/>
          <button style={{ ...S.sitem(false) }} onClick={() => setView("settings")}>
            <span style={{ fontSize:15 }}>⚙️</span> Settings
          </button>
          <button style={{ ...S.sitem(false) }} onClick={() => { if(window.Tawk_API && window.Tawk_API.maximize){window.Tawk_API.maximize();}else{window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950','_blank');} }}>
            <span style={{ fontSize:15 }}>💬</span> Live Support
          </button>
          <div style={{ padding:"14px 16px", background:`rgba(138,43,226,.1)`, border:`1px solid ${C.border}`, borderRadius:12, marginTop:8 }}>
            <div style={{ fontSize:10, color:C.text3, marginBottom:5, textTransform:"uppercase", letterSpacing:".06em" }}>Total Balance</div>
            <div style={{ fontSize:18, fontWeight:800, color:C.purple3 }}>${(user?.balance||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
            <div style={{ fontSize:11, color:C.text3, marginTop:4 }}>Portfolio: ${(user?.portfolio||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
          {dashTab==="overview"  && <DashOverview />}
          {dashTab==="markets"   && <DashMarkets />}
          {dashTab==="wallet"    && <DashWallet />}
          {dashTab==="portfolio" && <DashPortfolio />}
          {dashTab==="staking"   && <DashStaking />}
          {dashTab==="history"   && <DashHistory />}
        </div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  const { adminTab, setAdminTab, doLogout, setView, users, pending, feeReqs } = useApp();
  const pendingCount = pending.length;
  const feeCount     = feeReqs.filter(r=>r.status==="Pending").length;

  const navItems = [
    { id:"users",       icon:"👥", label:"Users & Funds",   badge:users.length },
    { id:"deposits",    icon:"📥", label:"Deposits"         },
    { id:"wallets",     icon:"🏦", label:"Wallets"          },
    { id:"withdrawals", icon:"📤", label:"Withdrawals",     badge:pending.filter(p=>p.type==="Withdrawal"||p.type==="Withdrawal Request").length },
    { id:"pending",     icon:"⏳", label:"Pending Tx",      badge:pendingCount },
    { id:"fees",        icon:"💰", label:"Fees",            badge:feeCount },
    { id:"markets",     icon:"📈", label:"Markets"          },
    { id:"board",       icon:"🏆", label:"Deposit Board"    },
    { id:"settings",    icon:"⚙️", label:"Settings"         },
  ];

  return (
    <div style={{ ...S.app, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
      <style>{globalCSS}</style>
      <nav style={{ ...S.nav, borderBottom:"1px solid rgba(239,68,68,.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setView("landing")}>
          <div style={{ ...S.logoMark, background:"linear-gradient(135deg,#b91c1c,#dc2626)", boxShadow:"0 0 20px rgba(220,38,38,.4)" }}>AD</div>
          <span style={{ fontSize:17, fontWeight:800, textTransform:"uppercase", letterSpacing:"-.5px", color:C.text }}>VaultXcrypto</span>
          <span style={{ ...S.tag("red"), marginLeft:6, fontSize:11 }}>Admin Panel</span>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center", fontSize:12, color:C.text3 }}>
          {pendingCount > 0 && <span style={{ color:C.gold }}>⏳ {pendingCount} pending</span>}
          {feeCount > 0 && <span style={{ color:C.green }}>💰 {feeCount} fee requests</span>}
          <span>🔐 admin@system</span>
          <button style={{ ...btn("ghost"), padding:"7px 16px", fontSize:12 }} onClick={doLogout}>Logout</button>
        </div>
      </nav>
      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }}>
        <div style={S.sidebar}>
          {navItems.map(it => (
            <button key={it.id} style={S.sitem(adminTab===it.id)} onClick={() => setAdminTab(it.id)}>
              <span style={{ fontSize:15 }}>{it.icon}</span>
              {it.label}
              {it.badge > 0 && (
                <span style={{ marginLeft:"auto", background:adminTab===it.id?"rgba(255,255,255,.2)":"rgba(138,43,226,.3)", color:adminTab===it.id?C.text:C.purple3, borderRadius:10, fontSize:10, padding:"1px 7px", fontWeight:700 }}>
                  {it.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
          {adminTab==="users"       && <AdminUsers />}
          {adminTab==="deposits"    && <AdminDeposits />}
          {adminTab==="wallets"     && <AdminWallets />}
          {adminTab==="withdrawals" && <AdminWithdrawals />}
          {adminTab==="pending"     && <AdminPending />}
          {adminTab==="fees"        && <AdminFees />}
          {adminTab==="markets"     && <AdminMarkets />}
          {adminTab==="board"       && <AgentDepositBoard />}
          {adminTab==="settings"    && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
