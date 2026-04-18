import { useState, useEffect } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyAdvisorProfile,
  updateMyAdvisorProfile,
  uploadCollegeIdPairToS3,
  type AdvisorProfileResponse,
} from "@/lib/restApi";
import { computeEffectiveStudyYear, formatStudyYearLabel } from "@/lib/advisorStudyYear";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { User, IndianRupee, Star, TrendingUp, Users, Loader, CheckCircle, AlertTriangle, Upload, X, ShieldCheck, Mail, Phone, MapPin, GraduationCap, Clock, Camera, Target, Award, Languages, UserCircle, ChevronDown, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ADVISOR_PRICE_OPTIONS = ["99", "149", "199", "249", "299", "399", "499", "599", "999"];

export default function AdvisorProfilePage() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    branch: "",
    phone: "",
    state: "",
    bio: "",
    session_price: "",
    current_study_year: "",
    jee_mains_percentile: "",
    jee_mains_rank: "",
    jee_advanced_rank: "",
    personal_email: "",
    gender: "",
    languages: "",
  });
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        fetchProfile(user);
      } else {
        navigate({ to: "/auth/signin" });
      }
    });
  }, [navigate]);

  const fetchProfile = async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();
      const prof = await getMyAdvisorProfile(token);
      setAdvisor(prof);
      setEditForm({
        name: prof.name || "",
        branch: prof.branch || "",
        phone: prof.phone || "",
        state: prof.state || "",
        bio: prof.bio || "",
        session_price: prof.session_price || "",
        current_study_year: prof.current_study_year?.toString() || "",
        jee_mains_percentile: prof.jee_mains_percentile || "",
        jee_mains_rank: prof.jee_mains_rank || "",
        jee_advanced_rank: prof.jee_advanced_rank || "",
        personal_email: prof.personal_email || "",
        gender: prof.gender || "",
        languages: prof.languages?.join(", ") || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser || !advisor) return;
    setSaving(true);
    try {
      const token = await authUser.getIdToken();
      let payload: any = { 
        ...editForm,
        languages: editForm.languages.split(",").map(l => l.trim()).filter(l => !!l)
      };
      
      if (frontFile && backFile) {
        const { frontKey, backKey } = await uploadCollegeIdPairToS3(token, frontFile, backFile);
        payload.college_id_front_key = frontKey;
        payload.college_id_back_key = backKey;
      }

      const updated = await updateMyAdvisorProfile(token, payload);
      setAdvisor(updated);
      setIsEditing(false);
      setFrontFile(null);
      setBackFile(null);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="animate-spin text-slate-900" size={32} />
      </div>
    );
  }

  const effectiveYear = advisor ? computeEffectiveStudyYear(advisor) : 1;

  return (
    <div className="relative min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="orb-1 absolute top-[-5%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-200 blur-[140px]" />
        <div className="orb-2 absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#F5A623]/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="glass-dashboard rounded-[3rem] p-8 sm:p-12">
          
          {/* Header Profile */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-10 mb-12 border-b border-slate-100 pb-12">
            <div className="shrink-0 relative">
               <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden group">
                 <span className="text-5xl font-display font-bold text-slate-800">
                    {advisor?.name?.split(" ").map(n => n[0]).slice(0, 2).join("")}
                 </span>
                 <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white" />
                 </div>
               </div>
               {advisor?.college_id_front_key && (
                 <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg">
                   <ShieldCheck size={20} />
                 </div>
               )}
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
               <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
                 <span className={`stat-badge ${advisor?.college_id_front_key ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'} border px-3 py-1 flex items-center gap-1`}>
                    {advisor?.college_id_front_key ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                    {advisor?.college_id_front_key ? 'IDENTITY VERIFIED' : 'ACTION REQUIRED'}
                 </span>
                 <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Expert Advisor Since 2024</span>
               </div>
               <h1 className="text-4xl font-display font-bold text-slate-900 mb-3 tracking-tight truncate">{advisor?.name}</h1>
               <p className="text-lg font-medium text-slate-500 mb-4">{advisor?.detected_college} • <span className="text-slate-900">{advisor?.branch}</span></p>
               <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Mail size={14} className="text-[#F5A623]" /> {authUser?.email?.split('@')[0]}</span>
                  <span className="flex items-center gap-1.5 font-display text-slate-700">{formatStudyYearLabel(effectiveYear)} Student</span>
               </div>
            </div>

            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="dashboard-tab-btn bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800">
                <Edit3 size={16} /> Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column: Basic Details */}
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#F5A623] rounded-full" />
                <h3 className="text-2xl font-display font-bold text-slate-900">Personal & Academic</h3>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-5">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Identity & Contact</p>
                   {[
                    { label: "Full Name", key: "name", type: "text", icon: User },
                    { label: "Gender", key: "gender", type: "text", icon: UserCircle },
                    { label: "Personal Email", key: "personal_email", type: "email", icon: Mail },
                    { label: "Phone Number", key: "phone", type: "tel", icon: Phone },
                    { label: "Current State", key: "state", type: "text", icon: MapPin },
                  ].map(field => (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <field.icon size={11} strokeWidth={2.5} />
                         {field.label}
                      </label>
                      {isEditing ? (
                        <input 
                          value={editForm[field.key as keyof typeof editForm]} 
                          onChange={e => setEditForm(p => ({...p, [field.key]: e.target.value}))}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-[#F5A623]/30 outline-none transition-all"
                        />
                      ) : (
                        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700">
                          {editForm[field.key as keyof typeof editForm] || "Not provided"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-5 pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Academic Merit</p>
                   {[
                    { label: "JEE Mains Percentile", key: "jee_mains_percentile", type: "text", icon: Target },
                    { label: "JEE Mains Rank", key: "jee_mains_rank", type: "text", icon: Award },
                    { label: "JEE Advanced Rank", key: "jee_advanced_rank", type: "text", icon: Star },
                  ].map(field => (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <field.icon size={11} strokeWidth={2.5} />
                         {field.label}
                      </label>
                      {isEditing ? (
                        <input 
                          value={editForm[field.key as keyof typeof editForm]} 
                          onChange={e => setEditForm(p => ({...p, [field.key]: e.target.value}))}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:border-[#F5A623]/30 outline-none transition-all"
                        />
                      ) : (
                        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700">
                          {editForm[field.key as keyof typeof editForm] || "Not provided"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-slate-900 rounded-full" />
                <h3 className="text-2xl font-display font-bold text-slate-900">Mentorship Profile</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <GraduationCap size={12} strokeWidth={2.5} />
                     Focus Branch
                  </label>
                  {isEditing ? (
                    <input 
                      value={editForm.branch} 
                      onChange={e => setEditForm(p => ({...p, branch: e.target.value}))}
                      className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-slate-900/10 outline-none transition-all"
                    />
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700">
                      {editForm.branch || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <Languages size={12} strokeWidth={2.5} />
                     Languages (comma separated)
                  </label>
                  {isEditing ? (
                    <input 
                      value={editForm.languages} 
                      onChange={e => setEditForm(p => ({...p, languages: e.target.value}))}
                      placeholder="English, Hindi, Telugu..."
                      className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-slate-900/10 outline-none transition-all"
                    />
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700">
                      {editForm.languages || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <IndianRupee size={12} strokeWidth={2.5} />
                     Session Hourly Rate
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={editForm.session_price}
                        onChange={e => setEditForm(p => ({...p, session_price: e.target.value}))}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:bg-white focus:border-[#F5A623]/30 appearance-none cursor-pointer"
                      >
                        {ADVISOR_PRICE_OPTIONS.map(price => (
                          <option key={price} value={price}>₹{price} / 60 Minute Session</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#F5A623] flex justify-between items-center">
                      <span>₹{advisor?.session_price || "0"} <span className="text-slate-400 font-medium">per hour</span></span>
                      <IndianRupee size={14} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <Clock size={12} strokeWidth={2.5} />
                     Professional Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm(p => ({...p, bio: e.target.value}))}
                      rows={4}
                      className="bg-slate-50 border border-slate-100 rounded-3xl px-6 py-5 text-sm font-medium outline-none focus:bg-white focus:border-slate-900/10 transition-all resize-none leading-relaxed"
                      placeholder="Showcase your experience..."
                    />
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-3xl px-6 py-5 text-sm text-slate-500 font-medium leading-relaxed italic">
                      "{editForm.bio || "No professional bio provided yet. Your bio helps students understand your expertise."}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Identity Verification Section - Redesigned as a featured card */}
          <div className="mt-16 pt-12 border-t border-slate-100">
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-8 flex items-center gap-3">
               <ShieldCheck size={28} className="text-[#F5A623]" /> Identity Documents
            </h3>
            
            {!advisor?.college_id_front_key ? (
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sm:p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/10 blur-[90px] rounded-full -mr-32 -mt-32" />
                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Upload size={32} className="text-[#F5A623]" />
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                  <p className="text-2xl font-display font-bold mb-2">Verification Required</p>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    To maintain trust, all advisors must upload their official college ID. This is not shared publicly.
                  </p>
                </div>
                
                {isEditing ? (
                  <div className="flex gap-4 relative z-10">
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl border border-dashed border-white/20 transition-all flex flex-col items-center gap-1">
                      <Camera size={20} className={frontFile ? "text-emerald-400" : "text-slate-300"} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">{frontFile ? "Front Ready" : "Front Side"}</span>
                      <input type="file" className="hidden" onChange={e => setFrontFile(e.target.files?.[0] || null)} />
                    </label>
                    <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl border border-dashed border-white/20 transition-all flex flex-col items-center gap-1">
                      <Camera size={20} className={backFile ? "text-emerald-400" : "text-slate-300"} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">{backFile ? "Back Ready" : "Back Side"}</span>
                      <input type="file" className="hidden" onChange={e => setBackFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-[#F5A623] text-slate-900 px-8 py-4 rounded-2xl text-sm font-bold shadow-xl shadow-[#F5A623]/20 hover:scale-105 transition-transform">Complete Setup</button>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-10 flex items-center gap-8 shadow-sm">
                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-slate-900">Expert Identification Secure</p>
                  <p className="text-slate-500 font-medium mt-1">Your documents are active and verified. You're fully authorized to provide guidance.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 flex gap-4">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex gap-4 w-full">
                  <button onClick={handleSave} disabled={saving} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold h-16 rounded-2xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2">
                    {saving ? <Loader size={20} className="animate-spin" /> : <><CheckCircle size={20} /> Update Professional Profile</>}
                  </button>
                  <button onClick={() => { setIsEditing(false); setFrontFile(null); setBackFile(null); }} disabled={saving} className="px-10 bg-white border border-slate-200 text-slate-400 font-display font-bold h-16 rounded-2xl hover:bg-slate-50">
                    Discard
                  </button>
                </motion.div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="w-full bg-slate-50 border-2 border-slate-100 text-slate-600 hover:bg-white hover:border-[#F5A623]/30 font-display font-bold h-16 rounded-[2rem] transition-all flex items-center justify-center gap-2">
                   Edit Profile & Settings
                </button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
