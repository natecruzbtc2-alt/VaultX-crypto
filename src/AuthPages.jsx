import { Footer } from "./Pages";
import { useState, useCallback } from "react";
import { useApp, ADMIN_CREDS, createHoldings, createStaking, usePrices, COINS, fmt } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { TickerBar, Spark } from "./components";


function NavBar() {
  const { setView } = useApp();
  return (
    <nav style={S.nav}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView("landing")}>
        <img src="/logo.png" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} alt="VaultX"
          onError={e => { e.target.style.display = "none"; }} />
        <span style={{ fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-.5px", color: C.text }}>VaultXcrypto</span>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C.text3, cursor: "pointer" }} onClick={() => setView("about")}
          onMouseEnter={e => e.target.style.color = C.purple3} onMouseLeave={e => e.target.style.color = C.text3}>About</span>
        <span style={{ fontSize: 13, color: C.text3, cursor: "pointer" }} onClick={() => setView("contact")}
          onMouseEnter={e => e.target.style.color = C.purple3} onMouseLeave={e => e.target.style.color = C.text3}>Contact</span>
        <button style={{ ...btn("ghost"), padding: "7px 16px", fontSize: 13 }} onClick={() => setView("login")}>Sign In</button>
        <button style={{ ...btn(), padding: "7px 16px", fontSize: 13 }} onClick={() => setView("register")}>Get Started</button>
      </div>
    </nav>
  );
}

