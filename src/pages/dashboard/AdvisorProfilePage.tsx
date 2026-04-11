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
import { User, IndianRupee, Star, TrendingUp, Users, Loader, CheckCircle, AlertTriangle, Upload, X } from "lucide-react";
import { motion } from "motion/react";

const ADVISOR_PRICE_OPTIONS = ["99", "149", "199", "249", "299", "399", "499", "599", "999"];

function parsePreferredTimezoneSlots(slots: string[] | undefined) {
  const parsed = (slots || []).map((slot) => {
    const [from = "", to = ""] = slot.split(" - ").map((v) => v.trim());
    return { from, to };
  });
  if (parsed.length >= 4) return parsed;
  return [...parsed, ...Array.from({ length: 4 - parsed.length }, () => ({ from: "", to: "" }))];
}

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
  });
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

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
      });
    } catch (err) {
      console.error("Failed to fetch advisor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser || !advisor) return;
    setSaving(true);
    try {
      const token = await authUser.getIdToken();
      let payload: any = { ...editForm };
      
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-neon-orange" size={32} />
      </div>
    );
  }

  const effectiveYear = advisor ? computeEffectiveStudyYear(advisor) : 1;

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl border border-border/50 p-6 sm:p-10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-neon-orange to-orange-400 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-neon-orange/20">
              {advisor?.name?.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-display font-bold text-foreground mb-1">{advisor?.name}</h1>
              <p className="text-muted-foreground font-medium">{advisor?.detected_college} | {advisor?.branch}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${advisor?.college_id_front_key ? "bg-neon-teal/10 text-neon-teal border border-neon-teal/20" : "bg-neon-orange/10 text-neon-orange border border-neon-orange/20"}`}>
                  {advisor?.college_id_front_key ? "Verified Advisor" : "Unverified"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Basic Details</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Full Name", key: "name", type: "text" },
                  { label: "Branch", key: "branch", type: "text" },
                  { label: "Phone", key: "phone", type: "tel" },
                  { label: "State", key: "state", type: "text" },
                ].map(field => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase px-1">{field.label}</label>
                    {isEditing ? (
                      <input 
                        value={editForm[field.key as keyof typeof editForm]} 
                        onChange={e => setEditForm(p => ({...p, [field.key]: e.target.value}))}
                        className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neon-orange transition-all"
                      />
                    ) : (
                      <div className="bg-background/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground">
                        {editForm[field.key as keyof typeof editForm] || "Not provided"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-foreground">Session Settings</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase px-1">Consultation Fee</label>
                  {isEditing ? (
                    <select
                      value={editForm.session_price}
                      onChange={e => setEditForm(p => ({...p, session_price: e.target.value}))}
                      className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neon-orange transition-all cursor-pointer"
                    >
                      {ADVISOR_PRICE_OPTIONS.map(price => (
                        <option key={price} value={price}>Rs {price} per session</option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-background/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground flex justify-between items-center">
                      <span>Rs {advisor?.session_price || "0"}</span>
                      <IndianRupee size={14} className="text-neon-orange" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase px-1">Study Year</label>
                  <div className="bg-background/20 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-muted-foreground italic">
                    {formatStudyYearLabel(effectiveYear)}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase px-1">Professional Bio</label>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm(p => ({...p, bio: e.target.value}))}
                    rows={4}
                    className="bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neon-orange transition-all resize-none"
                    placeholder="Tell students about your experience..."
                  />
                ) : (
                  <div className="bg-background/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground min-h-[100px] leading-relaxed">
                    {editForm.bio || "No bio provided yet."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50">
            <h3 className="text-lg font-bold text-foreground mb-6">Identity Verification</h3>
            {!advisor?.college_id_front_key ? (
              <div className="bg-neon-orange/5 border border-neon-orange/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-neon-orange/10 flex items-center justify-center text-neon-orange shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="font-bold text-foreground">Upload your College ID</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    To start accepting sessions, please upload the front and back of your official college ID card.
                  </p>
                </div>
                {isEditing ? (
                  <div className="flex gap-3">
                    <label className="cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-dashed border-border transition-all flex flex-col items-center">
                      <Upload size={16} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">{frontFile ? "Front Added" : "Add Front"}</span>
                      <input type="file" className="hidden" onChange={e => setFrontFile(e.target.files?.[0] || null)} />
                    </label>
                    <label className="cursor-pointer bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-dashed border-border transition-all flex flex-col items-center">
                      <Upload size={16} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase">{backFile ? "Back Added" : "Add Back"}</span>
                      <input type="file" className="hidden" onChange={e => setBackFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-neon-orange text-black px-4 py-2 rounded-xl text-sm font-bold">Start Upload</button>
                )}
              </div>
            ) : (
              <div className="bg-neon-teal/5 border border-neon-teal/20 rounded-2xl p-6 flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-neon-teal/10 flex items-center justify-center text-neon-teal">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-foreground">Verification Documents Submitted</p>
                  <p className="text-sm text-muted-foreground mt-1">Your ID is being reviewed by our team. You can still update your basic info above.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 flex gap-4">
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-neon-orange hover:bg-neon-orange/90 text-black font-bold py-3.5 rounded-2xl shadow-lg shadow-neon-orange/20 flex items-center justify-center gap-2">
                  {saving ? <Loader size={20} className="animate-spin" /> : "Save Changes"}
                </button>
                <button onClick={() => { setIsEditing(false); setFrontFile(null); setBackFile(null); }} disabled={saving} className="flex-1 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3.5 rounded-2xl border border-border">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full border border-neon-orange/40 text-neon-orange hover:bg-neon-orange/5 font-bold py-3.5 rounded-2xl transition-all">
                Edit Professional Profile
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
