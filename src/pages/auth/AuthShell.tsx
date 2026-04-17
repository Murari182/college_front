import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  const goHome = () => {
    Promise.resolve(navigate({ to: "/" })).catch(() => {
      window.location.assign("/");
    });
  };

  return (
    <div className="relative py-24 px-4 sm:px-6 min-h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Dot-grid background pattern consistent with dashboards */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#1E3A8A 0.5px, transparent 0.5px)`, backgroundSize: '28px 28px' }}
      />

      <div className="max-w-lg mx-auto relative z-10">
        <div className="relative z-[60] mb-8 flex flex-col items-start gap-3 w-full">
          <button
            type="button"
            onClick={goHome}
            className="inline-flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            Back to home
          </button>
          <button
            type="button"
            onClick={goHome}
            className="inline-flex shrink-0"
            aria-label="Collegeconnects home"
          >
            <BrandLogo size="lg" align="start" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] p-8 sm:p-10"
        >
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

