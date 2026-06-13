import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Search, Calendar, Video, Lightbulb } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Search Advisor",
    description: "Browse student advisors by college, branch, or year. Filter by rating and session price to find your perfect match."
  },
  {
    num: "02",
    icon: Calendar,
    title: "Book Session",
    description: "Choose a time slot that works for you. Pay securely online for a 30 or 60-minute one-on-one session.",
    badges: ["30 min — ₹199", "60 min — ₹349"]
  },
  {
    num: "03",
    icon: Video,
    title: "Talk on Google Meet",
    description: "Join your private session link directly. Ask your questions comfortably and get the insights you need."
  },
  {
    num: "04",
    icon: Lightbulb,
    title: "Get Real Insights",
    description: "Walk away with clarity and confidence. No more guessing—only knowing where you're headed."
  }
];

function StepCard({ step, i, scrollYProgress }: { step: any, i: number, scrollYProgress: any }) {
  // Each card has a slightly different parallax speed
  const y = useTransform(scrollYProgress, [0, 1], [0, -50 * (i + 1)]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <motion.div
      style={{ y, opacity, scale }}
      className="bg-[#F8F9FB] p-6 md:p-12 relative group hover:bg-white transition-colors duration-500 border-r border-b border-slate-100"
    >
      {/* Numeric Watermark */}
      <div className="absolute top-10 right-10 text-8xl font-black text-orange-500/5 select-none pointer-events-none group-hover:text-orange-500/10 transition-colors">
        {step.num}
      </div>

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-lg bg-white border border-orange-100 flex items-center justify-center text-[#F5A623] mb-10 shadow-sm transition-transform group-hover:scale-110">
          <step.icon size={22} strokeWidth={2.5} />
        </div>
        
        <p className="text-[10px] font-black text-[#F5A623] uppercase tracking-[0.2em] mb-4">Step {step.num}</p>
        <h3 className="text-3xl font-bold text-[#1E1E1E] mb-6">{step.title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
          {step.description}
        </p>

        {step.badges && (
          <div className="flex gap-3 mt-8">
            {step.badges.map(b => (
              <span key={b} className="px-3 py-1.5 rounded bg-white border border-slate-100 text-[10px] font-bold text-slate-400">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <section ref={containerRef} id="how-it-works" className="bg-white py-32 px-6 border-t border-slate-100">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-7xl font-extrabold text-[#1E1E1E]"
          >
            How It Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-medium mb-4"
          >
            From search to insight in four simple steps.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-100 border-l border-t border-slate-100 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} i={i} scrollYProgress={scrollYProgress} />
          ))}
        </div>

      </div>
    </section>
  );
}
