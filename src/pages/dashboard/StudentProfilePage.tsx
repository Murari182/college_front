import { useState, useEffect } from "react";
import {
  getMyStudentProfile,
  getStudentReferralSummary,
  type StudentProfileResponse,
  type ReferralSummaryResponse,
  updateMyStudentProfile,
  getSessionAccessToken,
  clearStoredAuthSession,
} from "@/lib/restApi";
import { useNavigate } from "@tanstack/react-router";
import { User, Monitor, IndianRupee, Gift, Loader, CheckCircle, MapPin, GraduationCap, Trophy, Mail, Phone, Edit3, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMyStudentProfile } from "@/lib/restApi";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useToast } from "@/components/ui/toast";

export default function StudentProfilePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileResponse | null>(null);
  const [referralSummary, setReferralSummary] = useState<ReferralSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    state: "",
    academic_status: "",
    jee_mains_percentile: "",
    jee_mains_rank: "",
    jee_advanced_rank: "",
  });

  useEffect(() => {
    const token = getSessionAccessToken();
    if (!token) {
      navigate({ to: "/auth/signin" });
      return;
    }
    void fetchProfile(token);
  }, [navigate]);

  const fetchProfile = async (token: string) => {
    try {
      const storedRole = localStorage.getItem("user_role");
      if (storedRole && storedRole !== "student") {
        navigate({ to: "/advisor/dashboard" });
        return;
      }

      const [prof, ref] = await Promise.all([
        getMyStudentProfile(token),
        getStudentReferralSummary(token),
      ]);
      setStudent(prof);
      setReferralSummary(ref);
      setEditForm({
        name: prof.name || "",
        phone: prof.phone || "",
        state: prof.state || "",
        academic_status: prof.academic_status || "",
        jee_mains_percentile: prof.jee_mains_percentile || "",
        jee_mains_rank: prof.jee_mains_rank || "",
        jee_advanced_rank: prof.jee_advanced_rank || "",
      });
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Access Denied";
      if (err.status === 403 || (msg && msg.includes("403"))) {
        toast.error(msg);
        if (!msg.includes("Dual-role")) {
           navigate({ to: "/advisor/dashboard" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    try {
      const token = getSessionAccessToken();
      if (!token) return;
      const updated = await updateMyStudentProfile(token, editForm);
      setStudent(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "confirm") return;
    setDeleting(true);
    try {
      const token = getSessionAccessToken();
      if (!token) return;
      await deleteMyStudentProfile(token);
      clearStoredAuthSession();
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="animate-spin text-slate-900" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] selection:bg-navy/10 selection:text-navy overflow-hidden">
      {/* ── Immersive Background ── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-navy/5 via-blue-400/5 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-emerald-400/5 via-teal-400/5 to-transparent blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-tr from-mango/5 to-transparent blur-[80px]" />
        
        {/* Texture & Grids */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `radial-gradient(#1E3A8A 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }} />
      </div>

      <div className="pt-32 pb-24 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/70 backdrop-blur-3xl border border-white/50 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden"
        >
          {/* Header Profile Section */}
          <div className="relative p-8 sm:p-12 pb-16 bg-gradient-to-b from-white/50 to-transparent">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
              <div className="shrink-0 relative">
                <motion.div 
                   whileHover={{ scale: 1.05, rotate: 2 }}
                   className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center border-8 border-white shadow-2xl relative overflow-hidden group cursor-pointer"
                >
                  <span className="text-5xl font-black text-slate-800 drop-shadow-sm">
                    {student?.name?.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </span>
                  <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/5 transition-colors" />
                </motion.div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center shadow-xl border-4 border-white"
                >
                  <CheckCircle size={22} strokeWidth={3} />
                </motion.div>
              </div>

              <div className="text-center md:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10">STUDENT VERIFIED</span>
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase opacity-70">Member Since {new Date(student?.created_at || '').getFullYear()}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{student?.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-slate-500">
                  <div className="flex items-center gap-2 group cursor-pointer hover:text-navy transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-navy/5 transition-colors">
                      <Mail size={14} className="text-navy" />
                    </div>
                    {student?.email}
                  </div>
                  <div className="flex items-center gap-2 group cursor-pointer hover:text-navy transition-colors">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-navy/5 transition-colors">
                      <MapPin size={14} className="text-navy" />
                    </div>
                    {student?.state || 'Location not set'}
                  </div>
                </div>
              </div>
              
              {!isEditing && (
                <motion.button 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)} 
                  className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-navy hover:border-navy/30 hover:shadow-xl hover:shadow-navy/5 transition-all flex items-center gap-3 font-black text-sm shadow-sm"
                >
                  <Edit3 size={18} strokeWidth={2.5} /> EDIT PROFILE
                </motion.button>
              )}
            </div>
          </div>

          <div className="p-8 sm:p-12 pt-0">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              {[
                { label: "Booked Sessions", v: student?.total_sessions || 0, icon: Monitor, color: "text-navy", bg: "bg-navy-light", shadow: "hover:shadow-navy/10" },
                { label: "Total Investment", v: `₹${student?.total_spent || 0}`, icon: IndianRupee, color: "text-slate-900", bg: "bg-slate-50", shadow: "hover:shadow-slate-200/50" },
                { label: "Referral Balance", v: `₹${referralSummary?.referral_rewards_inr || 0}`, icon: Gift, color: "text-navy", bg: "bg-navy-light", shadow: "hover:shadow-navy/10" },
              ].map((s, i) => (
                <motion.div 
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`relative p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-navy/20 transition-all group ${s.shadow} hover:shadow-2xl cursor-default`}
                >
                   <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                     <s.icon size={28} strokeWidth={2.5} />
                   </div>
                   <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-300 mb-2">{s.label}</p>
                   <p className="text-3xl font-black text-slate-900">{s.v}</p>
                </motion.div>
              ))}
            </div>

            {/* Academic Snapshot Section */}
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-navy rounded-full shadow-[0_0_15px_-2px_rgba(30,58,138,0.3)]" />
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Academic Snapshot</h3>
                </div>
                <div className="hidden sm:block h-[1px] flex-1 bg-slate-100 mx-8" />
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-300">
                  <GraduationCap size={20} strokeWidth={2.5} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                 {[
                  { label: "Full Name", key: "name", type: "text", icon: User },
                  { label: "Mobile Number", key: "phone", type: "tel", icon: Phone },
                  { label: "Current State", key: "state", type: "text", icon: MapPin },
                  { label: "Academic Level", key: "academic_status", type: "text", icon: GraduationCap },
                  { label: "JEE Mains %ile", key: "jee_mains_percentile", type: "text", icon: Trophy, color: "text-mango-dark" },
                  { label: "JEE Mains Rank", key: "jee_mains_rank", type: "text", icon: Trophy, color: "text-navy" },
                  { label: "JEE Advanced Rank", key: "jee_advanced_rank", type: "text", icon: Trophy, color: "text-teal-600" },
                ].map((f, i) => (
                  <motion.div 
                    key={f.key}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex flex-col gap-3 group"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2 group-hover:text-navy transition-colors">
                      <f.icon size={13} strokeWidth={3} className={f.color || "text-slate-300"} />
                      {f.label}
                    </label>
                    {isEditing ? (
                      <input
                        type={f.type}
                        value={editForm[f.key as keyof typeof editForm]}
                        onChange={(e) => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-navy/40 focus:ring-4 focus:ring-navy/5 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                      />
                    ) : (
                      <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-black text-slate-800 shadow-sm group-hover:shadow-md transition-shadow">
                         {editForm[f.key as keyof typeof editForm] || <span className="text-slate-300 italic font-medium">Not provided</span>}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                 {isEditing && (
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 20 }} 
                    className="flex flex-col sm:flex-row gap-4 pt-12"
                   >
                     <motion.button 
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave} 
                        disabled={saving} 
                        className="flex-1 bg-slate-900 text-white font-black h-16 rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                     >
                       {saving ? <Loader size={20} className="animate-spin" /> : <><CheckCircle size={20} strokeWidth={3} /> Save Profile Changes</>}
                     </motion.button>
                     <button 
                        onClick={() => setIsEditing(false)} 
                        disabled={saving} 
                        className="px-10 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-black h-16 rounded-2xl transition-all uppercase tracking-widest text-xs"
                     >
                       Discard
                     </button>
                   </motion.div>
                 )}
              </AnimatePresence>

              {/* Danger Zone */}
              <div className="pt-20 mt-12 border-t border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-2 h-8 bg-red-500 rounded-full shadow-[0_0_15px_-2px_rgba(239,68,68,0.3)]" />
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Danger Zone</h3>
                </div>
                
                <div className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-8 sm:p-10 flex flex-col lg:flex-row gap-8 items-center justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="relative z-10 text-center lg:text-left">
                    <h4 className="text-red-900 font-black text-xl mb-3 flex items-center justify-center lg:justify-start gap-2">
                      <AlertTriangle size={24} className="text-red-600" /> PERMANENT ACCOUNT DELETION
                    </h4>
                    <p className="text-sm text-red-700/70 font-bold max-w-lg leading-relaxed">
                      This action will immediately and irreversibly wipe your profile, booking history, and all account data. Your email will be freed for re-registration.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.button 
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative z-10 px-8 h-14 bg-white text-red-600 hover:bg-red-600 hover:text-white border border-red-200 font-black rounded-2xl transition-all shadow-sm hover:shadow-xl hover:shadow-red-600/10 uppercase tracking-widest text-[11px]"
                      >
                        Delete Account
                      </motion.button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[3rem] bg-white border-none shadow-2xl p-10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-sm font-bold leading-relaxed mt-4">
                          Account deletion is permanent. All your data will be removed from our servers. 
                          <br/><br/>
                          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                            <label className="text-[10px] font-black text-red-900 uppercase tracking-[0.2em] mb-3 block">
                              Type "confirm" to verify deletion
                            </label>
                            <input
                              type="text"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder="confirm"
                              className="w-full bg-white border border-red-200 rounded-xl px-5 py-4 text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-50 outline-none transition-all"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-10 gap-4">
                        <AlertDialogCancel 
                          onClick={() => setDeleteConfirmText("")} 
                          className="rounded-2xl h-14 px-8 font-black text-slate-400 border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest text-[11px]"
                        >
                          Keep Account
                        </AlertDialogCancel>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText.toLowerCase() !== "confirm" || deleting}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white h-14 px-8 rounded-2xl font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] shadow-xl shadow-red-600/20"
                        >
                          {deleting ? <Loader size={18} className="animate-spin" /> : "Delete Permanently"}
                        </button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
}
