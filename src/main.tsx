import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import DeployConfigMissing from "./components/DeployConfigMissing";
import { RootErrorBoundary } from "./components/RootErrorBoundary";
import {
  getFirebaseAnalytics,
  getFirebaseApp,
  isFirebaseConfigured,
} from "./lib/firebase";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const MainShell = lazy(() => import("./MainShell"));

function initAnalyticsDeferred() {
  const startAnalytics = () => {
    void getFirebaseAnalytics();
  };

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(startAnalytics, { timeout: 2000 });
    return;
  }

  setTimeout(startAnalytics, 800);
}

function LoadingShell() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "2px solid rgba(30, 58, 138, 0.1)",
          borderTopColor: "#1E3A8A",
          borderRadius: "50%",
          animation: "cc-spin 0.6s linear infinite",
        }}
        aria-hidden
      />
      <style>{`@keyframes cc-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const rootEl = document.getElementById("root")!;

if (!isFirebaseConfigured()) {
  ReactDOM.createRoot(rootEl).render(<DeployConfigMissing />);
} else {
  getFirebaseApp();
  initAnalyticsDeferred();

  ReactDOM.createRoot(rootEl).render(
    <RootErrorBoundary>
      <Suspense fallback={<LoadingShell />}>
        <MainShell />
      </Suspense>
    </RootErrorBoundary>,
  );
}
