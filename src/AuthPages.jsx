import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, fmt, createHoldings, createStaking } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { TickerBar, Spark } from "./components";
import CryptoBackground from "./CryptoBackground";
import { Footer } from "./Pages";

// ── LANDING ───────────────────────────────────────────────────────────────────
export function LandingPage() {
  const { setView } = useApp();
  const prices = usePrices();

  const features = [
    { icon:"📈", t:"Live Trading",        d:"Real-time charts with buy/sell orders across 8 major coins." },
    { icon:"🔐", t:"Bank-Grade Security", d:"Hashed passwords, anti-phishing codes and rate limiting." },
    { icon:"💼", t:"Portfolio Tracking",  d:"Full P&L, allocation breakdowns and transaction history." },
    { icon:"⚡", t:"Instant Execution",   d:"Orders execute at market price with 0.10% fee." },
    { icon:"🌍", t:"Global Access",       d:"Trade from anywhere. Mobile optimised." },
    { icon:"💬", t:"24/7 Live Support",   d:"Real agents available around the clock." },
  ];

  const testimonials = [
    { name:"James H.", loc:"London, UK",   text:"VaultX is the cleanest crypto platform I've used. Deposits are instant and support is exceptional.", stars:5 },
    { name:"Sarah M.", loc:"Toronto, CA",  text:"Made my first trade within 5 minutes of signing up. The interface is incredibly intuitive.", stars:5 },
    { name:"David K.", loc:"Sydney, AU",   text:"I've used Coinbase and Binance. VaultX beats them both on simplicity and customer service.", stars:5 },
  ];

  const steps = [
    { n:"01", t:"Create Account", d:"Sign up in 60 seconds — no ID required to start." },
    { n:"02", t:"Fund Your Wallet", d:"Deposit via crypto or wire transfer instantly." },
    { n:"03", t:"Start Trading", d:"Buy and sell across 8 major crypto assets." },
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
              <button key={p} onClick={() => setView(p)} style={{ background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:14, padding:"7px 16px", borderRadius:10, fontFamily:"inherit", textTransform:"capitalize", transition:"all .15s" }}
                onMouseEnter={e=>{e.target.style.color=C.gold;e.target.style.background="rgba(255,200,0,.06)";}}
                onMouseLeave={e=>{e.target.style.color=C.text3;e.target.style.background="transparent";}}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button style={{ ...btn("ghost"), padding:"8px 20px", fontSize:13 }} onClick={() => setView("login")}>Sign In</button>
            <button style={{ ...btn("primary"), padding:"8px 20px", fontSize:13 }} onClick={() => setView("register")}>Get Started →</button>
          </div>
        </nav>

        <TickerBar />

        {/* HERO */}
        <section style={{ textAlign:"center", padding:"clamp(70px,9vw,130px) 24px clamp(50px,7vw,90px)", maxWidth:960, margin:"0 auto" }} className="vx-fade-in">
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,200,0,.07)", border:"1px solid rgba(255,200,0,.18)", borderRadius:100, padding:"7px 20px", fontSize:12, color:C.gold, fontWeight:600, marginBottom:32, letterSpacing:".04em", boxShadow:"0 0 24px rgba(255,200,0,.08)" }}>
            <span style={S.ldot}/>
            Live · Real-time prices · FCA Registered · UK Regulated
          </div>

          <h1 style={{ fontSize:"clamp(42px,7.5vw,88px)", fontWeight:800, letterSpacing:"-3.5px", lineHeight:1.0, marginBottom:24, color:"#fff" }}>
            Trade crypto<br/>
            <span style={{ background:"linear-gradient(135deg,#c89600,#ffe066,#ffd633)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 40px rgba(255,200,0,.3))" }}>
              like a professional.
            </span>
          </h1>

          <p style={{ fontSize:"clamp(15px,2.2vw,20px)", color:C.text2, maxWidth:580, margin:"0 auto 40px", lineHeight:1.8 }}>
            Real-time markets, portfolio management and instant transfers — the platform serious traders choose.
          </p>

          <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", marginBottom:28 }}>
            <button style={{ ...btn("primary"), padding:"15px 44px", fontSize:16, borderRadius:14, boxShadow:"0 8px 32px rgba(255,200,0,.4)" }} onClick={() => setView("register")}>
              Open Free Account →
            </button>
            <button style={{ ...btn("ghost"), padding:"15px 36px", fontSize:16, borderRadius:14 }} onClick={() => setView("login")}>
              Sign In
            </button>
          </div>

          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:24, flexWrap:"wrap" }}>
            {["🔒 No hidden fees","⚡ Instant execution","🏢 UK Regulated","💬 24/7 Support"].map((t,i) => (
              <span key={i} style={{ fontSize:12, color:C.text3, display:"flex", alignItems:"center", gap:5 }}>{t}</span>
            ))}
          </div>
        </section>

        {/* STATS BAR */}
        <section style={{ borderTop:"1px solid rgba(255,200,0,.08)", borderBottom:"1px solid rgba(255,200,0,.08)", background:"rgba(255,200,0,.015)", backdropFilter:"blur(10px)" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
            {[{v:"$2.4T",l:"Market Cap"},{v:"50K+",l:"Active Traders"},{v:"0.10%",l:"Trading Fee"},{v:"24/7",l:"Live Support"}].map((s,i) => (
              <div key={i} style={{ textAlign:"center", padding:"32px 20px", borderRight:i<3?"1px solid rgba(255,200,0,.08)":"none" }}>
                <div style={{ fontSize:"clamp(28px,4vw,42px)", fontWeight:800, color:C.gold, letterSpacing:"-1.5px", marginBottom:4, filter:"drop-shadow(0 0 12px rgba(255,200,0,.3))" }}>{s.v}</div>
                <div style={{ fontSize:13, color:C.text3, fontWeight:500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE PRICES */}
        <section style={{ maxWidth:1140, margin:"80px auto", padding:"0 24px" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:12 }}>Live Markets</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:800, letterSpacing:"-2px", color:"#fff", marginBottom:12 }}>Real-time prices</h2>
            <p style={{ fontSize:15, color:C.text3 }}>Updates every 2.5 seconds across all pairs</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:14 }}>
            {COINS.slice(0,8).map(coin => {
              const p = prices[coin.sym] || { price:0, change:0, spark:[] };
              const up = p.change >= 0;
              return (
                <div key={coin.sym} style={{ ...S.card, cursor:"pointer", transition:"all .2s" }}
                  onClick={() => setView("register")}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,200,0,.45)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,.6),0 0 24px rgba(255,200,0,.1)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,200,0,.14)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="";}}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color:"#fff", marginBottom:2 }}>{coin.sym}</div>
                      <div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div>
                    </div>
                    <span style={{ ...S.tag(up?"green":"red"), fontSize:11 }}>{up?"+":""}{fmt(p.change)}%</span>
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:10 }}>
                    ${p.price<1?p.price.toFixed(4):fmt(p.price)}
                  </div>
                  <Spark data={p.spark} color={up?C.gold:C.red} w={130} h={32}/>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ maxWidth:1000, margin:"80px auto", padding:"0 24px" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:12 }}>How It Works</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:800, letterSpacing:"-2px", color:"#fff" }}>Up and running in 3 steps</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {steps.map((s,i) => (
              <div key={i} style={{ ...S.card, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-10, right:-4, fontSize:72, fontWeight:900, color:"rgba(255,200,0,.04)", lineHeight:1, userSelect:"none" }}>{s.n}</div>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,200,0,.1)", border:"1px solid rgba(255,200,0,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:C.gold, marginBottom:16 }}>{s.n}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:8 }}>{s.t}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.75 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ maxWidth:1140, margin:"80px auto", padding:"0 24px" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:12 }}>Platform Features</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:800, letterSpacing:"-2px", color:"#fff", marginBottom:12 }}>Everything you need</h2>
            <p style={{ fontSize:15, color:C.text3 }}>Built for traders who demand speed, reliability and clarity.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {features.map((f,i) => (
              <div key={i} style={{ ...S.card, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,200,0,.35)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,200,0,.14)";e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,200,0,.07)", border:"1px solid rgba(255,200,0,.14)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:8 }}>{f.t}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.75 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ maxWidth:1140, margin:"80px auto", padding:"0 24px" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:12 }}>Testimonials</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:800, letterSpacing:"-2px", color:"#fff", marginBottom:12 }}>Trusted by traders worldwide</h2>
            <p style={{ fontSize:15, color:C.text3 }}>Join 50,000+ traders who chose VaultX</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ ...S.card, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,200,0,.35)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,200,0,.14)";}}>
                <div style={{ display:"flex", gap:2, marginBottom:16 }}>
                  {"★★★★★".split("").map((_,j) => <span key={j} style={{ color:C.gold, fontSize:16 }}>★</span>)}
                </div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.8, marginBottom:18, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:14, borderTop:"1px solid rgba(255,200,0,.08)" }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,#c89600,#ffd633)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#000", flexShrink:0 }}>
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

        {/* BOTTOM CTA */}
        <section style={{ maxWidth:860, margin:"80px auto 120px", padding:"0 24px", textAlign:"center" }}>
          <div style={{ background:"linear-gradient(145deg,rgba(255,200,0,.08),rgba(255,200,0,.02))", border:"1px solid rgba(255,200,0,.2)", borderRadius:28, padding:"clamp(40px,7vw,72px) clamp(28px,6vw,72px)", boxShadow:"0 0 80px rgba(255,200,0,.06), 0 24px 60px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", marginBottom:16 }}>Get Started Today</div>
            <h2 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:800, letterSpacing:"-2.5px", color:"#fff", marginBottom:16, lineHeight:1.08 }}>
              Start trading today.<br/>
              <span style={{ background:"linear-gradient(135deg,#c89600,#ffe066)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>It's free.</span>
            </h2>
            <p style={{ fontSize:15, color:C.text2, marginBottom:36, lineHeight:1.8, maxWidth:480, margin:"0 auto 36px" }}>Open your account in 60 seconds. No hidden fees, no minimum deposit.</p>
            <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
              <button style={{ ...btn("primary"), padding:"15px 44px", fontSize:16, borderRadius:14, boxShadow:"0 8px 32px rgba(255,200,0,.4)" }} onClick={() => setView("register")}>Open Free Account →</button>
              <button style={{ ...btn("ghost"), padding:"15px 32px", fontSize:16, borderRadius:14 }} onClick={() => setView("login")}>Sign In</button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { setView, showToast, showAlert, alert, setUser, setDashTab, loginUser, checkAdminCreds } = useApp();
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPw,   setAdminPw]   = useState("");
  const [tab,       setTab]       = useState("client");

  const doLogin = useCallback(() => {
    if (!email.trim()) { showAlert("Please enter your email"); return; }
    if (!password)     { showAlert("Please enter your password"); return; }
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
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <nav style={S.nav}>
          <div style={S.logo} onClick={() => setView("landing")} >
            <div style={S.logoMark}>V</div>
            <span className="vx-logo-text">VaultX</span>
          </div>
          <button style={{ ...btn("ghost"), padding:"8px 20px" }} onClick={() => setView("register")}>Create Account</button>
        </nav>

        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
          <div style={{ width:"min(440px,100%)" }} className="vx-fade-in">

            {/* Logo + title */}
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ ...S.logoMark, width:56, height:56, borderRadius:16, margin:"0 auto 16px", fontSize:22 }}>V</div>
              <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.5px", marginBottom:6, color:"#fff" }}>Sign in to VaultX</h1>
              <p style={{ fontSize:13, color:C.text3 }}>Enter your credentials to continue trading</p>
            </div>

            {/* Tab switcher */}
            <div style={{ display:"flex", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,200,0,.1)", borderRadius:14, padding:4, marginBottom:24 }}>
              {["client","admin"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"10px", border:"none", borderRadius:11, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .2s",
                  background: tab===t ? "rgba(255,200,0,.15)" : "transparent",
                  color: tab===t ? C.gold : C.text3,
                  boxShadow: tab===t ? "0 2px 8px rgba(255,200,0,.1)" : "none" }}>
                  {t==="client" ? "👤 Client Login" : "🔐 Admin Login"}
                </button>
              ))}
            </div>

            {alert && (
              <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:12, padding:"11px 16px", fontSize:13, color:"#f87171", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                ⚠️ {alert}
              </div>
            )}

            <div style={{ ...S.card, padding:28 }}>
              {tab === "client" ? (
                <>
                  <div style={{ marginBottom:18 }}>
                    <label style={S.label}>Email address</label>
                    <input style={S.inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} autoFocus/>
                  </div>
                  <div style={{ marginBottom:26 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <label style={{ ...S.label, marginBottom:0 }}>Password</label>
                    </div>
                    <div style={{ position:"relative" }}>
                      <input style={{ ...S.inp, paddingRight:46 }} type={showPw?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
                      <button onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:17, padding:4, lineHeight:1 }}>
                        {showPw?"🙈":"👁"}
                      </button>
                    </div>
                  </div>
                  <button style={{ ...btn("primary"), width:"100%", padding:"14px", fontSize:15, borderRadius:12, boxShadow:"0 6px 24px rgba(255,200,0,.35)" }} onClick={doLogin}>Sign In →</button>
                  <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.text3 }}>
                    Don't have an account?{" "}
                    <span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={() => setView("register")}>Create one free</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom:18 }}>
                    <label style={S.label}>Admin Username</label>
                    <input style={S.inp} placeholder="admin" value={adminUser} onChange={e=>setAdminUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdminLogin()}/>
                  </div>
                  <div style={{ marginBottom:26 }}>
                    <label style={S.label}>Admin Password</label>
                    <input style={S.inp} type="password" placeholder="••••••••" value={adminPw} onChange={e=>setAdminPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdminLogin()}/>
                  </div>
                  <button style={{ ...btn("primary"), width:"100%", padding:"14px", fontSize:15, borderRadius:12 }} onClick={doAdminLogin}>Access Admin Panel →</button>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:24, flexWrap:"wrap" }}>
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

