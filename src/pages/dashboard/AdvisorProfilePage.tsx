import { useState, useEffect } from "react";
import {
  getMyAdvisorProfile,
  updateMyAdvisorProfile,
  uploadCollegeIdPairToS3,
  uploadProfilePictureToS3,
  type AdvisorProfileResponse,
  getSessionAccessToken,
  clearStoredAuthSession,
  deleteMyAdvisorProfile,
} from "@/lib/restApi";
import { computeEffectiveStudyYear, formatStudyYearLabel } from "@/lib/advisorStudyYear";
import { computeProfileCompletion, getCompletionBadge } from "@/lib/profileCompletion";
import { useNavigate } from "@tanstack/react-router";
import { User, IndianRupee, Star, TrendingUp, Users, Loader, CheckCircle, AlertTriangle, Upload, X, ShieldCheck, Mail, Phone, MapPin, GraduationCap, Clock, Camera, Target, Award, Languages, UserCircle, ChevronDown, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/toast";
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

const ADVISOR_PRICE_OPTIONS = ["99", "149", "199", "250", "300", "350", "400"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const STUDY_YEAR_OPTIONS = ["1", "2", "3", "4", "5", "passed_out"] as const;
const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Assamese",
  "Bengali",
  "Bodo",
  "Dogri",
  "Gujarati",
  "Kannada",
  "Kashmiri",
  "Konkani",
  "Maithili",
  "Malayalam",
  "Manipuri",
  "Marathi",
  "Nepali",
  "Odia",
  "Punjabi",
  "Sanskrit",
  "Santali",
  "Sindhi",
  "Tamil",
  "Telugu",
  "Urdu",
];
const TIME_SLOT_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const nextHour = (hour + 1) % 24;
  const formatHour = (h: number) => {
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${suffix}`;
  };
  return `${formatHour(hour)} - ${formatHour(nextHour)}`;
});

export default function AdvisorProfilePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<{ email?: string } | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

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
    languages: [] as string[],
    detected_college: "",
    college_id_acknowledged: false,
    skills: "",
    achievements: "",
    preferred_timezones: [] as string[],
    academic_status: "studying",
  });
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const token = getSessionAccessToken();
    if (!token) {
      navigate({ to: "/auth/signin" });
      return;
    }
    setAuthUser({ email: localStorage.getItem("user_email") || undefined });
    void fetchProfile(token);
  }, [navigate]);

  const fetchProfile = async (token: string) => {
    try {
      const storedRole = localStorage.getItem("user_role");
      if (storedRole && storedRole !== "advisor") {
        navigate({ to: "/student/dashboard" });
        return;
      }

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
        languages: prof.languages || [],
        detected_college: prof.detected_college || "",
        college_id_acknowledged: !!prof.college_id_front_key, 
        skills: prof.skills || "",
        achievements: prof.achievements || "",
        preferred_timezones: prof.preferred_timezones || [],
        academic_status: prof.current_study_year ? "studying" : "passed_out",
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
    if (!advisor) return;
    setSaving(true);
    try {
      const token = getSessionAccessToken();
      if (!token) return;
      if (editForm.preferred_timezones.length < 4) {
        toast.error("Please select at least 4 preferred time slots.");
        setSaving(false);
        return;
      }
      let payload: any = { 
        ...editForm,
        current_study_year:
          editForm.current_study_year === "passed_out"
            ? null
            : editForm.current_study_year
              ? Number(editForm.current_study_year)
              : null,
        academic_status:
          editForm.current_study_year === "passed_out" ? "passed_out" : "studying",
        preferred_timezones: editForm.preferred_timezones
      };
      
      if (frontFile && backFile) {
        const { frontKey, backKey } = await uploadCollegeIdPairToS3(token, frontFile, backFile);
        payload.college_id_front_key = frontKey;
        payload.college_id_back_key = backKey;
      }

      if (avatarFile) {
        const photoKey = await uploadProfilePictureToS3(token, "advisor", avatarFile);
        payload.profile_picture = photoKey;
      }

      const updated = await updateMyAdvisorProfile(token, payload);
      setAdvisor(updated);
      setIsEditing(false);
      setFrontFile(null);
      setBackFile(null);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
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
      await deleteMyAdvisorProfile(token);
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

  const effectiveYear = advisor ? computeEffectiveStudyYear(advisor) : 1;

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] selection:bg-mango/10 selection:text-mango-dark overflow-hidden">
      {/* ── Immersive Background ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#F5A623]/5 via-orange-400/5 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-navy/5 via-blue-400/5 to-transparent blur-[100px]" />
        
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
          {/* Path to Elite: Progress Visualization */}
          <div className="p-8 sm:p-12 pb-0">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-slate-900/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <TrendingUp size={12} className="text-mango" /> MENTORSHIP SUCCESS PROGRESS
                      </p>
                      <h4 className="text-2xl sm:text-3xl font-black text-white flex flex-wrap items-center gap-3 tracking-tight">
                         Path to <span className={`${getCompletionBadge(computeProfileCompletion(advisor)).color} px-4 py-1 rounded-xl bg-white/5 border border-white/10`}>
                           {getCompletionBadge(computeProfileCompletion(advisor)).label} Advisor
                         </span>
                      </h4>
                   </div>
                   <div className="text-right shrink-0">
                      <p className="text-4xl font-black text-white leading-none tracking-tighter">
                        {computeProfileCompletion(advisor)}<span className="text-sm text-slate-500 ml-1">%</span>
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                        Next: <span className="text-white">{getCompletionBadge(computeProfileCompletion(advisor)).next}</span>
                      </p>
                   </div>
                </div>
                
                <div className="h-4 w-full bg-white/5 rounded-full border border-white/5 overflow-hidden p-1">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${computeProfileCompletion(advisor)}%` }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className={`h-full rounded-full ${
                        computeProfileCompletion(advisor) < 50 ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" :
                        computeProfileCompletion(advisor) < 80 ? "bg-mango shadow-[0_0_20px_rgba(245,166,35,0.4)]" :
                        "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                     }`}
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Header Profile Section */}
          <div className="relative p-8 sm:p-12 pb-16 bg-gradient-to-b from-white/50 to-transparent">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
              <div className="shrink-0 relative">
                <motion.div 
                   whileHover={{ scale: 1.05, rotate: 2 }}
                   className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center border-8 border-white shadow-2xl relative overflow-hidden group cursor-pointer"
                >
                  {avatarPreview || advisor?.profile_picture ? (
                    <img src={avatarPreview || `https://collegeconnects-profile-pics.s3.amazonaws.com/${advisor?.profile_picture}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-slate-800">
                       {advisor?.name?.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </span>
                  )}
                  <label className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                     <Camera size={24} className="text-white" />
                     <input type="file" className="hidden" accept="image/*" onChange={e => {
                       const f = e.target.files?.[0];
                       if (f) {
                         setAvatarFile(f);
                         setAvatarPreview(URL.createObjectURL(f));
                         setIsEditing(true);
                       }
                     }} />
                  </label>
                </motion.div>
                {advisor?.college_id_front_key && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl border-4 border-white"
                  >
                    <ShieldCheck size={22} strokeWidth={3} />
                  </motion.div>
                )}
              </div>

              <div className="text-center md:text-left flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${advisor?.college_id_front_key ? 'bg-emerald-500 text-white shadow-emerald-500/10' : 'bg-red-500 text-white shadow-red-500/10'}`}>
                    {advisor?.college_id_front_key ? 'IDENTITY VERIFIED' : 'ACTION REQUIRED'}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase opacity-70">Expert Advisor Since 2024</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight truncate">{advisor?.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-lg font-bold text-slate-500 mb-6">
                  {isEditing ? (
                    <input 
                      value={editForm.detected_college}
                      onChange={e => setEditForm(p => ({...p, detected_college: e.target.value}))}
                      placeholder="Enter College Name"
                      className="bg-white/50 border border-slate-200 rounded-xl px-4 py-1.5 text-slate-900 focus:outline-none focus:ring-4 focus:ring-navy/5 transition-all text-sm"
                    />
                  ) : (
                    <span className="text-slate-900">{advisor?.detected_college || "Leading University"}</span>
                  )}
                  <span className="opacity-30">•</span>
                  <span className="text-navy">{advisor?.branch || "Specialist"}</span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <span className="flex items-center gap-2 group cursor-pointer hover:text-navy transition-colors">
                    <Mail size={14} className="text-mango" /> {authUser?.email?.split('@')[0]}@collegeconnects.com
                  </span>
                  <span className="flex items-center gap-2 text-slate-900 font-black">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {formatStudyYearLabel(effectiveYear)} STUDENT
                  </span>
                </div>
              </div>
              
              {!isEditing && (
                <motion.button 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)} 
                  className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all flex items-center gap-3 font-black text-sm tracking-widest"
                >
                  <Edit3 size={18} strokeWidth={2.5} /> EDIT PROFILE
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 pt-0">
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-12 p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] flex items-start gap-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xl border border-blue-100 group-hover:rotate-6 transition-transform">
                  <ShieldCheck className="text-blue-600" size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">Advisor Verification Policy</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-bold opacity-80">
                    To maintain elite platform standards, your profile becomes visible to students only after completing:
                    <span className="text-navy ml-1.5 underline decoration-navy/20 underline-offset-4">Branch, College ID, and JEE Merit details.</span>
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-16">
              {/* Personal & Academic Group */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-mango rounded-full shadow-[0_0_15px_-2px_rgba(245,166,35,0.3)]" />
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Identity & Academic Merit</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                   {[
                    { label: "Full Name", key: "name", type: "text", icon: User },
                    { label: "Gender", key: "gender", type: "text", icon: UserCircle, options: GENDER_OPTIONS },
                    { label: "Personal Email", key: "personal_email", type: "email", icon: Mail },
                    { label: "Phone Number", key: "phone", type: "tel", icon: Phone },
                    { label: "Current State", key: "state", type: "text", icon: MapPin },
                    { label: "Current Study Year", key: "current_study_year", type: "select", icon: Clock, options: STUDY_YEAR_OPTIONS },
                    { label: "JEE Mains Percentile", key: "jee_mains_percentile", type: "text", icon: Target, color: "text-mango-dark" },
                    { label: "JEE Mains Rank", key: "jee_mains_rank", type: "text", icon: Award, mandatory: true, color: "text-navy" },
                    { label: "JEE Advanced Rank", key: "jee_advanced_rank", type: "text", icon: Star, color: "text-teal-600" },
                  ].map((field, i) => (
                    <motion.div 
                      key={field.key}
                      initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex flex-col gap-3 group"
                    >
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2 group-hover:text-navy transition-colors">
                         <field.icon size={13} strokeWidth={3} className={field.color || "text-slate-300"} />
                         {field.label}
                         {field.mandatory && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {isEditing ? (
                        field.options ? (
                          <select
                            value={editForm[field.key as keyof typeof editForm] as string || ""}
                            onChange={e => setEditForm(p => ({ ...p, [field.key]: e.target.value }))}
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-mango/40 focus:ring-4 focus:ring-mango/5 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options.map(option => (
                              <option key={option} value={option}>
                                {field.key === "current_study_year" 
                                  ? (option === "passed_out" ? "Passed Out" : `Year ${option}`)
                                  : option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            type={field.type}
                            value={editForm[field.key as keyof typeof editForm] as string} 
                            onChange={e => setEditForm(p => ({...p, [field.key]: e.target.value}))}
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-mango/40 focus:ring-4 focus:ring-mango/5 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                          />
                        )
                      ) : (
                        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-black text-slate-800 shadow-sm group-hover:shadow-md transition-shadow truncate">
                          {field.key === "current_study_year"
                            ? (editForm.current_study_year === "passed_out" ? "Passed Out" : formatStudyYearLabel(effectiveYear))
                            : (editForm[field.key as keyof typeof editForm] as string) || <span className="text-slate-300 italic font-medium">Not provided</span>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mentorship Portfolio Group */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-slate-900 rounded-full shadow-[0_0_15px_-2px_rgba(15,23,42,0.3)]" />
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Mentorship Portfolio</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                   {/* Branch & Languages */}
                   <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-3 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2 group-hover:text-navy transition-colors">
                           <GraduationCap size={13} strokeWidth={3} className="text-slate-300" />
                           Focus Branch <span className="text-red-500 ml-1">*</span>
                        </label>
                        {isEditing ? (
                          <input 
                            value={editForm.branch} 
                            onChange={e => setEditForm(p => ({...p, branch: e.target.value}))}
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-bold focus:bg-white focus:border-navy/40 focus:ring-4 focus:ring-navy/5 outline-none transition-all shadow-inner"
                          />
                        ) : (
                          <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-black text-slate-800 shadow-sm group-hover:shadow-md transition-shadow">
                            {editForm.branch || <span className="text-slate-300 italic font-medium">Not provided</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2 group-hover:text-navy transition-colors">
                           <Languages size={13} strokeWidth={3} className="text-slate-300" />
                           Languages
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsLanguageDropdownOpen(prev => !prev)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-bold text-left focus:bg-white focus:border-navy/40 focus:ring-4 focus:ring-navy/5 outline-none transition-all flex items-center justify-between shadow-inner"
                            >
                              <span className="truncate mr-4">
                                {editForm.languages.length > 0
                                  ? editForm.languages.join(", ")
                                  : "Select languages"}
                              </span>
                              <ChevronDown size={18} className="text-slate-400" />
                            </button>
                            <AnimatePresence>
                              {isLanguageDropdownOpen && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className="absolute z-20 mt-4 w-full bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 max-h-72 overflow-y-auto custom-scrollbar"
                                >
                                  <div className="grid grid-cols-2 gap-3">
                                    {LANGUAGE_OPTIONS.map(language => {
                                      const checked = editForm.languages.includes(language);
                                      return (
                                        <label
                                          key={language}
                                          className={`flex items-center gap-3 text-xs font-bold p-3 rounded-xl cursor-pointer transition-all ${checked ? 'bg-navy/5 text-navy border-navy/10' : 'hover:bg-slate-50 text-slate-600 border-transparent'} border`}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() =>
                                              setEditForm(prev => ({
                                                ...prev,
                                                languages: checked
                                                  ? prev.languages.filter(item => item !== language)
                                                  : [...prev.languages, language],
                                              }))
                                            }
                                            className="accent-navy w-4 h-4"
                                          />
                                          {language}
                                        </label>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-black text-slate-800 shadow-sm group-hover:shadow-md transition-shadow">
                            {editForm.languages.join(", ") || <span className="text-slate-300 italic font-medium">Not provided</span>}
                          </div>
                        )}
                      </div>
                   </div>

                   {/* Pricing & Time Slots */}
                   <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-3 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2 group-hover:text-navy transition-colors">
                           <IndianRupee size={13} strokeWidth={3} className="text-slate-300" />
                           Hourly Rate
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <select
                              value={editForm.session_price}
                              onChange={e => setEditForm(p => ({...p, session_price: e.target.value}))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-black outline-none focus:bg-white focus:border-mango/40 appearance-none cursor-pointer shadow-inner"
                            >
                              {ADVISOR_PRICE_OPTIONS.map(price => {
                                const numeric = Number(price);
                                const totalSessions = advisor?.total_sessions || 0;
                                let isLocked = false;
                                let unlockReq = "";
                                if (numeric >= 400) { isLocked = totalSessions < 10; unlockReq = "10 sessions"; }
                                else if (numeric >= 350) { isLocked = totalSessions < 8; unlockReq = "8 sessions"; }
                                else if (numeric >= 300) { isLocked = totalSessions < 5; unlockReq = "5 sessions"; }
                                else if (numeric >= 250) { isLocked = totalSessions < 2; unlockReq = "2 sessions"; }

                                return (
                                  <option key={price} value={price} disabled={isLocked}>
                                    {numeric >= 250 ? "👑 " : "₹"}{price} / Hour {isLocked ? ` (Requires ${unlockReq})` : ""}
                                  </option>
                                );
                              })}
                            </select>
                            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4.5 text-sm font-black text-mango-dark flex justify-between items-center shadow-sm group-hover:shadow-md transition-shadow">
                            <span>₹{advisor?.session_price || "0"} <span className="text-slate-400 font-bold ml-1 uppercase text-[9px] tracking-widest">per session</span></span>
                            <IndianRupee size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2 group-hover:text-navy transition-colors">
                           <Clock size={13} strokeWidth={3} className="text-slate-300" />
                           Preferred Availability
                        </label>
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {editForm.preferred_timezones.map((slot, i) => (
                                <motion.div 
                                  initial={{ scale: 0 }} 
                                  animate={{ scale: 1 }} 
                                  key={i} 
                                  className="bg-navy text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2 uppercase tracking-wider"
                                >
                                  {slot}
                                  <button onClick={() => setEditForm(p => ({...p, preferred_timezones: p.preferred_timezones.filter((_, idx) => idx !== i)}))} className="hover:text-mango">
                                    <X size={14} strokeWidth={3} />
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                            <div className="relative">
                              <select
                                value=""
                                onChange={e => {
                                  const v = e.target.value;
                                  if (v && !editForm.preferred_timezones.includes(v)) {
                                    setEditForm(p => ({ ...p, preferred_timezones: [...p.preferred_timezones, v] }));
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-sm font-black outline-none focus:bg-white focus:border-navy/40 appearance-none cursor-pointer shadow-inner"
                              >
                                <option value="">Add Availability Slot...</option>
                                {TIME_SLOT_OPTIONS.map(slot => (
                                  <option key={slot} value={slot} disabled={editForm.preferred_timezones.includes(slot)}>{slot}</option>
                                ))}
                              </select>
                              <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 min-h-[56px] p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
                            {editForm.preferred_timezones.length > 0 ? (
                              editForm.preferred_timezones.map((slot, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                                  {slot}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-300 text-xs italic font-medium">No slots added yet.</span>
                            )}
                          </div>
                        )}
                      </div>
                   </div>
                </div>

                {/* Professional Bio */}
                <div className="flex flex-col gap-4 group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 flex items-center gap-2 group-hover:text-navy transition-colors">
                     <User size={13} strokeWidth={3} className="text-slate-300" />
                     Professional Narrative & Expertise
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm(p => ({...p, bio: e.target.value}))}
                      rows={4}
                      className="bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-6 text-sm font-bold outline-none focus:bg-white focus:border-navy/40 focus:ring-4 focus:ring-navy/5 transition-all resize-none leading-relaxed shadow-inner"
                      placeholder="Showcase your journey, expertise, and how you help students..."
                    />
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-[2.5rem] px-8 py-8 text-sm text-slate-500 font-bold leading-relaxed italic shadow-sm group-hover:shadow-md transition-shadow">
                      "{editForm.bio || "No professional narrative provided yet. A compelling bio increases student trust and bookings."}"
                    </div>
                  )}
                </div>
              </div>

              {/* Identity Verification Redesigned */}
              <div className="pt-20 mt-12 border-t border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_-2px_rgba(16,185,129,0.3)]" />
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Institutional Credentialing</h3>
                </div>
                
                {!advisor?.college_id_front_key ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 text-white rounded-[3.5rem] p-10 sm:p-12 shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-mango/10 blur-[120px] rounded-full -mr-40 -mt-40 transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy/20 blur-[100px] rounded-full -ml-32 -mb-32" />
                    
                    <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                      <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                        <Upload size={36} className="text-mango" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 text-center lg:text-left">
                        <p className="text-3xl font-black mb-4 tracking-tight">Academic ID Verification</p>
                        <p className="text-slate-400 font-bold leading-relaxed max-w-2xl text-sm">
                          To protect the student community, all experts must verify their current institutional status. 
                          Upload clear images of both sides of your college ID card.
                        </p>
                      </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-white/10 space-y-10 relative z-10">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {[
                          { label: "FRONT SIDE", file: frontFile, setFile: setFrontFile },
                          { label: "BACK SIDE", file: backFile, setFile: setBackFile },
                        ].map((upload, i) => (
                          <div key={i} className="flex flex-col gap-4">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex justify-between items-center">
                               {upload.label} {upload.file ? <CheckCircle size={12} className="text-emerald-500" /> : <span className="text-red-500">*</span>}
                             </label>
                             <label className={`cursor-pointer group h-44 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 ${upload.file ? "bg-emerald-500/10 border-emerald-500/50" : "bg-white/5 border-white/10 hover:border-mango/40 hover:bg-white/[0.08]"}`}>
                                <Camera size={32} className={upload.file ? "text-emerald-400" : "text-slate-500 group-hover:text-mango transition-colors"} />
                                <div className="text-center">
                                  <p className={`text-[11px] font-black uppercase tracking-widest ${upload.file ? "text-emerald-400" : "text-slate-400"}`}>
                                    {upload.file ? "File Cached" : "Capture / Select Image"}
                                  </p>
                                  {upload.file && <p className="text-[9px] text-emerald-500/60 font-bold mt-1 truncate max-w-[150px]">{upload.file.name}</p>}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={e => upload.setFile(e.target.files?.[0] || null)} />
                             </label>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <div className="pt-1">
                          <input 
                            type="checkbox" 
                            id="id_ack"
                            checked={editForm.college_id_acknowledged}
                            onChange={e => setEditForm(p => ({...p, college_id_acknowledged: e.target.checked}))}
                            className="w-5 h-5 accent-mango rounded-lg cursor-pointer" 
                          />
                        </div>
                        <label htmlFor="id_ack" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none font-bold">
                          I certify that I am a verified student at <span className="text-white underline decoration-mango/40 underline-offset-4">{editForm.detected_college || "my detected university"}</span> and all documents provided are authentic.
                        </label>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-[3rem] p-12 flex flex-col sm:flex-row items-center gap-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/50 blur-3xl rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-700" />
                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/30 shrink-0">
                      <ShieldCheck size={40} strokeWidth={2.5} />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-3xl font-black text-slate-900 tracking-tight mb-2">Credentialed Expert</p>
                      <p className="text-slate-500 font-bold text-sm leading-relaxed opacity-80">
                        Your academic identity is verified. You are authorized to provide high-stakes mentorship across the CollegeConnects network.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Danger Zone */}
              <div className="pt-16 mt-16 border-t border-slate-100">
                <AnimatePresence>
                  {isEditing && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 20 }} 
                      className="flex flex-col sm:flex-row gap-4 mb-16"
                    >
                      <motion.button 
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave} 
                        disabled={saving} 
                        className="flex-1 bg-slate-900 text-white font-black h-16 rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                      >
                        {saving ? <Loader size={20} className="animate-spin" /> : <><CheckCircle size={20} strokeWidth={3} /> Commit Profile Updates</>}
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
                      This will irreversibly delete your expert profile, session history, and all account data. Your students will be notified of your departure.
                    </p>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.button 
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative z-10 px-8 h-14 bg-white text-red-600 hover:bg-red-600 hover:text-white border border-red-200 font-black rounded-2xl transition-all shadow-sm hover:shadow-xl hover:shadow-red-600/10 uppercase tracking-widest text-[11px]"
                      >
                        Delete Expert Account
                      </motion.button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[3rem] bg-white border-none shadow-2xl p-10">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-sm font-bold leading-relaxed mt-4">
                          Expert account deletion is permanent. All your data will be wiped and your verified status will be lost.
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
                          {deleting ? <Loader size={18} className="animate-spin" /> : "Delete Expert Permanently"}
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
