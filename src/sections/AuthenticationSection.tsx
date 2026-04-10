import { BrandLogo } from "@/components/BrandLogo";
import { Link } from "@tanstack/react-router";
import { Briefcase, GraduationCap, LogIn, UserPlus } from "lucide-react";
import { motion } from "motion/react";

export default function AuthenticationSection() {
  return (
    <section
      id="authentication"
      className="relative py-24 px-4 sm:px-6 overflow-hidden scroll-mt-24"
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 55% at 50% 0%, oklch(0.72 0.16 230), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <div className="flex justify-center mb-6">
            <Link to="/" className="inline-flex" aria-label="Collegeconnects home">
              <BrandLogo size="lg" />
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
            Accounts & Access
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground">
            <span className="gradient-text-multi">Authentication</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your role to sign up or sign in.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/auth/signup"
            className="inline-flex items-center justify-center bg-neon-orange hover:bg-neon-orange/80 hover:scale-105 hover:shadow-lg text-black font-semibold rounded-2xl px-10 py-4 text-lg glow-orange transition-all duration-300 min-w-[200px]"
          >
            <UserPlus size={20} className="mr-2" />
            Sign Up
          </Link>
          <Link
            to="/auth/signin"
            className="inline-flex items-center justify-center border-2 border-neon-teal/40 text-neon-teal hover:bg-neon-teal/15 hover:border-neon-teal hover:scale-105 hover:shadow-lg rounded-2xl px-10 py-4 text-lg glow-teal transition-all duration-300 min-w-[200px]"
          >
            <LogIn size={20} className="mr-2" />
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}