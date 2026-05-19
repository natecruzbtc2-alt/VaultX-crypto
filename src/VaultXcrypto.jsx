import { PriceProvider, AppProvider, useApp } from "./AppContext";
import { LandingPage, LoginPage, RegisterPage } from "./AuthPages";
import { Dashboard, AdminPanel } from "./Layouts";
import { Modals, Toast } from "./Modals";

function App() {
  const { view } = useApp();
  return (
    <>
      {view === "landing"   && <LandingPage />}
      {view === "login"     && <LoginPage />}
      {view === "register"  && <RegisterPage />}
      {view === "dashboard" && <Dashboard />}
      {view === "admin"     && <AdminPanel />}
      <Modals />
      <Toast />
    </>
  );
}

export default function VaultXCrypto() {
  return (
    <AppProvider>
      <PriceProvider>
        <App />
      </PriceProvider>
    </AppProvider>
  );
}
