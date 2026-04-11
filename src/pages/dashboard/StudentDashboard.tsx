import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getAdvisorsDirectory,
  getMyStudentProfile,
  getMyBookings,
  getStudentReferralSummary,
  type AdvisorDirectoryItem,
  type StudentProfileResponse,
  type BookingResponse,
  type ReferralSummaryResponse,
  syncBookingStatus,
} from "@/lib/restApi";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { Calendar, Search, ChevronDown, Star, ArrowRight, Gift, Video, RefreshCw, IndianRupee, Monitor, Loader, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import StudentReferEarnPage from "./StudentReferEarnPage";

const COLLEGES = ["All Colleges", "RGIPT", "IIT Delhi", "IIT Bombay", "NIT Trichy", "BITS Pilani"];
const BRANCHES = ["All Branches", "Computer Science", "Petroleum Engineering", "Information Technology", "Electronics Engineering", "Mathematics and Computing"];

const TABS = [
  { id: "advisors", label: "Find Advisors", icon: Search },
  { id: "sessions", label: "My Sessions", icon: Calendar },
  { id: "refer", label: "Refer & Earn", icon: Gift },
];

function BookingCardContent({ booking }: { booking: BookingResponse }) {
  const [syncing, setSyncing] = useState(false);

  const handleSyncStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) return;

    setSyncing(true);
    try {
      const token = await u.getIdToken(true);
      const res = await syncBookingStatus(token, booking.id);
      if (res.ok) {
        alert("Payment verified! Your session is now confirmed.");
        window.location.reload(); 
      } else {
        alert(res.message || "Payment not yet received.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!booking.meet_link) return;
    window.open(booking.meet_link, "_blank");
  };

  return (
    <div className="glass rounded-2xl border border-border p-5 hover:border-neon-teal/50 transition-colors group flex flex-col h-full cursor-pointer overflow-hidden">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Advisor</p>
            <p className="text-lg font-semibold text-foreground">{booking.advisor_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p
              className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-medium ${
                booking.status === "confirmed" || booking.status === "finalized"
                  ? "bg-neon-teal/10 border-neon-teal/30 text-neon-teal"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-500"
              }`}
            >
              {booking.status || "pending"}
            </p>
            {booking.status === "pending" && (
              <button
                onClick={handleSyncStatus}
                disabled={syncing}
                className="inline-flex items-center gap-1 text-neon-teal hover:text-neon-teal/80 transition-colors"
                title="Already paid? Click to sync status"
              >
                <RefreshCw size={11} className={syncing ? "animate-spin" : ""} />
                <span className="text-[10px] font-semibold underline">Check Payment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            disabled={!booking.meet_link || (booking.status !== "confirmed" && booking.status !== "finalized")}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-neon-teal hover:bg-neon-teal/90 text-black text-xs font-semibold h-9 rounded-xl transition-all disabled:opacity-50"
            onClick={handleJoin}
          >
            <Video size={14} />
            {booking.status === "pending" ? "Pending" : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("advisors");
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [student, setStudent] = useState<StudentProfileResponse | null>(null);
  const [advisors, setAdvisors] = useState<AdvisorDirectoryItem[]>([]);
  const [advisorsLoading, setAdvisorsLoading] = useState(true);
  const [advisorsError, setAdvisorsError] = useState<string | null>(null);
  const [sessionBookings, setSessionBookings] = useState<BookingResponse[]>([]);
  const [selectedCollege, setSelectedCollege] = useState("All Colleges");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [searchQuery, setSearchQuery] = useState("");
  const [referralSummary, setReferralSummary] = useState<ReferralSummaryResponse | null>(null);

  useEffect(() => {
    document.title = "Student Dashboard  -  Collegeconnects";
  }, []);

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
        const profile = await getMyStudentProfile(token);
        if (!cancelled) setStudent(profile);
      } catch (e) {}
    };
    void loadProfile();
    return () => { cancelled = true; };
  }, [authUser?.uid]);

  useEffect(() => {
    let cancelled = false;
    const loadAdvisors = async () => {
      setAdvisorsLoading(true);
      setAdvisorsError(null);
      try {
        const list = await getAdvisorsDirectory();
        if (!cancelled) setAdvisors(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) {
          setAdvisorsError(e instanceof Error ? e.message : "Could not load advisors.");
          setAdvisors([]);
        }
      } finally {
        if (!cancelled) setAdvisorsLoading(false);
      }
    };
    void loadAdvisors();
    return () => { cancelled = true; };
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
    const timer = setInterval(() => void loadBookings(), 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authUser?.uid, activeTab]);

  const welcomeName = student?.name || authUser?.displayName || authUser?.email?.split("@")[0] || "Student";
  const dynamicColleges = ["All Colleges", ...new Set(advisors.map(a => a.college).filter(Boolean).sort())];
  const dynamicBranches = ["All Branches", ...new Set(advisors.map(a => a.branch).filter(Boolean).sort())];

  const filteredAdvisors = advisors.filter((a) => {
    const name = String(a.name ?? "");
    const college = String(a.college ?? "");
    const branch = String(a.branch ?? "");
    const collegeMatch = selectedCollege === "All Colleges" || college === selectedCollege;
    const branchMatch = selectedBranch === "All Branches" || branch === selectedBranch;
    const searchMatch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     college.toLowerCase().includes(searchQuery.toLowerCase());
    return collegeMatch && branchMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background relative selection:bg-neon-teal/30">
      <div className="pt-24 pb-20 px-4 sm:px-6 relative z-10 max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2">
              Welcome back, <span className="text-neon-teal">{welcomeName}</span>
            </h1>
            <p className="text-muted-foreground font-medium">Ready to explore your future colleges?</p>
          </motion.div>
        </header>

        <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-fit mb-10 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-neon-teal text-black shadow-lg shadow-neon-teal/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "advisors" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-neon-teal transition-colors" />
                <input
                  type="text"
                  placeholder="Search advisors or colleges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal/50 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm outline-none focus:border-neon-teal transition-all appearance-none cursor-pointer"
                >
                  {dynamicColleges.map(c => <option key={c} value={c} className="bg-background">{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-sm outline-none focus:border-neon-teal transition-all appearance-none cursor-pointer"
                >
                  {dynamicBranches.map(b => <option key={b} value={b} className="bg-background">{b}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {advisorsError && (
              <div className="glass border-red-500/30 p-4 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                <Star size={18} className="rotate-45" /> {advisorsError}
              </div>
            )}

            {advisorsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-3xl h-64 animate-pulse opacity-50" />
                ))}
              </div>
            ) : filteredAdvisors.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl border-dashed">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No advisors found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdvisors.map((advisor) => (
                  <motion.div
                    key={advisor.id}
                    layout
                    whileHover={{ y: -5 }}
                    className="glass group rounded-3xl border border-white/10 p-6 flex flex-col h-full hover:border-neon-teal/50 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => navigate({ to: `/student/advisor/${advisor.id}` })}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-teal to-teal-400 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-neon-teal/20">
                        {advisor.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-neon-teal transition-colors truncate">{advisor.name}</h4>
                        <p className="text-xs text-muted-foreground font-medium truncate">{advisor.college}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-neon-teal text-xs font-bold bg-neon-teal/10 px-2 py-0.5 rounded-full">
                            <IndianRupee size={12} />
                            {advisor.session_price}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 mt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{advisor.bio || "Experience the best guidance..."}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{advisor.branch}</p>
                      <button className="p-2 rounded-xl bg-white/5 group-hover:bg-neon-teal group-hover:text-black transition-all">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "sessions" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">My Sessions</h2>
            {sessionBookings.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl">
                <Calendar size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-foreground">No sessions yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Book your first session with an advisor today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessionBookings.map((booking) => (
                  <BookingCardContent key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "refer" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <StudentReferEarnPage />
          </motion.div>
        )}
      </div>
    </div>
  );
}