export function LandingPage() {
  const { setView } = useApp();
  const prices = usePrices();

  const navigate = (page) => {
    const pageMap = { trade:"register", portfolio:"register", staking:"register", markets:"register", wallet:"register", about:"about", contact:"contact", privacy:"privacy", terms:"terms", "privacy-policy":"privacy", "terms-of-service":"terms", "cookie-policy":"terms", help:"contact", security:"contact", "fees":"contact", status:"contact" };
    setView(pageMap[page] || page);
  };

  return (
    <div style={S.app}>
      <style>{globalCSS}</style>
      <NavBar />
      <TickerBar />
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "56px 24px 0" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(138,43,226,.1)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "5px 18px", fontSize: 12, color: C.purple3, marginBottom: 24 }}>
            <span style={S.ldot} /> Live market data · Real-time trading · UK Regulated
          </div>
          <h1 style={{ fontSize: 58, fontWeight: 800, letterSpacing: "-2.5px", lineHeight: 1.08, color: C.text, marginBottom: 20 }}>
            The exclusive way<br />to trade{" "}
            <span style={{ background: `linear-gradient(135deg,${C.purple},${C.purple3})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>crypto.</span>
          </h1>
          <p style={{ color: C.text3, fontSize: 17, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Real-time prices, portfolio analytics, staking rewards and instant transfers — all in one elite vault platform. Trusted by 50,000+ traders worldwide.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <button style={{ ...btn(), padding: "14px 36px", fontSize: 15 }} onClick={() => setView("register")}>Start Trading Free</button>
            <button style={{ ...btn("ghost"), padding: "14px 36px", fontSize: 15 }} onClick={() => setView("login")}>Sign In</button>
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: C.text3 }}>
            ✓ No hidden fees &nbsp;·&nbsp; ✓ Secure & encrypted &nbsp;·&nbsp; ✓ 24/7 support &nbsp;·&nbsp; ✓ VaultX Ltd — UK Registered
          </div>
        </div>

        {/* Stats */}
        <div style={{ ...S.card, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, marginBottom: 40, padding: 0, overflow: "hidden" }}>
          {[["$2.4T", "Total Market Cap"], ["$94B", "24h Volume"], ["50,000+", "Active Traders"], ["0.10%", "Trading Fee"]].map(([v, l], i) => (
            <div key={i} style={{ padding: "22px 28px", borderRight: i < 3 ? `1px solid ${C.border2}` : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.purple3 }}>{v}</div>
              <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Coin cards */}
        <div style={{ ...S.g4, marginBottom: 40 }}>
          {COINS.slice(0, 4).map(coin => {
            const p = prices[coin.sym], up = p.change >= 0;
            return (
              <div key={coin.sym} style={{ ...S.card, position: "relative", overflow: "hidden", cursor: "pointer" }} onClick={() => setView("register")}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at top right,${coin.color}12,transparent)`, pointerEvents: "none" }} />
                <div style={S.rowsb}>
                  <div style={S.row}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: coin.bg, border: `1px solid ${coin.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: coin.color }}>{coin.sym.slice(0, 3)}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{coin.sym}</div>
                      <div style={{ fontSize: 11, color: C.text3 }}>{coin.name}</div>
                    </div>
                  </div>
                  <span style={S.tag(up ? "green" : "red")}>{up ? "+" : ""}{fmt(p.change)}%</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}</div>
                  <div style={{ marginTop: 10 }}><Spark data={p.spark} color={up ? C.purple : C.red} /></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Market table */}
        <div style={{ ...S.card, marginBottom: 40 }}>
          <div style={{ ...S.rowsb, marginBottom: 18 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Live Market</span>
            <span style={{ fontSize: 12, color: C.text3 }}><span style={S.ldot} />Auto-refresh every 2.5s</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["#", "Asset", "Price", "24h Change", "Market Cap", "Volume", "7D Chart", ""].map((h, i) => <th key={i} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {COINS.map((coin, i) => {
                  const p = prices[coin.sym], up = p.change >= 0;
                  return (
                    <tr key={coin.sym}>
                      <td style={S.td}><span style={{ color: C.text3, fontWeight: 600 }}>{i + 1}</span></td>
                      <td style={S.td}>
                        <div style={S.row}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: coin.bg, border: `1px solid ${coin.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: coin.color }}>{coin.sym.slice(0, 3)}</div>
                          <div><div style={{ fontWeight: 700, color: C.text }}>{coin.sym}</div><div style={{ fontSize: 11, color: C.text3 }}>{coin.name}</div></div>
                        </div>
                      </td>
                      <td style={{ ...S.td, fontWeight: 700, color: C.text, fontFamily: "monospace" }}>${p.price < 1 ? p.price.toFixed(4) : fmt(p.price)}</td>
                      <td style={S.td}><span style={{ color: up ? C.green : C.red, fontWeight: 600 }}>{up ? "+" : ""}{fmt(p.change)}%</span></td>
                      <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(p.price * 19000000 / 1e9, 1)}B</td>
                      <td style={{ ...S.td, fontFamily: "monospace" }}>${fmt(p.price * 210000 / 1e6, 1)}M</td>
                      <td style={S.td}><Spark data={p.spark} color={up ? C.purple : C.red} w={80} h={28} /></td>
                      <td style={S.td}><button style={{ ...btn(), padding: "6px 16px", fontSize: 12 }} onClick={() => setView("register")}>Trade</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Features */}
        <div style={{ ...S.g3, marginBottom: 0 }}>
          {[
            { icon: "🔐", t: "Bank-Grade Security", d: "Multi-sig wallets, cold storage, 2FA and insurance backed vaults protect your assets." },
            { icon: "⚡", t: "Instant Settlements", d: "Sub-second trades with deep liquidity across 200+ trading pairs worldwide." },
            { icon: "📈", t: "Staking & Yield", d: "Earn up to 18% APY by staking your idle crypto assets with flexible terms." },
            { icon: "💸", t: "Ultra-Low Fees", d: "Industry-lowest trading fees starting at just 0.10% per trade with no hidden costs." },
            { icon: "📊", t: "Advanced Analytics", d: "Real-time charts, portfolio tracking, profit/loss reports and tax summaries." },
            { icon: "🌍", t: "Global Transfers", d: "Send crypto anywhere in the world in seconds with minimal network fees." },
          ].map((f, i) => (
            <div key={i} style={{ ...S.scard, marginBottom: 16 }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 8, fontSize: 15 }}>{f.t}</div>
              <div style={{ fontSize: 13, color: C.text3, lineHeight: 1.7 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Live Chat - Tawk.to */}
      <script dangerouslySetInnerHTML={{ __html: `
        var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();
        (function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;s1.src='https://embed.tawk.to/682cba5f50abe41913d56ca1/1irm5mf05';
        s1.charset='UTF-8';s1.setAttribute('crossorigin','*');s0.parentNode.insertBefore(s1,s0);})();
      `}} />
    </div>
  );
}

export function LoginPage() {
  const { setView, users, showToast, showAlert, alert, setUser, setDashTab } = useApp();
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPw,   setAdminPw]   = useState("");

  const doLogin = useCallback(() => {
    if (!email || !password) { showAlert("Fill in all fields"); return; }
    const u = users.find(u => u.email === email);
    if (!u) { showAlert("User not found"); return; }
    if (u.password && u.password !== password) { showAlert("Invalid credentials"); return; }
    setUser(u); setView("dashboard"); setDashTab("overview");
    showToast("Welcome back, " + u.name.split(" ")[0] + "!", "success");
  }, [email, password, users, showAlert, showToast, setUser, setView, setDashTab]);

  const doAdminLogin = useCallback(() => {
    if (adminUser !== ADMIN_CREDS.username || adminPw !== ADMIN_CREDS.password) {
      showAlert("Invalid admin credentials"); return;
    }
    setView("admin");
    showToast("Admin panel loaded", "success");
  }, [adminUser, adminPw, showAlert, showToast, setView]);

  return (
    <div style={S.app}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView("landing")}>
          <img src="/logo.png" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} alt="VaultX" onError={e => { e.target.style.display = "none"; }} />
          <span style={{ fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-.5px", color: C.text }}>VaultXcrypto</span>
        </div>
      </nav>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: 24 }}>
        <div style={S.authBox}>
          {!adminMode ? (
            <>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: C.text }}>Welcome back</div>
              <div style={{ fontSize: 14, color: C.text3, marginBottom: 28 }}>Sign in to your VaultX account</div>
              {alert && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{alert}</div>}
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Email Address</label>
                <input type="email" autoComplete="email" style={S.inp} placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={S.label}>Password</label>
                <input type="password" autoComplete="current-password" style={S.inp} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
              </div>
              <button style={{ ...btn(), width: "100%", padding: "13px", fontSize: 15 }} onClick={doLogin}>Sign In →</button>
              <div style={{ textAlign: "center", fontSize: 13, color: C.text3, marginTop: 20 }}>
                No account?{" "}<span style={{ color: C.purple3, cursor: "pointer", fontWeight: 600 }} onClick={() => setView("register")}>Create one free</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                <span style={{ fontSize: 12, color: C.text3, cursor: "pointer" }} onClick={() => setView("contact")}>Forgot password?</span>
                <span style={{ fontSize: 12, color: C.text3, cursor: "pointer", textDecoration: "underline" }} onClick={() => setAdminMode(true)}>Admin access</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: C.text }}>Admin Access</div>
              <div style={{ fontSize: 14, color: C.text3, marginBottom: 28 }}>Enter your admin credentials</div>
              {alert && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{alert}</div>}
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Username</label>
                <input type="text" autoComplete="username" style={S.inp} placeholder="admin" value={adminUser} onChange={e => setAdminUser(e.target.value)} onKeyDown={e => e.key === "Enter" && doAdminLogin()} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={S.label}>Password</label>
                <input type="password" autoComplete="current-password" style={S.inp} placeholder="••••••••" value={adminPw} onChange={e => setAdminPw(e.target.value)} onKeyDown={e => e.key === "Enter" && doAdminLogin()} />
              </div>
              <button style={{ ...btn(), width: "100%", padding: "13px", fontSize: 15 }} onClick={doAdminLogin}>Admin Sign In →</button>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <span style={{ fontSize: 12, color: C.text3, cursor: "pointer", textDecoration: "underline" }} onClick={() => setAdminMode(false)}>← Back to user login</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { setView, users, setUsers, showToast, showAlert, alert } = useApp();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [agreed,   setAgreed]   = useState(false);

  const doRegister = useCallback(() => {
    if (!name || !email || !password || !confirm) { showAlert("All fields required"); return; }
    if (password !== confirm) { showAlert("Passwords don't match"); return; }
    if (password.length < 6) { showAlert("Password must be at least 6 characters"); return; }
    if (!agreed) { showAlert("Please accept the Terms of Service to continue"); return; }
    if (users.some(u => u.email === email)) { showAlert("Email already registered"); return; }
    const nu = {
      id: `U${String(users.length + 1).padStart(4, "0")}`,
      name, email, password,
      balance: 0, portfolio: 0,
      holdings: createHoldings(0),
      staking: createStaking(0),
      joined: new Date().toLocaleDateString(),
      verified: true, status: "Active", tier: "Basic",
    };
    setUsers(prev => [...prev, nu]);
    showToast("Account created! Please sign in.", "success");
    setView("login");
  }, [name, email, password, confirm, agreed, users, setUsers, showAlert, showToast, setView]);

  return (
    <div style={S.app}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView("landing")}>
          <img src="/logo.png" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} alt="VaultX" onError={e => { e.target.style.display = "none"; }} />
          <span style={{ fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-.5px", color: C.text }}>VaultXcrypto</span>
        </div>
      </nav>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 60px)", padding: 24 }}>
        <div style={S.authBox}>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: C.text }}>Create your account</div>
          <div style={{ fontSize: 14, color: C.text3, marginBottom: 28 }}>Join VaultXcrypto — elite crypto platform</div>
          {alert && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{alert}</div>}
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Full Name</label>
            <input type="text" autoComplete="name" style={S.inp} placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Email Address</label>
            <input type="email" autoComplete="email" style={S.inp} placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Password</label>
            <input type="password" autoComplete="new-password" style={S.inp} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>Confirm Password</label>
            <input type="password" autoComplete="new-password" style={S.inp} placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && doRegister()} />
          </div>
          {/* Terms checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 24 }}>
            <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: C.purple, width: 16, height: 16, flexShrink: 0 }} />
            <label htmlFor="terms" style={{ fontSize: 13, color: C.text3, lineHeight: 1.6, cursor: "pointer" }}>
              I agree to the{" "}
              <span style={{ color: C.purple3, cursor: "pointer" }} onClick={() => setView("terms")}>Terms of Service</span>
              {" "}and{" "}
              <span style={{ color: C.purple3, cursor: "pointer" }} onClick={() => setView("privacy")}>Privacy Policy</span>
              . I confirm I am 18+ years old.
            </label>
          </div>
          <button style={{ ...btn(), width: "100%", padding: "13px", fontSize: 15 }} onClick={doRegister}>Create Account →</button>
          <div style={{ textAlign: "center", fontSize: 13, color: C.text3, marginTop: 20 }}>
            Already have an account?{" "}<span style={{ color: C.purple3, cursor: "pointer", fontWeight: 600 }} onClick={() => setView("login")}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
