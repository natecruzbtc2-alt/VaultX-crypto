import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, fmt, createHoldings, createStaking } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { Spark } from "./components";
import { Footer } from "./Pages";
import CryptoBackground from "./CryptoBackground";

// ── LANDING ────────────────────────────────────────────────────────────────
export function LandingPage() {
  const { setView } = useApp();
  const prices = usePrices();

  const features = [
    { icon:"⚡", t:"Instant Execution",   d:"Orders execute at market price in milliseconds with 0.10% flat fee." },
    { icon:"🔐", t:"Bank-Grade Security", d:"256-bit SSL encryption, hashed passwords and anti-phishing codes." },
    { icon:"💼", t:"Portfolio Tracking",  d:"Full P&L breakdowns, allocation charts and complete transaction history." },
    { icon:"📈", t:"Live Trading",        d:"Real-time charts with buy/sell orders across 8 major crypto assets." },
    { icon:"🌍", t:"Global Access",       d:"Trade from anywhere in the world — fully mobile optimised." },
    { icon:"💬", t:"24/7 Live Support",   d:"Real human agents available around the clock via live chat." },
  ];

  const steps = [
    { n:"01", t:"Create Account",  d:"Sign up in 60 seconds — no ID required to start." },
    { n:"02", t:"Fund Your Wallet",d:"Deposit via crypto or wire transfer. Credited instantly." },
    { n:"03", t:"Start Trading",   d:"Buy and sell across 8 major crypto assets at live prices." },
  ];

  const testimonials = [
    { name:"James H.", loc:"London, UK",  text:"VaultX is the cleanest crypto platform I've used. Deposits are instant and support is exceptional." },
    { name:"Sarah M.", loc:"Toronto, CA", text:"Made my first trade within 5 minutes of signing up. The interface is incredibly intuitive." },
    { name:"David K.", loc:"Sydney, AU",  text:"I've used Coinbase and Binance. VaultX beats them both on simplicity and customer service." },
  ];

  return (
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAV */}
        <nav style={S.nav} className="vx-nav">
          <div style={S.logo}>
            <div style={S.logoMark}>V</div>
            <span className="vx-logo-text">VaultX</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4 }} className="hide-mobile">
            {["about","contact"].map(p => (
              <button key={p} onClick={() => setView(p)} style={{ background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:13, fontWeight:600, padding:"7px 16px", borderRadius:8, fontFamily:"inherit", textTransform:"uppercase", letterSpacing:".05em", transition:"color .15s" }}
                onMouseEnter={e=>e.target.style.color="#fff"}
                onMouseLeave={e=>e.target.style.color=C.text3}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button style={{ ...btn("ghost"), padding:"8px 20px", fontSize:13, borderRadius:8, letterSpacing:".04em", textTransform:"uppercase" }} onClick={() => setView("login")}>Log In</button>
            <button style={{ ...btn("primary"), padding:"8px 22px", fontSize:13, borderRadius:8, letterSpacing:".04em", textTransform:"uppercase" }} onClick={() => setView("register")}>Get Started</button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr auto", gap:0, alignItems:"center", maxWidth:1400, margin:"0 auto", padding:"0 48px" }} className="vx-hero-grid vx-fade-in">

          {/* Left — text + stats */}
          <div style={{ maxWidth:620 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(120,80,255,.12)", border:"1px solid rgba(120,80,255,.25)", borderRadius:100, padding:"7px 18px", fontSize:12, color:C.purple, fontWeight:600, marginBottom:36, letterSpacing:".04em" }}>
              <span style={S.ldot}/>
              FCA Regulated · UK Licensed · Real-time Markets
            </div>

            <h1 style={{ fontSize:"clamp(42px,6vw,80px)", fontWeight:800, letterSpacing:"-3px", lineHeight:1.0, marginBottom:24, color:"#fff" }}>
              The professional<br/>
              crypto trading<br/>
              <span style={{ background:"linear-gradient(135deg,#a084ff,#7eb8ff,#60e8ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                platform.
              </span>
            </h1>

            <p style={{ fontSize:"clamp(15px,1.8vw,18px)", color:C.text2, maxWidth:500, marginBottom:40, lineHeight:1.9 }}>
              Real-time markets, portfolio management and instant transfers — built for serious traders who demand speed and reliability.
            </p>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:56 }}>
              <button style={{ ...btn("primary"), padding:"14px 40px", fontSize:15, borderRadius:10, letterSpacing:".02em" }} onClick={() => setView("register")}>
                Open Free Account →
              </button>
              <button style={{ ...btn("ghost"), padding:"14px 32px", fontSize:15, borderRadius:10 }} onClick={() => setView("login")}>
                Sign In
              </button>
            </div>

            {/* Stats — right side of text, BCB style */}
            <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>
              {[
                { v:"50K+",  l:"Active Traders" },
                { v:"$2.4T", l:"Market Cap" },
                { v:"0.10%", l:"Trading Fee" },
              ].map((s,i) => (
                <div key={i} style={{ borderLeft:"1px solid rgba(120,80,255,.25)", paddingLeft:20 }}>
                  <div style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:800, color:C.purple, letterSpacing:"-1px", marginBottom:4 }}>{s.v}</div>
                  <div style={{ fontSize:12, color:C.text3, fontWeight:500 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats column like BCB */}
          <div className="vx-hex-side" style={{ width:220, display:"flex", flexDirection:"column", gap:0, alignSelf:"center", marginTop:80 }}>
            {[
              { v:"8+",    l:"Crypto Assets" },
              { v:"24/7",  l:"Live Support" },
              { v:"$228B", l:"Volume Traded" },
            ].map((s,i) => (
              <div key={i} style={{ padding:"28px 0 28px 24px", borderTop: i>0?"1px solid rgba(120,80,255,.15)":"none" }}>
                <div style={{ fontSize:"clamp(28px,3.5vw,42px)", fontWeight:800, color:C.purple2, letterSpacing:"-1.5px", marginBottom:6 }}>{s.v}</div>
                <div style={{ fontSize:12, color:C.text3, lineHeight:1.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ borderTop:"1px solid rgba(120,80,255,.1)", margin:"0 48px" }}/>

        {/* LIVE PRICES */}
        <section style={{ maxWidth:1400, margin:"0 auto", padding:"80px 48px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32 }}>
            <div>
              <div style={{ fontSize:11, color:C.purple, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Live Markets</div>
              <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:800, letterSpacing:"-2px", color:"#fff" }}>Real-time prices</h2>
            </div>
            <button style={{ ...btn("ghost"), padding:"9px 20px", fontSize:13 }} onClick={() => setView("register")}>View All →</button>
          </div>
          <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
            <table style={S.tbl}>
              <thead>
                <tr>{["#","Asset","Price","24h Change","7d Chart","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {COINS.slice(0,8).map((coin,i) => {
                  const p = prices[coin.sym]||{price:0,change:0,spark:[]};
                  const up = p.change>=0;
                  return (
                    <tr key={coin.sym} style={{ cursor:"pointer" }} onClick={() => setView("register")}>
                      <td style={{ ...S.td, color:C.text3, fontWeight:600, width:40 }}>{i+1}</td>
                      <td style={S.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:10, background:"rgba(120,80,255,.15)", border:"1px solid rgba(120,80,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.purple, flexShrink:0 }}>
                            {coin.sym.slice(0,3)}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, color:"#fff", fontSize:14 }}>{coin.sym}</div>
                            <div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...S.td, fontWeight:700, color:"#fff", fontFamily:"monospace", fontSize:14 }}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td>
                      <td style={S.td}><span style={{ color:up?C.green:C.red, fontWeight:700 }}>{up?"+":""}{fmt(p.change)}%</span></td>
                      <td style={{ ...S.td, width:120 }}><Spark data={p.spark} color={up?"#22c55e":"#ef4444"} w={100} h={28}/></td>
                      <td style={S.td}><button style={{ ...btn("ghost"), padding:"6px 16px", fontSize:12 }} onClick={e=>{e.stopPropagation();setView("register");}}>Trade</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ borderTop:"1px solid rgba(120,80,255,.1)", margin:"0 48px" }}/>

        {/* HOW IT WORKS */}
        <section style={{ maxWidth:1400, margin:"0 auto", padding:"80px 48px" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, color:C.purple, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>How It Works</div>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,44px)", fontWeight:800, letterSpacing:"-2px", color:"#fff" }}>Up and running in 3 steps</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:2 }}>
            {steps.map((s,i) => (
              <div key={i} style={{ ...S.card, borderRadius:i===0?`16px 0 0 16px`:i===2?`0 16px 16px 0`:"0", borderLeft:i>0?"none":"1px solid rgba(120,80,255,.18)", padding:"36px 32px" }}>
                <div style={{ fontSize:48, fontWeight:900, color:"rgba(120,80,255,.12)", letterSpacing:"-2px", marginBottom:16, lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:10 }}>{s.t}</div>
                <div style={{ fontSize:14, color:C.text2, lineHeight:1.8 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ borderTop:"1px solid rgba(120,80,255,.1)", margin:"0 48px" }}/>

        {/* FEATURES */}
        <section style={{ maxWidth:1400, margin:"0 auto", padding:"80px 48px" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, color:C.purple, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Platform Features</div>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,44px)", fontWeight:800, letterSpacing:"-2px", color:"#fff", marginBottom:12 }}>Everything you need to trade</h2>
            <p style={{ fontSize:15, color:C.text3, maxWidth:500, margin:"0 auto" }}>Built for traders who demand speed, reliability and clarity.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:14 }}>
            {features.map((f,i) => (
              <div key={i} style={{ ...S.card, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(120,80,255,.45)";e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(120,80,255,.18)";e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{ width:44, height:44, borderRadius:12, background:"rgba(120,80,255,.12)", border:"1px solid rgba(120,80,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:16 }}>{f.icon}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:8 }}>{f.t}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.8 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{ borderTop:"1px solid rgba(120,80,255,.1)", margin:"0 48px" }}/>

        {/* TESTIMONIALS */}
        <section style={{ maxWidth:1400, margin:"0 auto", padding:"80px 48px" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, color:C.purple, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Testimonials</div>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,44px)", fontWeight:800, letterSpacing:"-2px", color:"#fff" }}>Trusted by traders worldwide</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ ...S.card, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(120,80,255,.4)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(120,80,255,.18)";}}>
                <div style={{ display:"flex", gap:2, marginBottom:16 }}>
                  {"★★★★★".split("").map((_,j) => <span key={j} style={{ color:C.purple, fontSize:16 }}>★</span>)}
                </div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.85, marginBottom:18, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:14, borderTop:"1px solid rgba(120,80,255,.12)" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:"rgba(120,80,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:C.purple, flexShrink:0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{t.name}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth:1400, margin:"0 auto", padding:"0 48px 120px" }}>
          <div style={{ background:"linear-gradient(135deg,rgba(120,80,255,.12),rgba(80,160,255,.08))", border:"1px solid rgba(120,80,255,.2)", borderRadius:24, padding:"clamp(48px,7vw,80px) clamp(32px,6vw,80px)", textAlign:"center", boxShadow:"0 0 80px rgba(120,80,255,.08)" }}>
            <div style={{ fontSize:11, color:C.purple, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:16 }}>Get Started Today</div>
            <h2 style={{ fontSize:"clamp(30px,5vw,56px)", fontWeight:800, letterSpacing:"-2.5px", color:"#fff", marginBottom:16, lineHeight:1.05 }}>
              Start trading today.<br/>
              <span style={{ background:"linear-gradient(135deg,#a084ff,#7eb8ff,#60e8ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                It's free.
              </span>
            </h2>
            <p style={{ fontSize:16, color:C.text2, marginBottom:40, lineHeight:1.8 }}>Open your account in 60 seconds. No hidden fees, no minimum deposit.</p>
            <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
              <button style={{ ...btn("primary"), padding:"15px 44px", fontSize:16, borderRadius:12 }} onClick={() => setView("register")}>Open Free Account →</button>
              <button style={{ ...btn("ghost"), padding:"15px 36px", fontSize:16, borderRadius:12 }} onClick={() => setView("login")}>Sign In</button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
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
    setUser(result.user); setView("dashboard"); setDashTab("overview");
    showToast("Welcome back, " + (result.user.name||"").split(" ")[0] + "! 👋", "success");
  }, [email, password, loginUser, showAlert, showToast, setUser, setView, setDashTab]);

  const doAdminLogin = useCallback(() => {
    if (!checkAdminCreds(adminUser, adminPw)) { showAlert("Invalid admin credentials"); return; }
    setView("admin"); showToast("Admin panel loaded", "success");
  }, [adminUser, adminPw, checkAdminCreds, showAlert, showToast, setView]);

  return (
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <nav style={S.nav}>
          <div style={S.logo} onClick={() => setView("landing")}>
            <div style={S.logoMark}>V</div>
            <span className="vx-logo-text">VaultX</span>
          </div>
          <button style={{ ...btn("ghost"), padding:"8px 20px" }} onClick={() => setView("register")}>Create Account</button>
        </nav>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
          <div style={{ width:"min(420px,100%)" }} className="vx-fade-in">
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ ...S.logoMark, width:52, height:52, borderRadius:14, margin:"0 auto 14px", fontSize:20 }}>V</div>
              <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.5px", marginBottom:6 }}>Sign in to VaultX</h1>
              <p style={{ fontSize:13, color:C.text3 }}>Enter your credentials to continue trading</p>
            </div>
            <div style={{ display:"flex", background:"rgba(255,255,255,.04)", border:"1px solid rgba(120,80,255,.15)", borderRadius:12, padding:4, marginBottom:20 }}>
              {["client","admin"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"9px", border:"none", borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .2s",
                  background: tab===t ? "rgba(120,80,255,.2)" : "transparent",
                  color: tab===t ? "#fff" : C.text3,
                  boxShadow: tab===t ? "0 2px 8px rgba(120,80,255,.15)" : "none" }}>
                  {t==="client" ? "👤 Client Login" : "🔐 Admin Login"}
                </button>
              ))}
            </div>
            {alert && <div style={{ background:C.redBg, border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"10px 14px", fontSize:13, color:C.red, marginBottom:16 }}>⚠️ {alert}</div>}
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
                      <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:16, padding:4 }}>{showPw?"🙈":"👁"}</button>
                    </div>
                  </div>
                  <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14 }} onClick={doLogin}>Sign In →</button>
                  <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:C.text3 }}>
                    Don't have an account?{" "}<span style={{ color:C.purple, cursor:"pointer", fontWeight:700 }} onClick={() => setView("register")}>Create one free</span>
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
    </div>
  );
}

// ── REGISTER ───────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { setView, users, registerUser, showToast, showAlert, alert } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const doRegister = useCallback(async () => {
    if (!name||!email||!password||!confirm) { showAlert("All fields required"); return; }
    if (password !== confirm) { showAlert("Passwords don't match"); return; }
    if (password.length < 6) { showAlert("Password must be at least 6 characters"); return; }
    if (!agreed) { showAlert("Please accept the Terms of Service"); return; }
    if (users.some(u=>u.email.toLowerCase()===email.toLowerCase())) { showAlert("Email already registered"); return; }
    setSaving(true);
    const result = await registerUser({
      id:`U${String(users.length+1).padStart(4,"0")}`,
      name, email:email.toLowerCase().trim(), rawPassword:password,
      balance:0, portfolio:0, holdings:createHoldings(0), staking:createStaking(0),
      joined:new Date().toLocaleDateString(), verified:true, status:"Active", tier:"Basic",
    });
    setSaving(false);
    if (result.success) { showToast("Account created! Please sign in.","success"); setView("login"); }
    else showAlert("Registration failed. Please try again.");
  }, [name,email,password,confirm,agreed,users,registerUser,showAlert,showToast,setView]);

  return (
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <nav style={S.nav}>
          <div style={S.logo} onClick={() => setView("landing")}>
            <div style={S.logoMark}>V</div>
            <span className="vx-logo-text">VaultX</span>
          </div>
          <button style={{ ...btn("ghost"), padding:"8px 20px" }} onClick={() => setView("login")}>Sign In</button>
        </nav>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
          <div style={{ width:"min(440px,100%)" }} className="vx-fade-in">
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ ...S.logoMark, width:52, height:52, borderRadius:14, margin:"0 auto 14px", fontSize:20 }}>V</div>
              <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.5px", marginBottom:6 }}>Create your account</h1>
              <p style={{ fontSize:13, color:C.text3 }}>Start trading in 60 seconds — it's free</p>
            </div>
            {alert && <div style={{ background:C.redBg, border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"10px 14px", fontSize:13, color:C.red, marginBottom:16 }}>⚠️ {alert}</div>}
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
                  <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:16, padding:4 }}>{showPw?"🙈":"👁"}</button>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={S.label}>Confirm Password</label>
                <input style={S.inp} type="password" placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doRegister()}/>
              </div>
              {password.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background:password.length>=i*3?(password.length>=10?C.green:C.purple):"rgba(255,255,255,.1)", transition:"background .3s" }}/>)}
                  </div>
                  <div style={{ fontSize:11, color:password.length>=10?C.green:C.purple }}>{password.length<6?"Too short":password.length<10?"Fair":"Strong ✓"}</div>
                </div>
              )}
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:22, fontSize:13, color:C.text2 }}>
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:C.purple, flexShrink:0, width:15, height:15 }}/>
                <span>I agree to the <span style={{ color:C.purple, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("terms")}>Terms of Service</span> and <span style={{ color:C.purple, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("privacy")}>Privacy Policy</span></span>
              </div>
              <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14, opacity:saving?0.7:1 }} onClick={doRegister} disabled={saving}>
                {saving?"⏳ Creating Account…":"Create Free Account →"}
              </button>
              <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.text3 }}>
                Already have an account?{" "}<span style={{ color:C.purple, cursor:"pointer", fontWeight:700 }} onClick={()=>setView("login")}>Sign in</span>
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
    </div>
  );
}
