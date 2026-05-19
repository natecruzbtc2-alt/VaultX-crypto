import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { supabase } from "./supabase";

export const COINS = [
  { sym: "BTC", name: "Bitcoin", color: "#F7931A", bg: "#1a0f00" },
  { sym: "ETH", name: "Ethereum", color: "#7B8CDE", bg: "#0a0d1a" },
  { sym: "SOL", name: "Solana", color: "#9945FF", bg: "#0d0020" },
  { sym: "BNB", name: "BNB", color: "#F0B90B", bg: "#1a1200" },
  { sym: "XRP", name: "XRP", color: "#00AAE4", bg: "#001520" },
  { sym: "ADA", name: "Cardano", color: "#4A90E2", bg: "#000d1a" },
  { sym: "DOGE", name: "Dogecoin", color: "#C2A633", bg: "#181200" },
  { sym: "MATIC", name: "Polygon", color: "#8247E5", bg: "#0d0020" },
];

export const BASE_PRICES = {
  BTC: 67842,
  ETH: 3521,
  SOL: 172,
  BNB: 598,
  XRP: 0.62,
  ADA: 0.48,
  DOGE: 0.14,
  MATIC: 0.88,
};

export const ADMIN_CREDS = {
  username: "admin",
  password: "admin123",
};

export const fmt = (n, d = 2) =>
  typeof n === "number"
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : String(n);

export const coinInfo = (sym) =>
  COINS.find((c) => c.sym === sym) || COINS[0];

function genSparkline(base, n = 20) {
  const p = [base];

  for (let i = 1; i < n; i++) {
    p.push(p[i - 1] * (1 + (Math.random() - 0.495) * 0.03));
  }

  return p;
}

export function createHoldings(pf = 0) {
  const w = [0.35, 0.25, 0.18, 0.12, 0.1];

  return COINS.slice(0, 5).map((c, i) => ({
    sym: c.sym,
    qty: +((pf * w[i]) / (BASE_PRICES[c.sym] || 1)).toFixed(6),
  }));
}

export function createStaking(pf = 0) {
  return [
    {
      sym: "ETH",
      qty: +((pf * 0.04) / BASE_PRICES.ETH).toFixed(6),
      apy: 4.8,
    },
    {
      sym: "SOL",
      qty: +((pf * 0.03) / BASE_PRICES.SOL).toFixed(6),
      apy: 7.2,
    },
    {
      sym: "ADA",
      qty: +((pf * 0.02) / BASE_PRICES.ADA).toFixed(6),
      apy: 5.1,
    },
  ].filter((s) => s.qty > 0);
}

function genPendingTx() {
  return [];
}

export const PriceContext = createContext({});
export const AppContext = createContext({});

export const usePrices = () => useContext(PriceContext);
export const useApp = () => useContext(AppContext);

export function PriceProvider({ children }) {
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(
      COINS.map((c) => [
        c.sym,
        {
          price: BASE_PRICES[c.sym],
          change: +(Math.random() * 10 - 5).toFixed(2),
          spark: genSparkline(BASE_PRICES[c.sym]),
        },
      ])
    )
  );

  useEffect(() => {
    let active = true;

    const go = async () => {
      try {
        const r = await Promise.all(
          COINS.map(async (c) => {
            const res = await fetch(
              `https://api.coinbase.com/v2/prices/${c.sym}-USD/spot`
            );

            const j = await res.json();

            return [c.sym, Number(j?.data?.amount)];
          })
        );

        if (!active) return;

        setPrices((prev) => {
          const next = { ...prev };

          r.forEach(([sym, price]) => {
            if (!price || !next[sym]) return;

            const old = next[sym];

            next[sym] = {
              price,
              change: +(
                ((price - old.price) / Math.max(old.price, 1)) *
                100
              ).toFixed(2),
              spark: [...old.spark.slice(1), price],
            };
          });

          return next;
        });
      } catch (e) {
        console.log(e);
      }
    };

    go();

    const id = setInterval(go, 10000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <PriceContext.Provider value={prices}>
      {children}
    </PriceContext.Provider>
  );
}

export function AppProvider({ children }) {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [dashTab, setDashTab] = useState("overview");
  const [adminTab, setAdminTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [txHistory, setTxHistory] = useState({});
  const [pending, setPending] = useState(genPendingTx());
  const [feeReqs, setFeeReqs] = useState([]);

  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from("vx_users")
        .select("*");

      if (error) {
        console.log(error);
        return;
      }

      if (data) {
        setUsers(data);
        localStorage.setItem("vx_users", JSON.stringify(data));
      }
    } catch (e) {
      console.log(e);

      try {
        const local = JSON.parse(
          localStorage.getItem("vx_users") || "[]"
        );

        setUsers(local);
      } catch {}
    }
  }

  useEffect(() => {
    localStorage.setItem("vx_users", JSON.stringify(users));

    async function saveUsers() {
      for (const u of users) {
        await supabase.from("vx_users").upsert({
          email: u.email,
          name: u.name || "",
          password: u.password || "",
          balance: u.balance || 0,
          portfolio: u.portfolio || 0,
        });
      }
    }

    if (users.length > 0) {
      saveUsers();
    }
  }, [users]);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const showAlert = useCallback((text) => {
    setAlert(text);

    setTimeout(() => {
      setAlert("");
    }, 4000);
  }, []);

  const updateUser = useCallback((u) => {
    setUser(u);

    setUsers((prev) => {
      const exists = prev.find((x) => x.email === u.email);

      if (exists) {
        return prev.map((x) =>
          x.email === u.email ? u : x
        );
      }

      return [...prev, u];
    });
  }, []);

  const addTx = useCallback((email, tx) => {
    setTxHistory((prev) => ({
      ...prev,
      [email]: [tx, ...(prev[email] || [])],
    }));
  }, []);

  const getTxs = useCallback(
    (email) => txHistory[email] || [],
    [txHistory]
  );

  const removePending = useCallback(
    (id, label = "Transaction") => {
      setPending((prev) =>
        prev.filter((t) => t.id !== id)
      );

      showToast(label + " processed", "info");
    },
    [showToast]
  );

  const doLogout = useCallback(() => {
    setUser(null);
    setView("landing");
    showToast("Signed out");
  }, [showToast]);

  const value = {
    view,
    setView,
    user,
    setUser,
    dashTab,
    setDashTab,
    adminTab,
    setAdminTab,
    users,
    setUsers,
    txHistory,
    setTxHistory,
    pending,
    setPending,
    feeReqs,
    setFeeReqs,
    toast,
    setToast,
    modal,
    setModal,
    alert,
    setAlert,
    showToast,
    showAlert,
    updateUser,
    addTx,
    getTxs,
    removePending,
    doLogout,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
