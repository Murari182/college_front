import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-24 pb-12 px-6 border-t border-slate-100">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          
          <div className="max-w-xs">
            <BrandLogo size="sm" withText />
            <p className="mt-6 text-sm text-slate-400 font-medium leading-relaxed">
              Real conversations. Better college decisions.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-12 gap-y-4">
            <Link to="/about" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">About</Link>
            <Link to="/privacy" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">Privacy</Link>
            <Link to="/terms" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">Terms</Link>
            <Link to="/contact" className="text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest">Contact</Link>
          </nav>

        </div>

        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            &copy; {currentYear} COLLEGECONNECTS. ALL RIGHTS RESERVED.
          </p>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-navy transition-all duration-300 hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-mango transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-navy transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}