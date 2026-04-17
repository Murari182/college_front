import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { CheckCircle2, ShieldCheck, Users, Award } from "lucide-react";

export default function WhySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topics = ["Ragging?", "Hostel life", "Placements", "Professors", "Campus culture", "Fees reality"];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // 3D tilt transforms for the bento grid
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [5, 0, -5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section ref={containerRef} id="why-us" className="bg-white py-24 px-6 relative overflow-hidden border-t border-slate-100 perspective-[2000px]">
      <div className="container mx-auto relative z-10">
        <motion.div 
          style={{ rotateX, scale }}
          className="grid grid-cols-1 md:grid-cols-4 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.03)] transform-style-3d"
        >
          
          {/* Top Row */}
          <motion.div 
            className="bg-[#F8F9FB] p-10 md:col-span-1 flex flex-col justify-center"
          >
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Join a private Google Meet session. Ask anything — hostel life, academics, placements, campus culture.
            </p>
          </motion.div>

          <motion.div 
            className="bg-white p-10 md:col-span-3"
          >
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6 max-w-xl">
              Walk away with honest, first-hand knowledge that no brochure or review site can give you.
            </p>
            <div className="flex flex-wrap gap-2">
              {topics.map(t => (
                <span key={t} className="px-4 py-2 rounded-md bg-orange-50 text-[10px] font-bold text-[#F5A623] uppercase tracking-widest border border-orange-100/50">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Middle Row: The big Headline */}
          <div className="bg-white p-20 md:col-span-4 flex flex-col md:flex-row items-center justify-between gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-4 bg-[#F5A623]" />
                <span className="text-[10px] font-black text-[#F5A623] uppercase tracking-[0.2em]">Why Choose Us</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold text-[#1E1E1E] leading-[0.9]">
                Why CollegeConnects<br />
                <span className="mango-italic">is Different</span>
              </h2>
            </div>
            <p className="max-w-xs text-sm font-medium text-slate-400 leading-relaxed text-right md:mt-20">
              We built the platform we wished existed when we were choosing colleges — a space for real conversations, not scripted showcases.
            </p>
          </div>

          {/* Bottom Row */}
          <div className="bg-white md:col-span-2 group overflow-hidden">
            <div className="h-64 overflow-hidden relative">
              <img 
                src="/college-life.jpg" 
                alt="College Life" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-blue-900/10" />
            </div>
            <div className="p-10">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#F5A623] mb-6">
                <Users size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">2,400+ Verified Student Advisors</p>
              <h3 className="text-2xl font-bold text-[#1E1E1E] mb-4">Real Student Insights</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Every advisor is a currently enrolled student. You get lived experience, not curated marketing content from a college PR team.
              </p>
            </div>
          </div>

          <div className="bg-[#F8F9FB] p-10 md:col-span-1 flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#F5A623] mb-8">
               <ShieldCheck size={20} />
            </div>
            <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">No Fake Reviews</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">
              Sessions are real conversations, not anonymous posts. Advisors are verified students with genuine credentials and college IDs.
            </p>
            <div className="mt-auto flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-100 w-fit">
               <CheckCircle2 size={14} className="text-emerald-600" />
               <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">College ID Verified</span>
            </div>
          </div>

          <div className="bg-white p-10 md:col-span-1">
             <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#F5A623] mb-8">
               <Award size={20} className="text-[#F5A623]" />
            </div>
            <h3 className="text-xl font-bold text-[#1E1E1E] mb-4">Trusted Guidance</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Thousands of families have made better college decisions using CollegeConnects. Join them and choose confidently.
            </p>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

function AwardIcon({ size, className }: { size: number, className?: string }) {
  // Using lucide-react Award directly in actual implementation, adding helper just in case
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
