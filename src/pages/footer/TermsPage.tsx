import React from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Scale, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  CreditCard,
  UserCheck,
  Zap
} from "lucide-react";

const sections = [
  { id: "definitions", title: "1. Definitions", icon: FileText },
  { id: "eligibility", title: "2. Eligibility & Registration", icon: UserCheck },
  { id: "conduct", title: "3. Session Conduct", icon: ShieldCheck },
  { id: "timing", title: "4. Timing & Rescheduling", icon: Clock },
  { id: "prohibitions", title: "5. Strict Prohibitions", icon: AlertTriangle },
  { id: "payment", title: "6. Payment & Monetization", icon: CreditCard },
  { id: "reporting", title: "7. Disputes", icon: Zap },
];

export default function TermsPage() {
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
              <Scale size={14} className="text-[#F5A623]" />
              Legal Framework
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">
              Terms & <span className="text-[#F5A623]">Conditions</span>
            </h1>
            <div className="flex items-center gap-4 text-slate-400 font-bold text-sm tracking-widest uppercase">
              <Clock size={16} /> Last Updated: March 25, 2026
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-16 relative">
        
        {/* Sidebar Index */}
        <aside className="md:w-64 shrink-0 hidden md:block">
          <div className="sticky top-32 space-y-2">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-300 mb-6">Document Index</h4>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-3 group"
              >
                <s.icon size={14} className="group-hover:text-[#F5A623]" />
                {s.title.split('. ')[1]}
              </button>
            ))}
          </div>
        </aside>

        {/* Legal Text Content */}
        <div className="flex-1 max-w-3xl">
          <div className="prose-custom">
            <div className="p-8 rounded-[2rem] bg-orange-50 border border-orange-100 mb-16 flex gap-6 italic">
              <AlertTriangle className="text-[#F5A623] shrink-0" size={24} />
              <p className="text-sm text-slate-800 font-bold leading-relaxed">
                IMPORTANT NOTICE: VIOLATING THESE TERMS AND CONDITIONS CONSTITUTES A CHARGEABLE OFFENSE AND MAY LEAD TO IMMEDIATE TERMINATION OF SERVICE, FINANCIAL PENALTIES, AND FORMAL LEGAL ACTIONS.
              </p>
            </div>

            <p className="text-lg text-slate-600 font-medium mb-12 leading-relaxed">
              Welcome to <strong>CollegeConnect</strong>. These Terms and Conditions ("Terms") constitute a legally binding agreement between you and CollegeConnect regarding your access to and use of our platform, including our website and all related services.
            </p>

            {/* Definitions Section */}
            <section id="definitions" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">1. Definitions</h2>
              <div className="space-y-6">
                {[
                  { k: "Platform", v: "Refers to the CollegeConnect student-to-student connection interface and all associated technologies." },
                  { k: "Enquirer", v: "Refers to students or parents seeking authentic information regarding educational institutions." },
                  { k: "Advisor", v: "Refers to current undergraduate students verified by the Platform to provide personal insights and experiences." },
                  { k: "Session", v: "Refers to the 1:1 video or audio interaction facilitated through the Platform." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="font-black text-[#F5A623] uppercase text-xs tracking-widest min-w-[100px]">{item.k}</div>
                    <div className="text-slate-600 font-medium text-sm leading-relaxed">{item.v}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Eligibility & Account Registration */}
            <section id="eligibility" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">2. Eligibility and Account Registration</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="text-[#F5A623] font-black italic">●</span>
                  <span className="text-slate-600 font-medium leading-relaxed"><strong>Account Accuracy:</strong> All users must provide accurate, current, and complete information during registration.</span>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#F5A623] font-black italic">●</span>
                  <span className="text-slate-600 font-medium leading-relaxed"><strong>Advisor Verification:</strong> Advisors must submit valid college ID cards. We collect this strictly to ensure genuine student participation.</span>
                </li>
                <li className="flex gap-4 p-6 rounded-2xl bg-slate-900 text-white italic">
                   <ShieldCheck className="shrink-0 text-[#F5A623]" size={20} />
                   <span className="text-sm font-bold">Data Security: ID data is stored securely and is never shared with third parties or other users.</span>
                </li>
              </ul>
            </section>

            {/* Session Attendance and Conduct */}
            <section id="conduct" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">3. Session Attendance and Conduct</h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Only the verified Advisor whose ID was approved is permitted to attend the Session. Substituting the Advisor is a material breach.
              </p>
              <div className="p-8 rounded-3xl bg-red-50 border border-red-100 text-red-700 font-bold text-sm mb-6 uppercase tracking-tight">
                Attendance of unauthorized third parties is strictly prohibited and constitutes a violation.
              </div>
            </section>

            {/* Timing and Rescheduling */}
            <section id="timing" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">4. Session Timing and Rescheduling</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">For Enquirers</h4>
                  <p className="text-sm text-slate-600 font-medium">15-minute tardiness leads to cancellation. Rescheduling is only permitted if the Advisor explicitly accepts.</p>
                </div>
                <div className="p-6 rounded-x2 border border-[#F5A623] bg-orange-50/30">
                  <h4 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest text-[#F5A623]">For Advisors</h4>
                  <p className="text-sm text-slate-800 font-bold italic">Failure to join requires rescheduling with a 20-minute extra time penalty provided to the student.</p>
                </div>
              </div>
            </section>

            {/* Strict Prohibitions */}
            <section id="prohibitions" className="mb-20">
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">5. Strict Prohibitions and Penalties</h2>
               <div className="space-y-4">
                 {[
                   "No sharing of personal contact details (phone, email, social media).",
                   "Charging fine of ₹20,000 for contact information sharing attempts.",
                   "Recording of sessions (audio or video) is strictly prohibited.",
                   "All communication must happen through CollegeConnect secure tools."
                 ].map((p, i) => (
                   <div key={i} className="flex gap-4 items-center p-4 rounded-xl hover:bg-slate-50 transition-colors">
                     <AlertTriangle className="text-red-500" size={16} />
                     <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">{p}</span>
                   </div>
                 ))}
               </div>
            </section>

            {/* Payment and Monetization */}
            <section id="payment" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">6. Payment and Monetization</h2>
              <ul className="space-y-6">
                {[
                  { k: "Session Pricing", v: "The Platform follows a \"pay-per-session\" model. The Enquirer pays the specific amount designated by the Advisor for every Session attended." },
                  { k: "Advisor Earnings", v: "The Advisor will receive their designated payment only after the successful completion of the Session." },
                  { k: "Disbursement", v: "Funds earned by the Advisor will be credited to their registered account within 24 to 48 hours following the completion of the Session." },
                  { k: "Platform Fees", v: "CollegeConnect charges a service fee on each transaction to maintain and operate the digital infrastructure." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-[#F5A623] font-black italic">●</span>
                    <span className="text-slate-600 font-medium leading-relaxed"><strong>{item.k}:</strong> {item.v}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Reporting and Dispute Resolution */}
            <section id="reporting" className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">7. Reporting and Dispute Resolution</h2>
              <ul className="space-y-6">
                {[
                  "Reporting System: Users have access to a \"Report\" tool for genuine grievances.",
                  "Misuse of Reporting: Misusing the report option with false or malicious data is prohibited and may lead to account suspension.",
                  "Finality of Decisions: CollegeConnect reserves the right to mediate disputes regarding session attendance and technical failures."
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span className="text-slate-600 font-medium leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Technology and Data Privacy */}
            <section className="mb-20 p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 italic">8. Technology and Data Privacy</h2>
              <div className="space-y-4 text-sm text-slate-600 font-medium">
                <p>● <strong>Infrastructure:</strong> The Platform utilizes React for the frontend, Node.js for the backend, MongoDB for data management, and Firebase for secure authentication.</p>
                <p>● <strong>Security Measures:</strong> We employ robust security via Firebase and secure hosting. However, the Platform is not liable for unauthorized access resulting from user negligence.</p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">9. Limitation of Liability</h2>
              <div className="space-y-6">
                {[
                  "Information Accuracy: While Advisors are verified, CollegeConnect does not guarantee the absolute accuracy or quality of the opinions shared.",
                  "Advisor Risk: All reviews and information provided by the Advisor are given at their own risk.",
                  "Legal Indemnity: CollegeConnect acts strictly as a facilitator. The Platform shall not be held legally responsible for the specific reviews, advice, or claims made by an Advisor to a student.",
                  "Decision Making: CollegeConnect is not liable for any educational, personal, or financial decisions made by users based on Advisor interactions."
                ].map((text, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide bg-white">
                    {text}
                  </div>
                ))}
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-20">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">10. Intellectual Property</h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-4">● <strong>Ownership:</strong> The CollegeConnect name, logo, and all content generated by the Platform are the exclusive property of the startup.</p>
              <p className="text-slate-600 font-medium leading-relaxed text-red-500 font-bold">● <strong>Restrictions:</strong> Users may not reproduce, record, or redistribute Platform content without prior written consent.</p>
            </section>

            {/* Termination and Modifications */}
            <section id="termination" className="mb-20 border-t border-slate-100 pt-20">
               <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">11. Termination and Modifications</h2>
               <div className="space-y-6">
                 <p className="text-slate-600 font-medium leading-relaxed">● <strong>Right to Terminate:</strong> CollegeConnect reserves the right to immediately suspend or terminate any account that violates these Terms, engages in commercialized bias, or misuses the rating system.</p>
                 <p className="text-slate-600 font-medium leading-relaxed bg-red-50 p-4 rounded-xl text-red-600 font-bold italic">● <strong>Legal Action:</strong> Misuse of the Platform by students or advisors is a chargeable offense and will be met with the full extent of legal and administrative actions available.</p>
                 <p className="text-slate-600 font-medium leading-relaxed">● <strong>Updates to Terms:</strong> We reserve the right to modify these Terms at any time. Continued use of the Platform after changes are posted constitutes acceptance of the updated Terms.</p>
               </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}