// ── REGISTER ──────────────────────────────────────────────────────────────────
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
    if (!name || !email || !password || !confirm) { showAlert("All fields required"); return; }
    if (password !== confirm)  { showAlert("Passwords don't match"); return; }
    if (password.length < 6)   { showAlert("Password must be at least 6 characters"); return; }
    if (!agreed)               { showAlert("Please accept the Terms of Service"); return; }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) { showAlert("Email already registered"); return; }
    setSaving(true);
    const nu = {
      id: `U${String(users.length+1).padStart(4,"0")}`,
      name, email: email.toLowerCase().trim(), rawPassword: password,
      balance:0, portfolio:0,
      holdings: createHoldings(0), staking: createStaking(0),
      joined: new Date().toLocaleDateString(), verified:true, status:"Active", tier:"Basic",
    };
    const result = await registerUser(nu);
    setSaving(false);
    if (result.success) { showToast("Account created! Please sign in.", "success"); setView("login"); }
    else showAlert("Registration failed. Please try again.");
  }, [name, email, password, confirm, agreed, users, registerUser, showAlert, showToast, setView]);

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
          <div style={{ width:"min(460px,100%)" }} className="vx-fade-in">

            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ ...S.logoMark, width:56, height:56, borderRadius:16, margin:"0 auto 16px", fontSize:22 }}>V</div>
              <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-.5px", marginBottom:6, color:"#fff" }}>Create your account</h1>
              <p style={{ fontSize:13, color:C.text3 }}>Start trading in under 60 seconds — it's free</p>
            </div>

            {alert && (
              <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:12, padding:"11px 16px", fontSize:13, color:"#f87171", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                ⚠️ {alert}
              </div>
            )}

            <div style={{ ...S.card, padding:28 }}>
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Full Name</label>
                <input style={S.inp} placeholder="John Smith" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Email address</label>
                <input style={S.inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Password</label>
                <div style={{ position:"relative" }}>
                  <input style={{ ...S.inp, paddingRight:46 }} type={showPw?"text":"password"} placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/>
                  <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:17, padding:4, lineHeight:1 }}>
                    {showPw?"🙈":"👁"}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={S.label}>Confirm Password</label>
                <input style={S.inp} type="password" placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doRegister()}/>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div style={{ marginBottom:18 }}>
                  <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:2, background: password.length >= i*3 ? (password.length >= 10 ? C.green : C.gold) : "rgba(255,255,255,.1)", transition:"background .3s" }}/>
                    ))}
                  </div>
                  <div style={{ fontSize:11, color: password.length >= 10 ? C.green : C.gold }}>
                    {password.length < 6 ? "Too short" : password.length < 10 ? "Fair" : "Strong password"}
                  </div>
                </div>
              )}

              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:24, fontSize:13, color:C.text2 }}>
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:C.gold, flexShrink:0, width:15, height:15 }}/>
                <span>I agree to the <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("terms")}>Terms of Service</span> and <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("privacy")}>Privacy Policy</span></span>
              </div>

              <button style={{ ...btn("primary"), width:"100%", padding:"14px", fontSize:15, borderRadius:12, opacity:saving?0.7:1, boxShadow:"0 6px 24px rgba(255,200,0,.35)" }} onClick={doRegister} disabled={saving}>
                {saving?"⏳ Creating Account…":"Create Free Account →"}
              </button>

              <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.text3 }}>
                Already have an account?{" "}
                <span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={()=>setView("login")}>Sign in</span>
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:24, flexWrap:"wrap" }}>
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
