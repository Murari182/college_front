import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import { lazy, type ReactNode } from "react";
import App from "./App";

const HomePage = lazy(() => import("./pages/home/HomePage"));
const SigninPage = lazy(() => import("./pages/auth/SigninPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const TestAccountPage = lazy(() => import("./pages/auth/TestAccountPage"));
const AboutPage = lazy(() => import("./pages/footer/AboutPage"));
const ContactPage = lazy(() => import("./pages/footer/ContactPage"));
const PrivacyPage = lazy(() => import("./pages/footer/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/footer/TermsPage"));

const CollegePredictorPage = lazy(() => import("./pages/home/CollegePredictorPage"));
const StudentDashboard = lazy(() => import("./pages/dashboard/StudentDashboard"));
const StudentAdvisorDetailPage = lazy(() => import("./pages/dashboard/StudentAdvisorDetailPage"));
const StudentSessionDetailPage = lazy(() => import("./pages/dashboard/StudentSessionDetailPage"));

const AdvisorDashboard = lazy(() => import("./pages/dashboard/AdvisorDashboard"));
const AdvisorSessionDetailPage = lazy(() => import("./pages/dashboard/AdvisorSessionDetailPage"));
const StudentProfilePage = lazy(() => import("./pages/dashboard/StudentProfilePage"));
const AdvisorProfilePage = lazy(() => import("./pages/dashboard/AdvisorProfilePage"));
const AnalysisPage = lazy(() => import("./pages/dashboard/AnalysisPage"));

const rootRoute = createRootRoute({
  component: () => (
    <App>
      <Outlet />
    </App>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const signupRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/signup", component: SignupPage });
const signinRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/signin", component: SigninPage });
const testAccountRoute = createRoute({ getParentRoute: () => rootRoute, path: "/auth/test-account", component: TestAccountPage });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about", component: AboutPage });
const contactRoute = createRoute({ getParentRoute: () => rootRoute, path: "/contact", component: ContactPage });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/privacy", component: PrivacyPage });
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/terms", component: TermsPage });
const analysisRoute = createRoute({ getParentRoute: () => rootRoute, path: "/analysis", component: AnalysisPage });
const studentProfileRoute = createRoute({ getParentRoute: () => rootRoute, path: "/student/profile", component: StudentProfilePage });
const advisorProfileRoute = createRoute({ getParentRoute: () => rootRoute, path: "/advisor/profile", component: AdvisorProfilePage });

const collegePredictorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/college-predictor",
  component: CollegePredictorPage,
});

const studentDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/student/dashboard", component: StudentDashboard });
const studentAdvisorDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/advisor/$advisorId",
  component: StudentAdvisorDetailPage,
});
const studentSessionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student/session/$bookingId",
  component: StudentSessionDetailPage,
});
const advisorDashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/advisor/dashboard", component: AdvisorDashboard });
const advisorSessionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/advisor/session/$bookingId",
  component: AdvisorSessionDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signupRoute,
  signinRoute,
  collegePredictorRoute,
  studentDashboardRoute,
  studentAdvisorDetailRoute,
  studentSessionDetailRoute,
  advisorDashboardRoute,
  advisorSessionDetailRoute,
  studentProfileRoute,
  advisorProfileRoute,
  analysisRoute,
  testAccountRoute,
]);

/**
 * TanStack Router starts with `matches: []` until `router.load()` runs in a layout effect.
 * `MatchesInner` renders null until then, which looks like a blank white page. We always
 * render router children (so `Transitioner` can call `load()`), and show this overlay
 * only while there are no matches yet.
 */
function RouterBootShell({ children }: { children: ReactNode }) {
  const noMatches = useRouterState({ select: (s) => s.matches.length === 0 });

  return (
    <>
      {children}
      {noMatches ? (
        <div
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center gap-3 bg-[oklch(0.09_0.01_265)] text-[oklch(0.96_0.005_260)]"
          role="status"
          aria-live="polite"
        >
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[oklch(0.67_0.19_40)]"
            aria-hidden
          />
          <p className="text-sm text-white/80">Loading Collegeconnects...</p>
        </div>
      ) : null}
    </>
  );
}

function RoutePendingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

export const router = createRouter({
  routeTree,
  InnerWrap: RouterBootShell,
  defaultPendingComponent: RoutePendingFallback,
});

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}