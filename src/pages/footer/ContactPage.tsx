import React from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Mail, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Send, 
  Clock,
  Instagram,
  Linkedin
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      
      {/* Header Section */}
      <div className="pt-40 pb-20 px-6 relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-slate-200 bg-white inline-flex text-xs font-bold tracking-widest text-[#F5A623] uppercase">
              <MessageSquare size={14} />
              Open Communication
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic">
              Let's <span className="text-[#F5A623]">Talk.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed">
              Have questions about becoming an advisor or using the platform? Our team typically responds within 4 business hours.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Channels Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-20">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 italic">Specialized <span className="text-[#F5A623]">Channels</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "General Support", desc: "For platform-related issues, technical problems, or account help.", email: "support@collegeconnects.co.in" },
              { label: "Session & Booking", desc: "Issues with session booking, rescheduling, payments, or refunds.", email: "sessionbooking@collegeconnects.co.in" },
              { label: "Partnerships", desc: "For college collaborations, sponsorships, or institutional tie-ups.", email: "partnership@collegeconnects.co.in" },
              { label: "Marketing", desc: "For campaigns, promotions, or influencer collaborations.", email: "marketing@collegeconnects.co.in" },
              { label: "Technical & Dev", desc: "To report bugs or suggest technical improvements.", email: "dev@collegeconnects.co.in" },
              { label: "Team & Internal", desc: "For internal or team-related communication.", email: "team@collegeconnects.co.in" }
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-[#F5A623] transition-all group">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#F5A623] mb-3">{item.label}</h4>
                <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed h-10">{item.desc}</p>
                <a 
                  href={`mailto:${item.email}`} 
                  className="text-sm font-bold text-slate-900 group-hover:text-[#F5A623] transition-colors flex items-center gap-2"
                >
                  <Mail size={14} />
                  {item.email}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Important Notice */}
          <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Clock size={100} /></div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 text-[#F5A623]">Important Notice</h3>
            <ul className="space-y-6 relative z-10">
              <li className="flex gap-4 items-start">
                <span className="text-[#F5A623] font-black italic">!</span>
                <p className="text-sm font-bold text-slate-300">Please contact only through the official email channels listed above.</p>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-[#F5A623] font-black italic">!</span>
                <p className="text-sm font-bold text-slate-300">We do not encourage sharing personal contact details outside the platform.</p>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-[#F5A623] font-black italic">!</span>
                <p className="text-sm font-bold text-slate-300">Our team typically responds within 24–48 hours.</p>
              </li>
            </ul>
          </div>

          {/* About Contact */}
          <div className="p-10 rounded-[3rem] bg-orange-50 border border-orange-100">
             <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 text-slate-900 leading-none">About CollegeConnect</h3>
             <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
               CollegeConnect is a student-to-student interaction platform designed to provide real, unbiased insights into colleges by connecting aspirants and parents directly with verified undergraduate students.
             </p>
             <div className="text-sm font-bold text-slate-900 italic">
               Our mission is to make college decision-making transparent, reliable, and stress-free.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}