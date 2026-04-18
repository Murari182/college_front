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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:hidden fixed inset-0 z-[100] bg-white p-8 pt-24"
          >
            {/* Close button inside mobile menu for clarity */}
            <button className="absolute top-6 right-6 p-2 text-slate-900" onClick={() => setMobileOpen(false)}>
              <X size={28} />
            </button>

            <nav className="flex flex-col gap-8 text-center h-full justify-center pb-20">
              {navLinks.map(link => (
                <button 
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-lg font-black text-slate-400 focus:text-[#F5A623] active:text-[#F5A623] uppercase tracking-[0.2em]"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-10 border-t border-slate-50 flex flex-col gap-6">
                {authUser ? (
                  <button 
                    onClick={() => {
                        getFirebaseAuth().signOut();
                        setMobileOpen(false);
                    }} 
                    className="text-red-500 font-bold uppercase tracking-widest text-sm"
                  >
                    Log Out
                  </button>
                ) : (
                  <>
                    <Link 
                        to="/auth/signin" 
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-black text-slate-900 uppercase tracking-widest"
                    >
                        SIGN IN
                    </Link>
                    <Link 
                        to="/auth/signup" 
                        onClick={() => setMobileOpen(false)}
                        className="btn-primary py-5 rounded-xl text-sm tracking-widest"
                    >
                        SIGN UP
                    </Link>
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