import { useState, useEffect, useRef, useCallback } from "react";
import { usePrices, COINS, fmt } from "./AppContext";
import { C, btn } from "./theme";

const GAME_COINS = ["BTC","ETH","SOL","BNB","XRP","DOGE"];
const ROUND_DURATION = 30;
const RESULT_DURATION = 4;

export default function PredictionGame({ onClose }) {
  const prices = usePrices();
  const [screen, setScreen] = useState("intro"); // intro | playing | result | gameover
  const [playerName, setPlayerName] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);
  const [coin, setCoin] = useState(GAME_COINS[0]);
  const [entryPrice, setEntryPrice] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [resultPhase, setResultPhase] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vx_predict_lb") || "[]"); } catch { return []; }
  });
  const [multiplier, setMultiplier] = useState(1);
  const timerRef = useRef(null);
  const resultRef = useRef(null);

  const MAX_ROUNDS = 5;

  const currentPrice = prices[coin]?.price || 0;

  // Track price history for mini chart
  useEffect(() => {
    if (screen !== "playing" || !currentPrice) return;
    setPriceHistory(prev => {
      const next = [...prev, currentPrice].slice(-40);
      return next;
    });
  }, [currentPrice, screen]);

  const nextRound = useCallback(() => {
    const nextCoin = GAME_COINS[Math.floor(Math.random() * GAME_COINS.length)];
    setCoin(nextCoin);
    setPrediction(null);
    setEntryPrice(null);
    setPriceHistory([]);
    setResultPhase(false);
    setLastResult(null);
    setTimeLeft(ROUND_DURATION);
    setRound(r => r + 1);
  }, []);

  const startGame = () => {
    if (!playerName.trim()) return;
    setScore(0); setStreak(0); setRound(0); setMultiplier(1);
    setScreen("playing");
    nextRound();
  };

  const makePrediction = (dir) => {
    if (prediction || resultPhase) return;
    setPrediction(dir);
    setEntryPrice(currentPrice);
  };

  // Countdown timer
  useEffect(() => {
    if (screen !== "playing" || prediction === null || resultPhase) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          resolveRound();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [prediction, resultPhase, screen]);

  const resolveRound = useCallback(() => {
    setResultPhase(true);
    clearInterval(timerRef.current);

    setEntryPrice(ep => {
      const exitPrice = prices[coin]?.price || ep;
      const won = prediction === "up" ? exitPrice > ep : exitPrice < ep;
      const priceDiff = exitPrice - ep;
      const pctChange = ep ? ((priceDiff / ep) * 100).toFixed(3) : "0.000";

      setLastResult({ won, exitPrice, entryPrice: ep, priceDiff, pctChange, prediction });

      if (won) {
        setStreak(s => {
          const newStreak = s + 1;
          const newMult = newStreak >= 3 ? 2 : 1;
          setMultiplier(newMult);
          const pts = 100 * newMult;
          setScore(sc => sc + pts);
          return newStreak;
        });
      } else {
        setStreak(0);
        setMultiplier(1);
      }

      resultRef.current = setTimeout(() => {
        setRound(r => {
          if (r + 1 >= MAX_ROUNDS) {
            setScreen("gameover");
            return r;
          }
          nextRound();
          return r;
        });
      }, RESULT_DURATION * 1000);

      return ep;
    });
  }, [coin, prediction, prices, nextRound]);

  // Cleanup
  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearTimeout(resultRef.current);
  }, []);

  const saveScore = () => {
    const entry = { name: playerName, score, date: new Date().toLocaleDateString() };
    const updated = [...leaderboard, entry].sort((a,b) => b.score - a.score).slice(0,10);
    setLeaderboard(updated);
    localStorage.setItem("vx_predict_lb", JSON.stringify(updated));
    setScreen("intro");
  };

  // Mini sparkline
  const Sparkline = ({ data, w=200, h=60 }) => {
    if (!data || data.length < 2) return null;
    const mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1;
    const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-mn)/r)*(h-4)-2}`).join(" ");
    const last = data[data.length-1];
    const first = data[0];
    const up = last >= first;
    return (
      <svg width={w} height={h} style={{display:"block"}}>
        <polyline points={pts} fill="none" stroke={up?"#22c55e":"#ef4444"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        <circle cx={(data.length-1)/(data.length-1)*w} cy={h-((last-mn)/r)*(h-4)-2} r="3" fill={up?"#22c55e":"#ef4444"}/>
      </svg>
    );
  };

  const timerPct = (timeLeft / ROUND_DURATION) * 100;
  const timerColor = timeLeft > 15 ? "#22c55e" : timeLeft > 7 ? "#ffb400" : "#ef4444";

  // ── INTRO SCREEN ────────────────────────────────────────────────────────
  if (screen === "intro") return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(12px)" }}
      onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={{ background:"linear-gradient(155deg,#100d08,#080608)", border:"1px solid rgba(255,180,0,.25)", borderRadius:22, padding:36, width:"min(480px,95vw)", boxShadow:"0 24px 80px rgba(0,0,0,.8)" }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🎯</div>
          <h2 style={{ fontSize:24, fontWeight:800, color:"#fff", letterSpacing:"-.5px", marginBottom:6 }}>Crypto Prediction</h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", lineHeight:1.7 }}>
            Predict if the price will go <strong style={{color:"#22c55e"}}>UP ↑</strong> or <strong style={{color:"#ef4444"}}>DOWN ↓</strong> in 30 seconds.<br/>
            Get 3 in a row for a <strong style={{color:"#ffb400"}}>2x multiplier!</strong>
          </p>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".07em", fontWeight:600, display:"block", marginBottom:6 }}>Your Name</label>
          <input value={playerName} onChange={e=>setPlayerName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&startGame()}
            placeholder="Enter your name to play" autoFocus
            style={{ width:"100%", background:"rgba(255,255,255,.05)", border:"1.5px solid rgba(255,180,0,.2)", color:"#fff", padding:"12px 14px", borderRadius:12, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }}/>
        </div>

        <button style={{ ...btn("primary"), width:"100%", padding:"14px", fontSize:15, borderRadius:12, opacity:playerName.trim()?1:.5 }}
          onClick={startGame} disabled={!playerName.trim()}>
          🚀 Start Game (5 rounds)
        </button>

        {leaderboard.length > 0 && (
          <div style={{ marginTop:24 }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:".07em", marginBottom:10 }}>🏆 Top Scores</div>
            {leaderboard.slice(0,5).map((e,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,180,0,.06)", fontSize:13 }}>
                <span style={{ color:i===0?"#ffb400":i===1?"#c0c0c0":i===2?"#cd7f32":"rgba(255,255,255,.5)" }}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`} {e.name}
                </span>
                <span style={{ color:"#ffb400", fontWeight:700 }}>{e.score.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,.3)", cursor:"pointer", width:"100%", marginTop:16, fontSize:13, fontFamily:"inherit" }}>
          Close
        </button>
      </div>
    </div>
  );

  // ── GAME OVER ────────────────────────────────────────────────────────────
  if (screen === "gameover") return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(12px)" }}>
      <div style={{ background:"linear-gradient(155deg,#100d08,#080608)", border:"1px solid rgba(255,180,0,.25)", borderRadius:22, padding:36, width:"min(420px,95vw)", textAlign:"center", boxShadow:"0 24px 80px rgba(0,0,0,.8)" }}>
        <div style={{ fontSize:56, marginBottom:12 }}>{score >= 400 ? "🏆" : score >= 200 ? "🎉" : "💪"}</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:6 }}>Game Over!</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", marginBottom:24 }}>Great predictions, {playerName}!</p>
        <div style={{ background:"rgba(255,180,0,.08)", border:"1px solid rgba(255,180,0,.2)", borderRadius:14, padding:"20px 28px", marginBottom:24 }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>Final Score</div>
          <div style={{ fontSize:48, fontWeight:800, color:"#ffb400", letterSpacing:"-2px" }}>{score.toLocaleString()}</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", marginTop:4 }}>points</div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ ...btn("primary"), flex:1, padding:"13px" }} onClick={saveScore}>Save Score</button>
          <button style={{ ...btn("ghost"), flex:1, padding:"13px" }} onClick={() => { setScreen("intro"); }}>Play Again</button>
        </div>
      </div>
    </div>
  );

  // ── PLAYING SCREEN ────────────────────────────────────────────────────────
  const coinData = COINS.find(c => c.sym === coin) || COINS[0];
  const priceChange = prices[coin]?.change || 0;
  const priceUp = priceChange >= 0;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(12px)" }}>
      <div style={{ background:"linear-gradient(155deg,#100d08,#080608)", border:"1px solid rgba(255,180,0,.25)", borderRadius:22, padding:28, width:"min(460px,95vw)", boxShadow:"0 24px 80px rgba(0,0,0,.8)", position:"relative" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".07em" }}>Round {round + 1} / {MAX_ROUNDS}</div>
            <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginTop:2 }}>{playerName}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", textTransform:"uppercase", letterSpacing:".07em" }}>Score</div>
            <div style={{ fontSize:20, fontWeight:800, color:"#ffb400" }}>{score.toLocaleString()}</div>
          </div>
        </div>

        {/* Streak + multiplier */}
        {streak > 0 && (
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <div style={{ background:"rgba(255,180,0,.1)", border:"1px solid rgba(255,180,0,.25)", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#ffb400", fontWeight:700 }}>
              🔥 {streak} streak
            </div>
            {multiplier > 1 && (
              <div style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", borderRadius:8, padding:"5px 12px", fontSize:12, color:"#22c55e", fontWeight:700 }}>
                ⚡ {multiplier}x multiplier
              </div>
            )}
          </div>
        )}

        {/* Coin info */}
        <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:20, marginBottom:20, textAlign:"center" }}>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", marginBottom:8 }}>{coinData.name}</div>
          <div style={{ fontSize:36, fontWeight:800, color:"#fff", letterSpacing:"-1px", marginBottom:4 }}>
            ${currentPrice < 1 ? currentPrice.toFixed(4) : fmt(currentPrice)}
          </div>
          <div style={{ fontSize:13, color:priceUp?"#22c55e":"#ef4444", fontWeight:600, marginBottom:12 }}>
            {priceUp?"+":""}{fmt(priceChange)}% today
          </div>
          <Sparkline data={priceHistory} w={280} h={56}/>

          {entryPrice && (
            <div style={{ marginTop:10, fontSize:12, color:"rgba(255,255,255,.4)" }}>
              Entry: <strong style={{color:"#ffb400"}}>${entryPrice < 1 ? entryPrice.toFixed(4) : fmt(entryPrice)}</strong>
              {" "}→ Current: <strong style={{color:currentPrice > entryPrice?"#22c55e":"#ef4444"}}>${currentPrice < 1 ? currentPrice.toFixed(4) : fmt(currentPrice)}</strong>
            </div>
          )}
        </div>

        {/* Result overlay */}
        {resultPhase && lastResult && (
          <div style={{ background:lastResult.won?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)", border:`1px solid ${lastResult.won?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`, borderRadius:12, padding:"14px 20px", marginBottom:16, textAlign:"center" }}>
            <div style={{ fontSize:28, marginBottom:4 }}>{lastResult.won ? "✅" : "❌"}</div>
            <div style={{ fontSize:16, fontWeight:800, color:lastResult.won?"#22c55e":"#ef4444" }}>
              {lastResult.won ? `+${100 * multiplier} points!` : "Wrong prediction"}
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.45)", marginTop:4 }}>
              Price went {lastResult.priceDiff >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(lastResult.pctChange))}%
              — you predicted {lastResult.prediction === "up" ? "↑ UP" : "↓ DOWN"}
            </div>
          </div>
        )}

        {/* Timer bar */}
        {prediction && !resultPhase && (
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,.4)" }}>Time remaining</span>
              <span style={{ fontSize:13, fontWeight:700, color:timerColor }}>{timeLeft}s</span>
            </div>
            <div style={{ background:"rgba(255,255,255,.08)", borderRadius:4, height:6 }}>
              <div style={{ background:timerColor, height:6, borderRadius:4, width:`${timerPct}%`, transition:"width 1s linear" }}/>
            </div>
          </div>
        )}

        {/* Prediction buttons */}
        {!prediction && !resultPhase && (
          <div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.5)", textAlign:"center", marginBottom:12 }}>
              Will <strong style={{color:"#fff"}}>{coin}</strong> go up or down in 30 seconds?
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <button onClick={() => makePrediction("up")}
                style={{ ...btn("success"), padding:"18px", fontSize:18, borderRadius:12, flexDirection:"column", gap:4 }}>
                ↑ UP
                <span style={{fontSize:11,fontWeight:400,opacity:.7}}>+100 pts</span>
              </button>
              <button onClick={() => makePrediction("down")}
                style={{ ...btn("danger"), padding:"18px", fontSize:18, borderRadius:12, flexDirection:"column", gap:4 }}>
                ↓ DOWN
                <span style={{fontSize:11,fontWeight:400,opacity:.7}}>+100 pts</span>
              </button>
            </div>
          </div>
        )}

        {prediction && !resultPhase && (
          <div style={{ textAlign:"center", padding:"14px", background:"rgba(255,255,255,.04)", borderRadius:12, fontSize:14, color:"rgba(255,255,255,.6)" }}>
            You predicted <strong style={{color:prediction==="up"?"#22c55e":"#ef4444", fontSize:16}}>{prediction === "up" ? "↑ UP" : "↓ DOWN"}</strong> — waiting for result...
          </div>
        )}
      </div>
    </div>
  );
}
