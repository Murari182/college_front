import { Link, useLocation } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { BrandLogo } from "@/components/BrandLogo";

const navLinks: { label: string; href: string; isHash: boolean }[] = [
  { label: "Home", href: "/", isHash: false },
  { label: "How It Works", href: "#how-it-works", isHash: true },
  { label: "Why Us", href: "#why-us", isHash: true },
  { label: "College Predictor", href: "/college-predictor", isHash: false },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthResolved(true);
    });
  }, []);
  const isPostSigninPage =
    location.pathname.startsWith("/student/dashboard") ||
    location.pathname.startsWith("/advisor/dashboard");
  const showTopNav = !isPostSigninPage || !authResolved || !authUser;

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href === "/") {
      window.location.href = "/";
      return;
    }
    if (isHomePage) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/" + href;
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Logo */}
        <BrandLogo size="sm" asLink withText />

        {/* Desktop Nav */}
        {showTopNav ? (
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.isHash ? (
                <button
                  type="button"
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-200 hover:text-glow-teal"
                  data-ocid="nav.link"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-200 hover:text-glow-teal"
                  data-ocid="nav.link"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Get Started Button */}
        {showTopNav ? (
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 hover:scale-105 text-black font-semibold rounded-xl px-5 py-2 text-sm glow-orange transition-all duration-300"
            >
              Sign Up
            </Link>
            <Link
              to="/auth/signin"
              className="text-sm font-medium text-foreground hover:text-neon-teal transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : null}

        {/* Mobile actions */}
        {showTopNav ? (
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/auth/signup"
              className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 text-black font-semibold rounded-lg px-3 py-1.5 text-xs glow-orange transition-all duration-300"
            >
              Sign Up
            </Link>
            <button
              type="button"
              className="text-foreground p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-ocid="nav.toggle"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        ) : null}
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {showTopNav && mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-strong border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col px-4 py-4 gap-3">
              {navLinks.map((link) =>
                link.isHash ? (
                  <button
                    type="button"
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="text-left text-sm font-body text-muted-foreground hover:text-foreground transition-colors py-2"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-left text-sm font-body text-muted-foreground hover:text-foreground transition-colors py-2 block"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <Link
                to="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 text-black font-semibold rounded-xl px-5 py-2.5 text-sm glow-orange transition-all duration-300 mt-4"
              >
                Sign Up
              </Link>

              <Link
                to="/auth/signin"
                onClick={() => setMobileOpen(false)}
                className="text-center text-sm font-medium text-foreground py-2 mt-2"
              >
                Sign In
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}