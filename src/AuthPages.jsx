import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, fmt, createHoldings, createStaking } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { Spark } from "./components";
import { Footer } from "./Pages";

// ── TICKER BAR (light version) ─────────────────────────────────────────────
function LightTicker() {
  const prices = usePrices();
  return (
    <div style={{ background:C.bg3, borderBottom:`1px solid ${C.border}`, padding:"7px 0", overflow:"hidden", whiteSpace:"nowrap" }}>
      <div style={{ display:"inline-flex", gap:0 }}>
        {[...COINS,...COINS,...COINS].map((c,i) => {
          const p = prices[c.sym]; const up = (p?.change||0) >= 0;
          return (
            <span key={i} style={{ padding:"0 20px", fontSize:12, fontFamily:"monospace", color:C.text2, borderRight:`1px solid ${C.border2}` }}>
              {c.sym}/USD &nbsp;
              <strong style={{ color:C.text }}>${p?.price<1?p?.price?.toFixed(4):fmt(p?.price)}</strong>
              &nbsp;<span style={{ color:up?C.green:C.red, fontWeight:600 }}>{up?"+":""}{fmt(p?.change)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── LANDING ────────────────────────────────────────────────────────────────
export function LandingPage() {
  const { setView } = useApp();
  const prices = usePrices();

  const features = [
    { icon:"📈", t:"Live Trading",        d:"Real-time charts with instant buy/sell orders across 8 major coins." },
    { icon:"🔐", t:"Bank-Grade Security", d:"256-bit SSL, hashed passwords, anti-phishing codes." },
    { icon:"💼", t:"Portfolio Tracking",  d:"Full P&L breakdowns, allocation charts and transaction history." },
    { icon:"⚡", t:"Instant Execution",   d:"Orders execute at market price with 0.10% flat fee." },
    { icon:"🌍", t:"Global Access",       d:"Trade from anywhere, fully mobile optimised." },
    { icon:"💬", t:"24/7 Live Support",   d:"Real agents available around the clock via live chat." },
  ];

  const steps = [
    { n:"1", t:"Create Account", d:"Sign up in 60 seconds — no ID required to start trading." },
    { n:"2", t:"Fund Your Wallet", d:"Deposit via crypto or wire transfer. Credited instantly." },
    { n:"3", t:"Start Trading", d:"Buy and sell across 8 major crypto assets at live prices." },
  ];

  const testimonials = [
    { name:"James H.", loc:"London, UK",   text:"VaultX is the cleanest crypto platform I've used. Deposits are instant and support is exceptional.", stars:5 },
    { name:"Sarah M.", loc:"Toronto, CA",  text:"Made my first trade within 5 minutes of signing up. The interface is incredibly intuitive.", stars:5 },
    { name:"David K.", loc:"Sydney, AU",   text:"I've used Coinbase and Binance. VaultX beats them both on simplicity and customer service.", stars:5 },
  ];

  return (
    <div style={{ ...S.app, background:C.bg }}>
      <style>{globalCSS}</style>

      {/* NAV */}
      <nav style={S.nav} className="vx-nav">
        <div style={S.logo}>
          <div style={S.logoMark}>V</div>
          <span className="vx-logo-text">VaultX</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4 }} className="hide-mobile">
          {["about","contact"].map(p => (
            <button key={p} onClick={() => setView(p)} style={{ background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:13, fontWeight:500, padding:"7px 14px", borderRadius:8, fontFamily:"inherit", textTransform:"capitalize", transition:"all .15s" }}
              onMouseEnter={e=>{e.target.style.color=C.text;e.target.style.background=C.bg3;}}
              onMouseLeave={e=>{e.target.style.color=C.text3;e.target.style.background="transparent";}}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button style={{ ...btn("ghost"), padding:"8px 18px", fontSize:13 }} onClick={() => setView("login")}>Sign In</button>
          <button style={{ ...btn("primary"), padding:"8px 20px", fontSize:13 }} onClick={() => setView("register")}>Get Started →</button>
        </div>
      </nav>

      <LightTicker />

      {/* HERO */}
      <section style={{ maxWidth:1140, margin:"0 auto", padding:"clamp(60px,8vw,110px) 24px clamp(40px,6vw,80px)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }} className="vx-fade-in">
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.goldLight, border:`1px solid rgba(240,165,0,.3)`, borderRadius:100, padding:"6px 16px", fontSize:12, color:C.goldDark, fontWeight:600, marginBottom:28 }}>
            <span style={S.ldot}/>
            Live · FCA Registered · UK Regulated
          </div>
          <h1 style={{ fontSize:"clamp(36px,5vw,64px)", fontWeight:800, letterSpacing:"-2.5px", lineHeight:1.08, marginBottom:20, color:C.text }}>
            The professional<br/>crypto trading<br/>
            <span style={{ color:C.gold }}>platform.</span>
          </h1>
          <p style={{ fontSize:17, color:C.text2, marginBottom:36, lineHeight:1.8, maxWidth:480 }}>
            Real-time markets, portfolio management and instant transfers — built for serious traders.
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:32 }}>
            <button style={{ ...btn("primary"), padding:"13px 36px", fontSize:15, borderRadius:10 }} onClick={() => setView("register")}>Open Free Account →</button>
            <button style={{ ...btn("ghost"), padding:"13px 28px", fontSize:15, borderRadius:10 }} onClick={() => setView("login")}>Sign In</button>
          </div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {["🔒 No hidden fees","⚡ Instant execution","🏢 UK Regulated"].map((t,i) => (
              <span key={i} style={{ fontSize:12, color:C.text3, display:"flex", alignItems:"center", gap:5 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Live price cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {COINS.slice(0,4).map(coin => {
            const p = prices[coin.sym] || { price:0, change:0, spark:[] };
            const up = p.change >= 0;
            return (
              <div key={coin.sym} style={{ ...S.card, cursor:"pointer", transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="";}}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{coin.sym}</div>
                  <span style={{ ...S.tag(up?"green":"red"), fontSize:11 }}>{up?"+":""}{fmt(p.change)}%</span>
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:8 }}>
                  ${p.price<1?p.price.toFixed(4):fmt(p.price)}
                </div>
                <Spark data={p.spark} color={up?"#16a34a":"#dc2626"} w={120} h={28}/>
              </div>
            );
          })}
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, background:C.bg2 }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[{v:"$2.4T",l:"Market Cap"},{v:"50K+",l:"Active Traders"},{v:"0.10%",l:"Trading Fee"},{v:"24/7",l:"Live Support"}].map((s,i) => (
            <div key={i} style={{ textAlign:"center", padding:"28px 20px", borderRight:i<3?`1px solid ${C.border}`:"none" }}>
              <div style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:800, color:C.gold, letterSpacing:"-1px", marginBottom:4 }}>{s.v}</div>
              <div style={{ fontSize:13, color:C.text3, fontWeight:500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE PRICES TABLE */}
      <section style={{ maxWidth:1140, margin:"70px auto", padding:"0 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.5px", color:C.text, marginBottom:4 }}>Live Market Prices</h2>
            <p style={{ fontSize:13, color:C.text3 }}>Real-time updates across all major pairs</p>
          </div>
          <button style={{ ...btn("ghost"), padding:"8px 18px", fontSize:13 }} onClick={() => setView("register")}>View All →</button>
        </div>
        <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
          <table style={{ ...S.tbl }}>
            <thead>
              <tr>
                {["#","Asset","Price","24h Change","7d Chart","Action"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COINS.slice(0,8).map((coin,i) => {
                const p = prices[coin.sym] || { price:0, change:0, spark:[] };
                const up = p.change >= 0;
                return (
                  <tr key={coin.sym} style={{ cursor:"pointer" }} onClick={() => setView("register")}>
                    <td style={{ ...S.td, color:C.text3, fontWeight:600, width:40 }}>{i+1}</td>
                    <td style={S.td}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%", background:C.goldLight, border:`1px solid rgba(240,165,0,.2)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.goldDark, flexShrink:0 }}>
                          {coin.sym.slice(0,3)}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, color:C.text, fontSize:14 }}>{coin.sym}</div>
                          <div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...S.td, fontWeight:700, color:C.text, fontFamily:"monospace", fontSize:14 }}>
                      ${p.price<1?p.price.toFixed(4):fmt(p.price)}
                    </td>
                    <td style={S.td}>
                      <span style={{ color:up?C.green:C.red, fontWeight:700, fontSize:13 }}>{up?"+":""}{fmt(p.change)}%</span>
                    </td>
                    <td style={{ ...S.td, width:120 }}>
                      <Spark data={p.spark} color={up?"#16a34a":"#dc2626"} w={100} h={28}/>
                    </td>
                    <td style={S.td}>
                      <button style={{ ...btn("primary"), padding:"6px 16px", fontSize:12 }} onClick={e=>{e.stopPropagation();setView("register");}}>Trade</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"70px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>How It Works</div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-1.5px", color:C.text }}>Up and running in 3 steps</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
            {steps.map((s,i) => (
              <div key={i} style={{ ...S.card, textAlign:"center", padding:28 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:C.goldLight, border:`1px solid rgba(240,165,0,.25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:C.gold, margin:"0 auto 16px" }}>{s.n}</div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>{s.t}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.75 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth:1140, margin:"70px auto", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Platform Features</div>
          <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-1.5px", color:C.text, marginBottom:10 }}>Everything you need to trade</h2>
          <p style={{ fontSize:15, color:C.text3 }}>Built for traders who demand speed, reliability and clarity.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
          {features.map((f,i) => (
            <div key={i} style={{ ...S.card, transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.gold;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{ width:42, height:42, borderRadius:10, background:C.goldLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:14 }}>{f.icon}</div>
              <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>{f.t}</div>
              <div style={{ fontSize:13, color:C.text2, lineHeight:1.75 }}>{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"70px 24px" }}>
        <div style={{ maxWidth:1140, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Testimonials</div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-1.5px", color:C.text }}>Trusted by traders worldwide</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ ...S.card }}>
                <div style={{ display:"flex", gap:2, marginBottom:14 }}>
                  {"★★★★★".split("").map((_,j) => <span key={j} style={{ color:C.gold, fontSize:16 }}>★</span>)}
                </div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.8, marginBottom:16, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:14, borderTop:`1px solid ${C.border2}` }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:C.goldLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:C.gold, flexShrink:0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{t.name}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth:800, margin:"70px auto 100px", padding:"0 24px", textAlign:"center" }}>
        <div style={{ ...S.card, padding:"clamp(40px,6vw,64px)" }}>
          <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:14 }}>Get Started Today</div>
          <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:800, letterSpacing:"-2px", color:C.text, marginBottom:14 }}>Start trading today. It's free.</h2>
          <p style={{ fontSize:15, color:C.text2, marginBottom:32, lineHeight:1.8 }}>Open your account in 60 seconds. No hidden fees, no minimum deposit.</p>
          <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
            <button style={{ ...btn("primary"), padding:"13px 40px", fontSize:15 }} onClick={() => setView("register")}>Open Free Account →</button>
            <button style={{ ...btn("ghost"), padding:"13px 28px", fontSize:15 }} onClick={() => setView("login")}>Sign In</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { setView, showToast, showAlert, alert, setUser, setDashTab, loginUser, checkAdminCreds } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [tab, setTab] = useState("client");

  const doLogin = useCallback(() => {
    if (!email.trim()) { showAlert("Please enter your email"); return; }
    if (!password) { showAlert("Please enter your password"); return; }
    const result = loginUser(email.trim().toLowerCase(), password);
    if (!result.success) { showAlert(result.error || "Login failed"); return; }
    setUser(result.user);
    setView("dashboard");
    setDashTab("overview");
    showToast("Welcome back, " + (result.user.name||"").split(" ")[0] + "! 👋", "success");
  }, [email, password, loginUser, showAlert, showToast, setUser, setView, setDashTab]);

  const doAdminLogin = useCallback(() => {
    if (!checkAdminCreds(adminUser, adminPw)) { showAlert("Invalid admin credentials"); return; }
    setView("admin");
    showToast("Admin panel loaded", "success");
  }, [adminUser, adminPw, checkAdminCreds, showAlert, showToast, setView]);

  return (
    <div style={{ ...S.app, background:C.bg }}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setView("landing")}>
          <div style={S.logoMark}>V</div>
          <span className="vx-logo-text">VaultX</span>
        </div>
        <button style={{ ...btn("ghost"), padding:"8px 18px" }} onClick={() => setView("register")}>Create Account</button>
      </nav>

      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 20px", minHeight:"calc(100vh - 62px)" }}>
        <div style={{ width:"min(420px,100%)" }} className="vx-fade-in">
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ ...S.logoMark, width:52, height:52, borderRadius:14, margin:"0 auto 14px", fontSize:20 }}>V</div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.5px", marginBottom:6, color:C.text }}>Sign in to VaultX</h1>
            <p style={{ fontSize:13, color:C.text3 }}>Enter your credentials to continue</p>
          </div>

          <div style={{ display:"flex", background:C.bg3, border:`1px solid ${C.border}`, borderRadius:12, padding:4, marginBottom:20 }}>
            {["client","admin"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"9px", border:"none", borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .2s",
                background: tab===t ? C.bg2 : "transparent",
                color: tab===t ? C.text : C.text3,
                boxShadow: tab===t ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>
                {t==="client" ? "👤 Client" : "🔐 Admin"}
              </button>
            ))}
          </div>

          {alert && (
            <div style={{ background:"rgba(220,38,38,.06)", border:`1px solid rgba(220,38,38,.2)`, borderRadius:10, padding:"10px 14px", fontSize:13, color:C.red, marginBottom:16 }}>
              ⚠️ {alert}
            </div>
          )}

          <div style={S.card}>
            {tab === "client" ? (
              <>
                <div style={{ marginBottom:16 }}>
                  <label style={S.label}>Email address</label>
                  <input style={S.inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} autoFocus/>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={S.label}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input style={{ ...S.inp, paddingRight:44 }} type={showPw?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
                    <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:16, padding:4 }}>
                      {showPw?"🙈":"👁"}
                    </button>
                  </div>
                </div>
                <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14 }} onClick={doLogin}>Sign In →</button>
                <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:C.text3 }}>
                  Don't have an account?{" "}
                  <span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={() => setView("register")}>Create one free</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom:16 }}>
                  <label style={S.label}>Admin Username</label>
                  <input style={S.inp} placeholder="admin" value={adminUser} onChange={e=>setAdminUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdminLogin()}/>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={S.label}>Admin Password</label>
                  <input style={S.inp} type="password" placeholder="••••••••" value={adminPw} onChange={e=>setAdminPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdminLogin()}/>
                </div>
                <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14 }} onClick={doAdminLogin}>Access Admin Panel →</button>
              </>
            )}
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:20, flexWrap:"wrap" }}>
            {["🔒 256-bit SSL","🏢 FCA Regulated","⚡ Instant Access"].map((t,i) => (
              <span key={i} style={{ fontSize:11, color:C.text3 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ───────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { setView, users, registerUser, showToast, showAlert, alert } = useApp();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  const doRegister = useCallback(async () => {
    if (!name||!email||!password||!confirm) { showAlert("All fields required"); return; }
    if (password !== confirm) { showAlert("Passwords don't match"); return; }
    if (password.length < 6)  { showAlert("Password must be at least 6 characters"); return; }
    if (!agreed)              { showAlert("Please accept the Terms of Service"); return; }
    if (users.some(u=>u.email.toLowerCase()===email.toLowerCase())) { showAlert("Email already registered"); return; }
    setSaving(true);
    const result = await registerUser({
      id:`U${String(users.length+1).padStart(4,"0")}`,
      name, email:email.toLowerCase().trim(), rawPassword:password,
      balance:0, portfolio:0,
      holdings:createHoldings(0), staking:createStaking(0),
      joined:new Date().toLocaleDateString(), verified:true, status:"Active", tier:"Basic",
    });
    setSaving(false);
    if (result.success) { showToast("Account created! Please sign in.","success"); setView("login"); }
    else showAlert("Registration failed. Please try again.");
  }, [name,email,password,confirm,agreed,users,registerUser,showAlert,showToast,setView]);

  return (
    <div style={{ ...S.app, background:C.bg }}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setView("landing")}>
          <div style={S.logoMark}>V</div>
          <span className="vx-logo-text">VaultX</span>
        </div>
        <button style={{ ...btn("ghost"), padding:"8px 18px" }} onClick={() => setView("login")}>Sign In</button>
      </nav>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"50px 20px", minHeight:"calc(100vh - 62px)" }}>
        <div style={{ width:"min(440px,100%)" }} className="vx-fade-in">
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ ...S.logoMark, width:52, height:52, borderRadius:14, margin:"0 auto 14px", fontSize:20 }}>V</div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.5px", marginBottom:6, color:C.text }}>Create your account</h1>
            <p style={{ fontSize:13, color:C.text3 }}>Start trading in under 60 seconds — it's free</p>
          </div>

          {alert && (
            <div style={{ background:"rgba(220,38,38,.06)", border:`1px solid rgba(220,38,38,.2)`, borderRadius:10, padding:"10px 14px", fontSize:13, color:C.red, marginBottom:16 }}>
              ⚠️ {alert}
            </div>
          )}

          <div style={S.card}>
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Full Name</label>
              <input style={S.inp} placeholder="John Smith" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Email address</label>
              <input style={S.inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Password</label>
              <div style={{ position:"relative" }}>
                <input style={{ ...S.inp, paddingRight:44 }} type={showPw?"text":"password"} placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/>
                <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:16, padding:4 }}>
                  {showPw?"🙈":"👁"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Confirm Password</label>
              <input style={S.inp} type="password" placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doRegister()}/>
            </div>

            {password.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background: password.length>=i*3?(password.length>=10?C.green:C.gold):C.border, transition:"background .3s" }}/>
                  ))}
                </div>
                <div style={{ fontSize:11, color:password.length>=10?C.green:C.gold }}>
                  {password.length<6?"Too short":password.length<10?"Fair — add more characters":"Strong password ✓"}
                </div>
              </div>
            )}

            <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:22, fontSize:13, color:C.text2 }}>
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:C.gold, flexShrink:0, width:15, height:15 }}/>
              <span>I agree to the <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("terms")}>Terms of Service</span> and <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("privacy")}>Privacy Policy</span></span>
            </div>

            <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14, opacity:saving?0.7:1 }} onClick={doRegister} disabled={saving}>
              {saving?"⏳ Creating Account…":"Create Free Account →"}
            </button>

            <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.text3 }}>
              Already have an account?{" "}
              <span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={()=>setView("login")}>Sign in</span>
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:20, flexWrap:"wrap" }}>
            {["🔒 256-bit SSL","🏢 FCA Regulated","✅ No Credit Card"].map((t,i) => (
              <span key={i} style={{ fontSize:11, color:C.text3 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
