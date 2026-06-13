import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import DeployConfigMissing from "./components/DeployConfigMissing";
import { RootErrorBoundary } from "./components/RootErrorBoundary";
import {
  getFirebaseAnalytics,
  getFirebaseApp,
  isFirebaseConfigured,
  isUiOnlyMode,
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

// LoadingShell removed to eliminate buffering screen entirely

const rootEl = document.getElementById("root")!;

if (!isFirebaseConfigured() && !import.meta.env.DEV) {
  ReactDOM.createRoot(rootEl).render(<DeployConfigMissing />);
} else {
  getFirebaseApp();
  if (!isUiOnlyMode()) {
    initAnalyticsDeferred();
  }

  ReactDOM.createRoot(rootEl).render(
    <RootErrorBoundary>
      {isUiOnlyMode() ? (
        <div
          style={{
            position: "fixed",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            padding: "8px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: "rgba(15, 23, 42, 0.92)",
            color: "#f8fafc",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            pointerEvents: "none",
          }}
        >
          UI preview — add Firebase env vars to enable sign-in and dashboards
        </div>
      ) : null}
      <Suspense fallback={null}>
        <MainShell />
      </Suspense>
    </RootErrorBoundary>,
  );
}
