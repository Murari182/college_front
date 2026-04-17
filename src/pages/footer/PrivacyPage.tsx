import React from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Shield, 
  Clock, 
  Database, 
  Eye, 
  Share2, 
  History, 
  UserCircle, 
  Lock,
  Mail
} from "lucide-react";

const sections = [
  { id: "collection", title: "1. Data Collection", icon: Database },
  { id: "usage", title: "2. How We Use Data", icon: Eye },
  { id: "sharing", title: "3. Sharing Policy", icon: Share2 },
  { id: "retention", title: "4. Data Retention", icon: History },
  { id: "rights", title: "5. Your Rights", icon: UserCircle },
  { id: "security", title: "6. Security Measures", icon: Lock },
  { id: "contact", title: "7. Contact Us", icon: Mail },
];

export default function PrivacyPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-40 pb-20 px-6 relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-slate-200 bg-white inline-flex text-xs font-bold tracking-widest text-slate-500 uppercase">
              <Shield size={14} className="text-emerald-500" />
              Privacy Protection
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">
              Privacy <span className="text-emerald-500">Policy</span>
            </h1>
            <div className="flex items-center gap-4 text-slate-400 font-bold text-sm tracking-widest uppercase">
              <Clock size={16} /> Last Updated: April 01, 2026
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-16 relative">
        
        {/* Sidebar Index */}
        <aside className="md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-32 space-y-2">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-300 mb-6">Policy Index</h4>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-3 group"
              >
                <s.icon size={14} className="group-hover:text-emerald-500" />
                {s.title.split('. ')[1]}
              </button>
            ))}
          </div>
        </aside>

        {/* Legal Text Content */}
        <div className="flex-1 max-w-3xl">
          <div className="prose-custom">
            <p className="text-lg text-slate-600 font-medium mb-16 leading-relaxed">
              We are committed to protecting your privacy and ensuring transparency regarding how your personal information is collected, used, and safeguarded. This policy explains our data handling practices.
            </p>

            {/* Information We Collect */}
            <section id="collection" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">1. Information We Collect</h2>
              <div className="space-y-8">
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F5A623] mb-4">A. Personal Information</h4>
                   <p className="text-sm text-slate-600 font-medium mb-2 italic">Full name, Email address, Phone number, Profile details (college, branch, academic year, bio, preferences), and Profile images.</p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F5A623] mb-4">B. Account and Authentication Data</h4>
                   <p className="text-sm text-slate-600 font-medium mb-2 italic">Login credentials via email-based systems and verification-related information.</p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F5A623] mb-4">C. Usage Information</h4>
                   <p className="text-sm text-slate-600 font-medium mb-2 italic">Platform interactions (pages visited, features used), booking activity, session history, and preferences.</p>
                </div>
                <div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-[#F5A623] mb-4">D. Communication Data</h4>
                   <p className="text-sm text-slate-600 font-medium mb-2 italic">Information shared with support, queries submitted, and responses to emails or notifications.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 italic">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">E. Payment Information</h4>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     Payments are processed through trusted third-party gateways. We do not store sensitive financial info (card numbers, CVVs). We only store transaction-related metadata for operational purposes.
                   </p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section id="usage" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">2. How We Use Your Information</h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  "Create and manage user accounts.",
                  "Facilitate connections between users.",
                  "Enable booking of advisory sessions.",
                  "Improve platform functionality.",
                  "Provide responsive customer support.",
                  "Send notifications and reminders.",
                  "Ensure safety and prevent fraud.",
                  "Comply with legal obligations."
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-start p-4 rounded-xl border border-slate-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Sharing of Information */}
            <section id="sharing" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">3. Sharing of Information</h2>
              <div className="space-y-6">
                <div className="p-8 rounded-3xl bg-slate-900 text-white italic">
                   <p className="text-sm font-bold leading-relaxed">
                     We respect your privacy and <span className="text-emerald-400">do not sell your personal data</span>.
                   </p>
                </div>
                <div className="space-y-4">
                  {[
                    "With trusted third-party providers strictly for operations.",
                    "When required by law, regulation, or legal process.",
                    "To protect the rights and safety of our users."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest pl-4">
                      <span className="text-emerald-500">/</span> {text}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section id="retention" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">4. Data Retention</h2>
              <p className="text-sm text-slate-600 font-medium mb-6">We retain info only as long as necessary to:</p>
              <div className="flex flex-wrap gap-4 mb-8">
                {["Provide Services", "Legal Compliance", "Resolve Disputes", "Enforce Agreements"].map(t => (
                  <span key={t} className="px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-tighter">{t}</span>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">Users may request the deletion of their data at any time, subject to legal requirements.</p>
            </section>

            {/* User Rights */}
            <section id="rights" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">5. User Rights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Access your personal data.",
                  "Correct or update inaccuracies.",
                  "Request account/data deletion.",
                  "Withdraw your consent."
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest text-[#F5A623]">
                    <History size={14} />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Children's Privacy */}
            <section id="security" className="mb-20">
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8 font-display">6. Children’s Privacy</h2>
               <p className="text-sm text-slate-600 font-medium leading-relaxed italic mb-6">
                 CollegeConnect is accessible to minors; however, use by individuals under 18 must be done with consent of a parent or guardian. We do not knowingly collect data from minors without appropriate consent.
               </p>
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8 mt-16 font-display">7. Security</h2>
               <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                 We implement reasonable technical and organizational measures to protect your user data. No digital system is completely secure; we encourage personal precautions.
               </p>
            </section>

            {/* International Users */}
            <section id="international" className="mb-20 p-8 rounded-3xl border-2 border-dashed border-slate-100">
               <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">8. International Users</h2>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">
                 You understand and agree that your data may be processed and stored in jurisdictions that may have different data protection laws than your country of residence.
               </p>
            </section>

            {/* Contact Us */}
            <section id="contact" className="mt-40 pt-20 border-t border-slate-100">
               <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                   <Mail className="text-[#F5A623]" size={24} />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Questions?</h3>
                 <p className="text-slate-500 font-bold mb-8">Reach out to our Data Protection Team</p>
                 <a 
                   href="mailto:support@collegeconnects.co.in" 
                   className="text-xl font-bold text-[#F5A623] hover:underline transition-all underline-offset-8"
                 >
                   support@collegeconnects.co.in
                 </a>
               </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}