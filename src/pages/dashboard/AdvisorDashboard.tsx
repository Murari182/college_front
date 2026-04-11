import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyAdvisorProfile,
  getMyBookings,
  type AdvisorProfileResponse,
  type BookingResponse,
  updateMyAdvisorProfile,
  uploadCollegeIdPairToS3,
} from "@/lib/restApi";
import { computeEffectiveStudyYear, formatStudyYearLabel } from "@/lib/advisorStudyYear";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { User, Calendar, IndianRupee, Star, TrendingUp, Users, Wallet, ArrowUpRight, History, Gift } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import AdvisorReferEarnPage from "./AdvisorReferEarnPage";


const TABS = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "earnings", label: "Earnings", icon: IndianRupee },
  { id: "refer", label: "Refer & Earn", icon: Gift },
];

const HOURLY_TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:00 ${suffix}`;
});

const ADVISOR_PRICE_OPTIONS = [
  "99",
  "149",
  "199",
  "249",
  "299",
  "399",
  "499",
  "599",
  "999",
];

function parsePreferredTimezoneSlots(
  slots: string[] | undefined,
): Array<{ from: string; to: string }> {
  const parsed = (slots || []).map((slot) => {
    const [from = "", to = ""] = slot.split(" - ").map((v) => v.trim());
    return { from, to };
  });
  if (parsed.length >= 4) return parsed;
  return [...parsed, ...Array.from({ length: 4 - parsed.length }, () => ({ from: "", to: "" }))];
}

export default function AdvisorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorProfileResponse | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sessionBookings, setSessionBookings] = useState<BookingResponse[]>([]);
  const [editForm, setEditForm] = useState({
    name: "",
    branch: "",
    phone: "",
    state: "",
    bio: "",
    session_price: "",
    current_study_year: "",
    preferred_timezones: [{ from: "", to: "" }, { from: "", to: "" }, { from: "", to: "" }, { from: "", to: "" }],
  });
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  useEffect(() => {
    document.title = "Advisor Dashboard  -  Collegeconnects";
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadBookings = async () => {
      const u = getFirebaseAuth().currentUser;
      if (!u || activeTab !== "sessions") return;
      try {
        const token = await u.getIdToken(true);
        const list = await getMyBookings(token);
        if (!cancelled) setSessionBookings(list);
      } catch (e) {
        if (!cancelled) setSessionBookings([]);
      }
    };
    void loadBookings();
    return () => {
      cancelled = true;
    };
  }, [authUser?.uid, activeTab]);
  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, setAuthUser);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      const u = getFirebaseAuth().currentUser;
      if (!u) return;
      try {
        const token = await u.getIdToken(true);
        const profile = await getMyAdvisorProfile(token);
        if (!cancelled) setAdvisor(profile);
      } catch (e) {}
    };
    void loadProfile();
    return () => { cancelled = true; };
  }, [authUser?.uid]);


  const advisorName = advisor?.name || "Advisor";
  const advisorCollege = advisor?.detected_college || "Not available";
  const advisorBranch = advisor?.branch || "Not available";
  const advisorStudyYearLabel = formatStudyYearLabel(computeEffectiveStudyYear(advisor ?? {}));
  const advisorSessionPrice = Number(advisor?.session_price || "0");
  const advisorBio = advisor?.bio || "No bio added yet.";
  const advisorIsVerified = !!(advisor?.college_id_front_key && advisor?.college_id_back_key);
  const advisorPreferredTimezones =
    advisor?.preferred_timezones && advisor.preferred_timezones.length > 0
      ? advisor.preferred_timezones.join(", ")
      : "Not specified";

  const advisorTotalEarnings = advisor?.total_earnings ?? 0;
  const advisorTotalSessions = advisor?.total_sessions ?? 0;
  const advisorTotalStudents = advisor?.total_students ?? 0;
  const mySessionBookings = sessionBookings; // backend already filters by advisor
  const welcomeName =
    advisorName ||
    authUser?.displayName?.trim() ||
    authUser?.email?.split("@")[0] ||
    "Advisor";

  return (
    <div className="min-h-screen bg-background pt-28 sm:pt-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Welcome header  -  brand lives in navbar; full width avoids overlap with tall stacked logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 w-full min-w-0"
        >
          <h1 className="text-3xl font-display font-bold text-foreground break-words">
            Welcome back, <span className="gradient-text-orange">{welcomeName}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">Manage your sessions and connect with students</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                  ? "bg-neon-orange text-black"
                  : "glass border border-border text-muted-foreground hover:text-foreground"
                }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>


        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Earnings", value: `Rs ${advisorTotalEarnings}`, icon: IndianRupee, color: "text-neon-orange" },
                { label: "Total Sessions", value: advisorTotalSessions, icon: Calendar, color: "text-neon-teal" },
                { label: "Students Helped", value: advisorTotalStudents, icon: Users, color: "text-neon-blue" },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-2xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon size={20} className={stat.color} />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className={`text-3xl font-display font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="glass rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-center gap-3">
                <Star size={20} className="text-neon-orange fill-neon-orange" />
                <p className="text-sm text-muted-foreground">Your Rating</p>
              </div>
              <p className="text-3xl font-bold text-neon-orange mt-2">5.0 / 5.0</p>
              <p className="text-xs text-muted-foreground mt-1">Based on {advisorTotalSessions} sessions</p>
            </div>

            {/* Quick info */}
            <div className="glass rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Profile Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "College", value: advisorCollege },
                  { label: "Branch", value: advisorBranch },
                  { label: "Current Year", value: advisorStudyYearLabel },
                  { label: "Session Price", value: advisorSessionPrice > 0 ? `Rs ${advisorSessionPrice}` : "Not set" },
                  { label: "Verification Status", value: advisorIsVerified ? "Verified ✅" : "Verification Required ❌" },
                  { label: "Preferred Time Slots", value: advisorPreferredTimezones },
                ].map(item => (
                  <div key={item.label} className="bg-background/50 rounded-xl px-4 py-3 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm text-foreground font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {mySessionBookings.length === 0 ? (
              <div className="glass rounded-2xl border border-border p-8 text-center">
                <Calendar size={40} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No sessions booked yet</h3>
                <p className="text-muted-foreground">Students will book sessions with you once your profile is live!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mySessionBookings.map((booking) => (
                  <div
                    key={booking.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      navigate({
                        to: "/advisor/session/$bookingId",
                        params: { bookingId: booking.id },
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate({
                          to: "/advisor/session/$bookingId",
                          params: { bookingId: booking.id },
                        });
                      }
                    }}
                    className="glass rounded-2xl border border-border p-5 cursor-pointer hover:border-neon-orange/50 transition-colors"
                  >
                    <p className="text-xs text-muted-foreground mb-1">Student</p>
                    <p className="text-lg font-semibold text-foreground">{booking.student_name}</p>
                    <p className="text-sm text-muted-foreground mb-3">{booking.student_email}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background/50 rounded-xl px-3 py-2 border border-border/60">
                        <p className="text-[11px] text-muted-foreground">Session price</p>
                        <p className="text-sm font-medium text-neon-orange">
                          {booking.session_price ? `Rs ${booking.session_price}` : " - "}
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-xl px-3 py-2 border border-border/60">
                        <p className="text-[11px] text-muted-foreground">Selected slot</p>
                        <p className="text-sm font-medium text-foreground">
                          {booking.selected_slot || " - "}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Status: {booking.status || "pending"} | Booked {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : "unknown"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* EARNINGS TAB (Wallet) */}
        {activeTab === "earnings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Wallet Card */}
            <div className="glass rounded-3xl border border-border overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-orange/10 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="p-8 sm:p-10 relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neon-orange/20 flex items-center justify-center">
                      <Wallet size={24} className="text-neon-orange" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">My Wallet</h3>
                      <p className="text-sm text-muted-foreground">Manage your earnings and payouts</p>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="px-3 py-1 rounded-full bg-neon-teal/10 text-neon-teal text-xs font-medium border border-neon-teal/20">
                      Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Available Balance (Net)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-bold text-foreground">Rs {Math.floor(advisorTotalEarnings * 0.7)}</span>
                      <span className="text-muted-foreground text-sm font-medium">INR</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">* Balance after 30% platform fee</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 bg-neon-orange hover:bg-neon-orange/90 text-black font-semibold rounded-2xl h-14 transition-all shadow-lg shadow-neon-orange/20 group">
                      <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      Withdraw Money
                    </button>
                    <button className="flex-1 inline-flex items-center justify-center gap-2 glass border border-border hover:bg-white/5 text-foreground font-semibold rounded-2xl h-14 transition-all">
                      <History size={20} />
                      Payout History
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Access Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border">
                {[
                  { label: "Pending Payout", value: "Rs 0", color: "text-muted-foreground" },
                  { label: "Total Tax Paid", value: "Rs 0", color: "text-muted-foreground" },
                  { label: "Last Payout", value: "None", color: "text-muted-foreground" },
                  { label: "Platform Fee", value: "30%", color: "text-neon-teal" },
                ].map((stat, idx) => (
                  <div key={idx} className="p-4 border-r border-border last:border-r-0 text-center sm:text-left">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Section */}
            <div className="glass rounded-3xl border border-border p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Recent Transactions</h3>
                <button className="text-xs text-neon-orange hover:underline font-medium">View All</button>
              </div>

              {advisorTotalEarnings === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-border/50">
                    <IndianRupee size={24} className="text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">No transactions yet</h4>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Your earnings will show here once students start booking sessions with you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* We could map over real bookings that are 'accepted' or 'paid' here */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border/50 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-teal/20 flex items-center justify-center text-neon-teal">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Session Credit</p>
                        <p className="text-xs text-muted-foreground">From Recent Bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-neon-teal">+ Rs {advisorTotalEarnings}</p>
                      <p className="text-[10px] text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payout Information Alert */}
            <div className="bg-neon-teal/5 border border-neon-teal/20 rounded-2xl p-4 flex gap-4">
              <TrendingUp size={20} className="text-neon-teal shrink-0" />
              <div className="text-sm">
                <p className="text-neon-teal font-semibold">Automatic Weekly Payouts</p>
                <p className="text-muted-foreground mt-0.5">
                  Your earnings are processed every Monday and credited to your linked bank account within 2-3 business days.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* REFER TAB */}
        {activeTab === "refer" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdvisorReferEarnPage />
          </motion.div>
        )}


      </div>
    </div>
  );
}