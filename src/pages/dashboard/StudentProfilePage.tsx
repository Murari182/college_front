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
    <div className="relative min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6">
      {/* Atmosphere Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="orb-1 absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-200 blur-[140px]" />
        <div className="orb-2 absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-navy/5 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-dashboard rounded-[3rem] p-8 sm:p-12">
          
          {/* Header Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 mb-12 border-b border-slate-100 pb-12">
             <div className="shrink-0 relative">
               <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-4 border-white shadow-xl">
                 <span className="text-4xl font-display font-bold text-slate-800">
                    {student?.name?.split(" ").map(n => n[0]).slice(0, 2).join("")}
                 </span>
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center shadow-lg border-4 border-white">
                 <CheckCircle size={18} strokeWidth={3} />
               </div>
             </div>

             <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <span className="stat-badge bg-slate-900 text-white">STUDENT VERIFIED</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Member Since {new Date(student?.created_at || '').getFullYear()}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-2 tracking-tight">{student?.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-medium text-slate-500">
                   <div className="flex items-center gap-1.5"><Mail size={14} /> {student?.email}</div>
                   <div className="flex items-center gap-1.5"><MapPin size={14} /> {student?.state || 'Location not set'}</div>
                </div>
             </div>
             
             {!isEditing && (
               <button onClick={() => setIsEditing(true)} className="dashboard-tab-btn bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200">
                 <Edit3 size={16} /> Edit Profile
               </button>
             )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Booked Sessions", v: student?.total_sessions || 0, icon: Monitor, color: "text-navy", bg: "bg-navy-light" },
              { label: "Total Investment", v: `₹${student?.total_spent || 0}`, icon: IndianRupee, color: "text-slate-900", bg: "bg-slate-50" },
              { label: "Referral Balance", v: `₹${referralSummary?.referral_rewards_inr || 0}`, icon: Gift, color: "text-navy", bg: "bg-navy-light" },
            ].map(s => (
              <div key={s.label} className="p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-navy/20 transition-all group">
                 <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} mb-4 group-hover:scale-110 transition-transform`}>
                   <s.icon size={24} strokeWidth={2.5} />
                 </div>
                 <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400 mb-1">{s.label}</p>
                 <p className="text-2xl font-display font-bold text-slate-900">{s.v}</p>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-navy rounded-full" />
              <h3 className="text-2xl font-display font-bold text-slate-900">Academic Snapshot</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                { label: "Full Name", key: "name", type: "text", icon: User },
                { label: "Mobile Number", key: "phone", type: "tel", icon: Phone },
                { label: "Current State", key: "state", type: "text", icon: MapPin },
                { label: "Academic Level", key: "academic_status", type: "text", icon: GraduationCap },
                { label: "JEE Mains %ile", key: "jee_mains_percentile", type: "text", icon: Trophy },
                { label: "JEE Mains Rank", key: "jee_mains_rank", type: "text", icon: Trophy },
                { label: "JEE Advanced Rank", key: "jee_advanced_rank", type: "text", icon: Trophy },
              ].map((f) => (
                <div key={f.key} className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                    <f.icon size={12} strokeWidth={2.5} />
                    {f.label}
                  </label>
                  {isEditing ? (
                    <input
                      type={f.type}
                      value={editForm[f.key as keyof typeof editForm]}
                      onChange={(e) => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-navy/30 outline-none transition-all placeholder:text-slate-300"
                    />
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700">
                       {editForm[f.key as keyof typeof editForm] || "Not provided"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence>
               {isEditing && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex gap-4 pt-8">
                   <button onClick={handleSave} disabled={saving} className="flex-1 bg-slate-900 text-white font-display font-bold h-14 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                     {saving ? <Loader size={20} className="animate-spin" /> : <><CheckCircle size={20} /> Deploy Changes</>}
                   </button>
                   <button onClick={() => setIsEditing(false)} disabled={saving} className="px-8 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-display font-bold h-14 rounded-2xl transition-all">
                     Discard
                   </button>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* Danger Zone */}
            <div className="pt-12 mt-12 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-6 bg-red-500 rounded-full" />
                <h3 className="text-2xl font-display font-bold text-slate-900">Danger Zone</h3>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-[2rem] p-8 flex flex-col sm:flex-row gap-6 items-center justify-between">
                <div>
                  <h4 className="text-red-900 font-bold mb-1 flex items-center gap-2">
                    <AlertTriangle size={18} /> Delete Account Permanently
                  </h4>
                  <p className="text-sm text-red-700 font-medium">
                    This action cannot be undone. All your bookings, history, and profile data will be permanently wiped.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-6 py-3 bg-white text-red-600 hover:bg-red-600 hover:text-white border border-red-200 font-bold rounded-xl transition-all whitespace-nowrap shadow-sm">
                      Delete Account
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-[2rem] bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-display font-bold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-600 text-sm font-medium">
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        <div className="mt-4">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                            Type "confirm" to verify
                          </label>
                          <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="confirm"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
                      <AlertDialogCancel 
                        onClick={() => setDeleteConfirmText("")} 
                        className="rounded-xl h-12 font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText.toLowerCase() !== "confirm" || deleting}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white h-12 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
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
