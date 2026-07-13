import { useState, useCallback, useEffect, useRef } from "react";
import { useApp, usePrices, COINS, fmt, createHoldings, createStaking } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { Spark } from "./components";
import { Footer } from "./Pages";
import CryptoBackground from "./CryptoBackground";

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────
function Counter({ target, prefix="", suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g,""));
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now()-start)/duration);
      const ease = 1 - Math.pow(1-p, 3);
      setVal(Math.floor(ease * num));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);
  const raw = target.replace(/[^0-9.]/g,"");
  const isDecimal = raw.includes(".");
  return <span>{prefix}{isDecimal ? val.toFixed(2) : val.toLocaleString()}{suffix}</span>;
}

// ── LANDING ────────────────────────────────────────────────────────────────
export function LandingPage() {
  const { setView } = useApp();
  const prices = usePrices();
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const features = [
    { icon:"⚡", t:"Instant Execution",   d:"Orders execute at market price in milliseconds with 0.10% flat fee." },
    { icon:"🔐", t:"Bank-Grade Security", d:"256-bit SSL encryption, hashed passwords and anti-phishing codes." },
    { icon:"💼", t:"Portfolio Tracking",  d:"Full P&L breakdowns, allocation charts and complete transaction history." },
    { icon:"📈", t:"Live Trading",        d:"Real-time charts with buy/sell orders across 8 major crypto assets." },
    { icon:"🌍", t:"Global Access",       d:"Trade from anywhere in the world — fully mobile optimised." },
    { icon:"💬", t:"24/7 Live Support",   d:"Real human agents available around the clock via live chat." },
  ];

  const testimonials = [
    { name:"James H.", loc:"London, UK",  stars:5, text:"VaultX is the cleanest crypto platform I've used. Deposits are instant and support is exceptional." },
    { name:"Sarah M.", loc:"Toronto, CA", stars:5, text:"Made my first trade within 5 minutes of signing up. The interface is incredibly intuitive." },
    { name:"David K.", loc:"Sydney, AU",  stars:5, text:"I've used Coinbase and Binance. VaultX beats them both on simplicity and customer service." },
  ];

  return (
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAV */}
        <nav style={S.nav} className="vx-nav">
          <div style={S.logo}>
            <div style={S.logoMark} className="vx-glow">V</div>
            <span className="vx-logo-text">VaultX</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }} className="hide-mobile">
            {["about","contact"].map(p => (
              <button key={p} onClick={() => setView(p)} style={{ background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:13, fontWeight:600, padding:"7px 16px", borderRadius:8, fontFamily:"inherit", textTransform:"uppercase", letterSpacing:".05em", transition:"color .15s" }}
                onMouseEnter={e=>e.target.style.color=C.gold}
                onMouseLeave={e=>e.target.style.color=C.text3}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button style={{ ...btn("ghost"), padding:"9px 22px", fontSize:13, borderRadius:9 }} onClick={() => setView("login")}>Sign In</button>
            <button style={{ ...btn("primary"), padding:"9px 22px", fontSize:13, borderRadius:9 }} onClick={() => setView("register")}>Get Started →</button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"0 24px", position:"relative" }}>

          {/* Top badge */}
          <div className="vx-fade-in" style={{ opacity: visible?1:0, display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,180,0,.08)", border:"1px solid rgba(255,180,0,.2)", borderRadius:100, padding:"8px 20px", fontSize:12, color:C.gold, fontWeight:600, marginBottom:32, letterSpacing:".04em", boxShadow:"0 0 20px rgba(255,180,0,.1)" }}>
            <span style={S.ldot}/>
            Live · FCA Regulated · UK Licensed · Real-time Markets
          </div>

          {/* Main headline */}
          <h1 className="vx-fade-in" style={{ fontSize:"clamp(48px,8vw,96px)", fontWeight:800, letterSpacing:"-4px", lineHeight:.95, marginBottom:28, color:"#fff", maxWidth:900 }}>
            Trade crypto<br/>
            <span style={{ background:"linear-gradient(135deg,#b87800,#ffb400,#ffd700,#ffb400)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:"drop-shadow(0 0 40px rgba(255,180,0,.4))" }}>
              like a pro.
            </span>
          </h1>

          <p className="vx-fade-in" style={{ fontSize:"clamp(15px,2vw,20px)", color:C.text2, maxWidth:560, marginBottom:44, lineHeight:1.85 }}>
            Real-time markets, portfolio management and instant transfers — the platform serious traders choose.
          </p>

          <div className="vx-fade-in" style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:56 }}>
            <button style={{ ...btn("primary"), padding:"16px 48px", fontSize:16, borderRadius:12, boxShadow:"0 8px 32px rgba(255,180,0,.4)" }} onClick={() => setView("register")}>
              Open Free Account →
            </button>
            <button style={{ ...btn("ghost"), padding:"16px 36px", fontSize:16, borderRadius:12 }} onClick={() => setView("login")}>
              Sign In
            </button>
          </div>

          {/* Trust row */}
          <div className="vx-fade-in" style={{ display:"flex", gap:28, flexWrap:"wrap", justifyContent:"center", marginBottom:80 }}>
            {["🔒 256-bit SSL","⚡ Instant execution","🏢 FCA Regulated","💬 24/7 Support"].map((t,i) => (
              <span key={i} style={{ fontSize:13, color:C.text3, display:"flex", alignItems:"center", gap:5 }}>{t}</span>
            ))}
          </div>

          {/* Live price pills */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", maxWidth:900 }}>
            {COINS.slice(0,6).map(coin => {
              const p = prices[coin.sym]||{price:0,change:0};
              const up = p.change>=0;
              return (
                <div key={coin.sym} style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,180,0,.1)", borderRadius:100, padding:"8px 18px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"all .2s" }}
                  onClick={() => setView("register")}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.35)";e.currentTarget.style.background="rgba(255,180,0,.06)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.1)";e.currentTarget.style.background="rgba(255,255,255,.04)";}}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#fff" }}>{coin.sym}</span>
                  <span style={{ fontSize:12, fontFamily:"monospace", color:"#fff" }}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:up?C.green:C.red }}>{up?"+":""}{fmt(p.change)}%</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* STATS BAR */}
        <section style={{ borderTop:`1px solid rgba(255,180,0,.08)`, borderBottom:`1px solid rgba(255,180,0,.08)`, background:"rgba(255,180,0,.02)", backdropFilter:"blur(10px)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
            {[{v:"2400",pre:"$",suf:"T+",l:"Market Cap"},{v:"50000",pre:"",suf:"K+",l:"Active Traders"},{v:"0.10",pre:"",suf:"%",l:"Trading Fee"},{v:"228",pre:"$",suf:"B+",l:"Volume Traded"}].map((s,i) => (
              <div key={i} style={{ textAlign:"center", padding:"36px 20px", borderRight:i<3?`1px solid rgba(255,180,0,.08)`:"none" }}>
                <div style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:800, color:C.gold, letterSpacing:"-1.5px", marginBottom:6, filter:"drop-shadow(0 0 12px rgba(255,180,0,.3))" }}>
                  {visible && <Counter target={s.v} prefix={s.pre} suffix={s.suf}/>}
                </div>
                <div style={{ fontSize:13, color:C.text3, fontWeight:500 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE PRICES TABLE */}
        <section style={{ maxWidth:1200, margin:"80px auto", padding:"0 32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
            <div>
              <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>📊 Live Markets</div>
              <h2 style={{ fontSize:"clamp(24px,3.5vw,40px)", fontWeight:800, letterSpacing:"-2px" }}>Real-time prices</h2>
            </div>
            <button style={{ ...btn("ghost"), padding:"9px 20px" }} onClick={() => setView("register")}>View All →</button>
          </div>
          <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
            <table style={S.tbl}>
              <thead><tr>{["#","Asset","Price","24h Change","7d Chart",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {COINS.slice(0,8).map((coin,i) => {
                  const p = prices[coin.sym]||{price:0,change:0,spark:[]};
                  const up = p.change>=0;
                  return (
                    <tr key={coin.sym} style={{ cursor:"pointer" }} onClick={() => setView("register")}>
                      <td style={{ ...S.td, color:C.text3, fontWeight:600, width:40 }}>{i+1}</td>
                      <td style={S.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,180,0,.1)", border:"1px solid rgba(255,180,0,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.gold, flexShrink:0 }}>{coin.sym.slice(0,3)}</div>
                          <div>
                            <div style={{ fontWeight:700, color:"#fff", fontSize:14 }}>{coin.sym}</div>
                            <div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...S.td, fontWeight:700, color:"#fff", fontFamily:"monospace", fontSize:15 }}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td>
                      <td style={S.td}>
                        <span style={{ color:up?C.green:C.red, fontWeight:700, fontSize:14, background:up?C.greenBg:C.redBg, padding:"4px 10px", borderRadius:6 }}>{up?"+":""}{fmt(p.change)}%</span>
                      </td>
                      <td style={{ ...S.td, width:120 }}><Spark data={p.spark} color={up?C.green:C.red} w={110} h={30}/></td>
                      <td style={S.td}><button style={{ ...btn("primary"), padding:"6px 18px", fontSize:12 }} onClick={e=>{e.stopPropagation();setView("register");}}>Trade</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ maxWidth:1200, margin:"80px auto", padding:"0 32px" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Platform Features</div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,44px)", fontWeight:800, letterSpacing:"-2px", marginBottom:12 }}>Everything you need</h2>
            <p style={{ fontSize:15, color:C.text3, maxWidth:480, margin:"0 auto" }}>Built for traders who demand speed, reliability and clarity.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16 }}>
            {features.map((f,i) => (
              <div key={i} style={{ ...S.card, transition:"all .25s", cursor:"default" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.4)";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 48px rgba(0,0,0,.6), 0 0 24px rgba(255,180,0,.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.14)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="";}}>
                <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,180,0,.08)", border:"1px solid rgba(255,180,0,.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:18 }}>{f.icon}</div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{f.t}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.85 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ maxWidth:1200, margin:"80px auto", padding:"0 32px" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:12 }}>Testimonials</div>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,44px)", fontWeight:800, letterSpacing:"-2px" }}>Trusted by 50,000+ traders</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:16 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ ...S.card, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.35)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,180,0,.14)";}}>
                <div style={{ display:"flex", gap:2, marginBottom:16 }}>{"★★★★★".split("").map((_,j)=><span key={j} style={{ color:C.gold, fontSize:18 }}>★</span>)}</div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.85, marginBottom:20, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:16, borderTop:`1px solid rgba(255,180,0,.08)` }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#b87800,#ffb400)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#000", flexShrink:0 }}>{t.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth:1200, margin:"80px auto 120px", padding:"0 32px" }}>
          <div style={{ background:"linear-gradient(135deg,rgba(255,180,0,.08),rgba(255,140,0,.04))", border:"1px solid rgba(255,180,0,.2)", borderRadius:24, padding:"clamp(48px,7vw,80px)", textAlign:"center", boxShadow:"0 0 80px rgba(255,180,0,.06)" }}>
            <div style={{ fontSize:11, color:C.gold, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:16 }}>Get Started Today</div>
            <h2 style={{ fontSize:"clamp(32px,5vw,60px)", fontWeight:800, letterSpacing:"-3px", marginBottom:16, lineHeight:1.0 }}>
              Start trading today.<br/>
              <span style={{ background:"linear-gradient(135deg,#b87800,#ffb400,#ffd700)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>It's free.</span>
            </h2>
            <p style={{ fontSize:16, color:C.text2, marginBottom:40, lineHeight:1.8 }}>Open your account in 60 seconds. No hidden fees, no minimum deposit.</p>
            <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
              <button style={{ ...btn("primary"), padding:"16px 48px", fontSize:16, borderRadius:12, boxShadow:"0 8px 32px rgba(255,180,0,.4)" }} onClick={() => setView("register")}>Open Free Account →</button>
              <button style={{ ...btn("ghost"), padding:"16px 36px", fontSize:16, borderRadius:12 }} onClick={() => setView("login")}>Sign In</button>
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
    <div style={{ ...S.app }}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setView("landing")}>
          <div style={S.logoMark}>V</div>
          <span className="vx-logo-text">VaultX</span>
        </div>
        <button style={{ ...btn("ghost"), padding:"8px 20px" }} onClick={() => setView("register")}>Create Account</button>
      </nav>
      <div style={{ minHeight:"calc(100vh - 66px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
        <div style={{ width:"min(420px,100%)" }} className="vx-fade-in">
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ ...S.logoMark, width:52, height:52, borderRadius:14, margin:"0 auto 14px", fontSize:20 }}>V</div>
            <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:"-.5px", marginBottom:6 }}>Sign in to VaultX</h1>
            <p style={{ fontSize:13, color:C.text3 }}>Enter your credentials to continue trading</p>
          </div>
          <div style={{ display:"flex", background:"rgba(255,255,255,.03)", border:`1px solid rgba(255,180,0,.12)`, borderRadius:12, padding:4, marginBottom:20 }}>
            {["client","admin"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"9px", border:"none", borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .2s", background:tab===t?"rgba(255,180,0,.12)":"transparent", color:tab===t?C.gold:C.text3, boxShadow:tab===t?"0 2px 8px rgba(255,180,0,.1)":"none" }}>
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
                <button style={{ ...btn("primary"), width:"100%", padding:"14px", fontSize:15 }} onClick={doLogin}>Sign In →</button>
                <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:C.text3 }}>
                  No account?{" "}<span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={() => setView("register")}>Create one free</span>
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
                <button style={{ ...btn("primary"), width:"100%", padding:"14px", fontSize:15 }} onClick={doAdminLogin}>Access Admin Panel →</button>
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
    if (password.length < 6) { showAlert("Min 6 characters"); return; }
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
    <div style={{ ...S.app }}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setView("landing")}>
          <div style={S.logoMark}>V</div>
          <span className="vx-logo-text">VaultX</span>
        </div>
        <button style={{ ...btn("ghost"), padding:"8px 20px" }} onClick={() => setView("login")}>Sign In</button>
      </nav>
      <div style={{ minHeight:"calc(100vh - 66px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
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
                  {[1,2,3,4].map(i=><div key={i} style={{ flex:1, height:3, borderRadius:2, background:password.length>=i*3?(password.length>=10?C.green:C.gold):"rgba(255,255,255,.1)", transition:"background .3s" }}/>)}
                </div>
                <div style={{ fontSize:11, color:password.length>=10?C.green:C.gold }}>{password.length<6?"Too short":password.length<10?"Fair":"Strong ✓"}</div>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:22, fontSize:13, color:C.text2 }}>
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:C.gold, flexShrink:0, width:15, height:15 }}/>
              <span>I agree to the <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("terms")}>Terms of Service</span> and <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("privacy")}>Privacy Policy</span></span>
            </div>
            <button style={{ ...btn("primary"), width:"100%", padding:"14px", fontSize:15, opacity:saving?0.7:1 }} onClick={doRegister} disabled={saving}>
              {saving?"⏳ Creating Account…":"Create Free Account →"}
            </button>
            <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.text3 }}>
              Already have an account?{" "}<span style={{ color:C.gold, cursor:"pointer", fontWeight:700 }} onClick={()=>setView("login")}>Sign in</span>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:20, flexWrap:"wrap" }}>
            {["🔒 256-bit SSL","🏢 FCA Regulated","✅ No Credit Card"].map((t,i)=>(
              <span key={i} style={{ fontSize:11, color:C.text3 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
