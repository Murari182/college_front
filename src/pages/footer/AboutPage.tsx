import React from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Rocket, 
  Target, 
  ShieldAlert, 
  Lightbulb, 
  Server, 
  Users, 
  Search, 
  Zap,
  CheckCircle2
} from "lucide-react";

const Section = ({ title, children, icon: Icon, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="mb-24"
  >
    <div className="flex items-center gap-4 mb-8">
      {Icon && <div className="p-3 rounded-2xl bg-orange-50 text-[#F5A623]"><Icon size={24} /></div>}
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">{title}</h2>
    </div>
    {children}
  </motion.div>
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-7xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic">
              Our <span className="text-[#F5A623]">Mission</span>
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed font-medium">
              We are building a next-generation guidance platform built to redefine how students make one of the most important decisions of their lives: choosing the right college.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Market Dynamics */}
        <Section title="Market Dynamics" icon={Search}>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 text-red-500 mb-6 font-bold uppercase tracking-widest text-sm">
                <ShieldAlert size={18} />
                The Problem
              </div>
              <ul className="space-y-6">
                {[
                  "Incomplete or misleading information.",
                  "Limited access to real student experiences.",
                  "Overdependence on rigid coaching systems.",
                  "A complete lack of personalized guidance."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-600 font-medium">
                    <span className="text-slate-300 font-bold">0{i+1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-slate-200 text-slate-400 font-medium text-sm italic">
                Result: Uncertainty, regret, and misaligned choices.
              </div>
            </div>
            
            <div className="p-10 rounded-[2.5rem] bg-orange-50 border border-orange-100">
              <div className="flex items-center gap-3 text-[#F5A623] mb-6 font-bold uppercase tracking-widest text-sm">
                <Zap size={18} />
                Our Solution
              </div>
              <p className="text-xl text-slate-800 font-semibold mb-6">
                CollegeConnect shifts the paradigm from <span className="italic">“searching for information”</span> to <span className="text-[#F5A623] italic">“experiencing insights.”</span>
              </p>
              <ul className="space-y-6">
                {[
                  "Students gain actionable clarity through real conversations.",
                  "Advisors are incentivized to share genuine, unvarnished insights.",
                  "Decisions are backed by deep context, not surface-level assumptions."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <CheckCircle2 className="text-[#F5A623] shrink-0 mt-1" size={20} />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Strategic Direction */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-12 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Rocket size={120} />
            </div>
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase opacity-50 mb-4">The Mission</h3>
            <p className="text-2xl font-semibold leading-relaxed relative z-10">
              To create a transparent, student-driven ecosystem where every individual can access authentic, personalized guidance—without bias, misinformation, or barriers.
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-12 rounded-[3rem] bg-[#F5A623] text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
              <Target size={120} />
            </div>
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase opacity-60 mb-4">The Vision</h3>
            <p className="text-2xl font-semibold leading-relaxed relative z-10">
              A future where no student makes an academic decision in uncertainty. We aim to become the default layer of guidance globally—where trust and technology converge.
            </p>
          </motion.div>
        </div>

        {/* Infrastructure */}
        <Section title="Platform Infrastructure" icon={Server}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Direct Interaction", desc: "Seamless connections between aspirants and students." },
              { label: "Structured Advisory", desc: "Frameworks for productive, one-on-one sessions." },
              { label: "Real-World Insights", desc: "Unfiltered access to academics, campus culture, and lifestyle." },
              { label: "AI-Assisted Guidance", desc: "Intelligent systems designed to simplify and personalize." }
            ].map((step, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 hover:border-[#F5A623] transition-colors group">
                <div className="text-4xl font-black text-slate-100 group-hover:text-orange-100 transition-colors mb-4 italic">0{i+1}</div>
                <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-tight">{step.label}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Core Principles */}
        <Section title="Core Principles" icon={Lightbulb}>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: "Authenticity Over Assumptions", body: "Every insight comes from someone who has actually lived it." },
              { title: "Accessibility at Scale", body: "High-quality guidance is a fundamental right, not a privilege limited to a few." },
              { title: "Structured Experience", body: "We replace randomness with a reliable, system-driven interaction model." },
              { title: "Human + AI Synergy", body: "We combine empathetic human conversations with efficiency." }
            ].map((p, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-1 h-12 bg-[#F5A623] rounded-full shrink-0" />
                <div>
                  <h4 className="text-lg font-bold text-slate-900 uppercase mb-2 tracking-tight">{p.title}</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Ecosystem & Demographics */}
        <Section title="Ecosystem & Demographics" icon={Users}>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs font-black tracking-[0.3em] uppercase text-slate-300 mb-6">Who We Serve</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { tag: "Aspirants", desc: "Students navigating complex college and career decisions." },
                  { tag: "Parents", desc: "Guardians seeking clarity, transparency, and confidence." },
                  { tag: "Advisors", desc: "Current college students contributing lived experiences." },
                  { tag: "Truth-Seekers", desc: "Anyone looking for authentic, unvarnished academic insights." }
                ].map((item) => (
                  <div key={item.tag} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex-1 min-w-[200px]">
                    <span className="block text-sm font-black uppercase tracking-widest text-slate-900 mb-2">{item.tag}</span>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black tracking-[0.3em] uppercase text-slate-300 mb-6 font-display">Trust & Credibility</h4>
              <p className="text-slate-600 font-medium mb-6 text-sm">We are committed to building a high-trust platform. Every interaction is designed to add measurable value, enforced through:</p>
              <div className="space-y-4">
                {[
                  "Strictly verified student profiles.",
                  "Transparent interaction histories.",
                  "Structured, closed-loop feedback systems.",
                  "Continuous, data-driven quality improvement."
                ].map((p, i) => (
                  <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-white border border-slate-100 group hover:border-[#F5A623] transition-colors">
                    <CheckCircle2 className="text-[#F5A623]" size={16} />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}