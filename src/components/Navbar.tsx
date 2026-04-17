import { Link, useLocation } from "@tanstack/react-router";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { BrandLogo } from "@/components/BrandLogo";
import { ProfileDropdown } from "./ProfileDropdown";

const navLinks: { label: string; href: string; isHash: boolean }[] = [
  { label: "HOME", href: "/", isHash: false },
  { label: "HOW IT WORKS", href: "#how-it-works", isHash: true },
  { label: "WHY US", href: "#why-us", isHash: true },
  { label: "COLLEGE PREDICTOR", href: "/college-predictor", isHash: false },
  { label: "ABOUT", href: "/about", isHash: false },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const auth = getFirebaseAuth();
    
    // Set initial user if already available (prevents guest flicker)
    if (auth.currentUser) {
      setAuthUser(auth.currentUser);
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
    });
    return unsub;
  }, []);

  const isHomePage = location.pathname === "/";
  const isDashboard = location.pathname.includes("/dashboard");
  const userRole = (localStorage.getItem("user_role") as "student" | "advisor") || "student";

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href === "/") {
      // Go home but don't trigger dashboard redirect for logged-in users browsing home
      window.location.href = "/";
      return;
    }
    if (href.startsWith("#")) {
      if (isHomePage) {
        // Already on homepage — smooth scroll to section
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        // Navigate to home with the hash — browser will scroll natively
        window.location.href = "/" + href;
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-50 transition-all duration-300 py-4">
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <BrandLogo size="sm" asLink withText />
        </div>

        {/* Desktop Nav */}
        {!isDashboard && (
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) =>
              link.isHash ? (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-[11px] font-black text-slate-400 hover:text-[#F5A623] transition-colors tracking-[0.15em] uppercase"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-[11px] font-black text-slate-400 hover:text-[#F5A623] transition-colors tracking-[0.15em] uppercase"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        )}

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-8">
          {authUser ? (
            <ProfileDropdown 
              role={userRole} 
              userName={authUser.displayName || undefined} 
              avatarUrl={authUser.photoURL || undefined}
            />
          ) : (
            <>
              <Link to="/auth/signin" className="text-[11px] font-black text-slate-400 hover:text-slate-900 tracking-[0.15em] uppercase">
                SIGN IN
              </Link>
              <Link to="/auth/signup" className="btn-primary py-3 px-8 text-[11px] tracking-[0.1em] rounded-md">
                SIGN UP
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 text-slate-900" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-50 shadow-2xl p-8"
          >
            <nav className="flex flex-col gap-6 text-center">
              {navLinks.map(link => (
                <button 
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-[12px] font-black text-slate-400 uppercase tracking-widest"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                {authUser ? (
                  <button onClick={() => getFirebaseAuth().signOut()} className="text-red-500 font-bold">Log Out</button>
                ) : (
                  <>
                    <Link to="/auth/signin" className="text-[12px] font-black text-slate-900">SIGN IN</Link>
                    <Link to="/auth/signup" className="btn-primary py-4">SIGN UP</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}