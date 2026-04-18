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

// LoadingShell removed to eliminate buffering screen entirely

const rootEl = document.getElementById("root")!;

if (!isFirebaseConfigured()) {
  ReactDOM.createRoot(rootEl).render(<DeployConfigMissing />);
} else {
  getFirebaseApp();
  initAnalyticsDeferred();

  ReactDOM.createRoot(rootEl).render(
    <RootErrorBoundary>
      <Suspense fallback={null}>
        <MainShell />
      </Suspense>
    </RootErrorBoundary>,
  );
}
