import { useState, useEffect } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyStudentProfile,
  getStudentReferralSummary,
  type StudentProfileResponse,
  type ReferralSummaryResponse,
  updateMyStudentProfile,
} from "@/lib/restApi";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { User, Monitor, IndianRupee, Gift, Loader, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [student, setStudent] = useState<StudentProfileResponse | null>(null);
  const [referralSummary, setReferralSummary] = useState<ReferralSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        fetchProfile(user);
      } else {
        navigate({ to: "/auth/signin" });
      }
    });
    return unsub;
  }, [navigate]);

  const fetchProfile = async (user: FirebaseUser) => {
    try {
      const token = await user.getIdToken();
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
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser || !student) return;
    setSaving(true);
    try {
      const token = await authUser.getIdToken();
      const updated = await updateMyStudentProfile(token, editForm);
      setStudent(updated);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-neon-teal" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl border border-border/50 p-6 sm:p-10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neon-teal to-teal-400 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-neon-teal/20">
              {student?.name?.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-display font-bold text-foreground mb-1">{student?.name}</h1>
              <p className="text-muted-foreground font-medium">Student Profile</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Sessions", value: student?.total_sessions || 0, icon: Monitor, color: "text-neon-teal", bg: "bg-neon-teal/10" },
              { label: "Total Spent", value: `₹${student?.total_spent || 0}`, icon: IndianRupee, color: "text-neon-orange", bg: "bg-neon-orange/10" },
              { label: "Referral Rewards", value: `₹${referralSummary?.referral_rewards_inr || 0}`, icon: Gift, color: "text-purple-400", bg: "bg-purple-500/10" },
            ].map(stat => (
              <div key={stat.label} className="glass border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-foreground">Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-neon-teal hover:underline"
                >
                  Edit Information
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Phone Number", key: "phone", type: "tel" },
                { label: "State", key: "state", type: "text" },
                { label: "Academic Status", key: "academic_status", type: "text" },
                { label: "JEE Mains Percentile", key: "jee_mains_percentile", type: "text" },
                { label: "JEE Mains Rank", key: "jee_mains_rank", type: "text" },
                { label: "JEE Advanced Rank", key: "jee_advanced_rank", type: "text" },
                { label: "Email Address", key: "email", type: "email", value: student?.email, disabled: true },
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    {field.label}
                  </label>
                  {isEditing && !field.disabled ? (
                    <input
                      type={field.type}
                      value={editForm[field.key as keyof typeof editForm]}
                      onChange={(e) => setEditForm(p => ({ ...p, [field.key]: e.target.value }))}
                      className="bg-background/50 border border-border rounded-xl px-4 py-3 text-sm focus:border-neon-teal outline-none transition-all"
                    />
                  ) : (
                    <div className="bg-background/30 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground flex items-center justify-between">
                      <span>{field.value || (field.key === "jee_mains_percentile" && editForm[field.key] ? `${editForm[field.key]}%` : editForm[field.key as keyof typeof editForm]) || "Not provided"}</span>
                      {field.disabled && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground">Permanent</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-neon-teal hover:bg-neon-teal/90 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-neon-teal/20 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader size={18} className="animate-spin" /> : <><CheckCircle size={18} /> Save Changes</>}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="flex-1 border border-border text-foreground font-bold py-3 rounded-xl hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
