import { useNavigate } from "@tanstack/react-router";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { calculateProfileCompletion } from "@/lib/profileCompletion";
import { getMyStudentProfile, getMyAdvisorProfile } from "@/lib/restApi";
import { motion } from "motion/react";

interface ProfileDropdownProps {
  role: "student" | "advisor";
  userName?: string;
  avatarUrl?: string;
}

export function ProfileDropdown({ role, userName, avatarUrl }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const [completion, setCompletion] = useState<number | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        try {
          const token = await u.getIdToken();
          const profile = role === "student" 
            ? await getMyStudentProfile(token)
            : await getMyAdvisorProfile(token);
          const pct = calculateProfileCompletion(role, profile);
          setCompletion(pct);
        } catch (error) {
          console.error("Failed to fetch profile for completion:", error);
          setCompletion(0);
        }
      }
    });
    return unsub;
  }, [role]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user_role");
      await signOut(getFirebaseAuth());
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const dashboardPath = role === "student" ? "/student/dashboard" : "/advisor/dashboard";

  // SVG ring logic
  const size = 44;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = completion !== null ? circumference - (completion / 100) * circumference : circumference;

  const showRing = completion !== null && completion < 100 && completion > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none group">
        <div className="relative flex items-center justify-center p-1">
          {/* Golden Progress Ring */}
          {showRing && (
            <svg width={size} height={size} className="absolute -rotate-90">
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-white/5"
              />
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#FFD700" // Gold
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]"
              />
            </svg>
          )}

          {/* Avatar with improved visibility */}
          <Avatar className={`h-9 w-9 ring-2 ${showRing ? "ring-transparent" : "ring-white/20"} transition-all duration-300 group-hover:ring-white/40 group-active:scale-95 shadow-lg shadow-black/40`}>
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className={role === "student" ? "bg-navy text-white font-black" : "bg-mango text-white font-black"}>
              {(userName || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Small completion Badge if 100% */}
          {completion === 100 && (
            <div className="absolute -top-1 -right-1 bg-neon-teal rounded-full p-0.5 shadow-lg">
              <CheckCircle2 size={10} className="text-black" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl mt-3 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-foreground truncate">{userName || "User"}</span>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{role}</span>
               {completion !== null && (
                 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${completion === 100 ? "bg-neon-teal/10 text-neon-teal" : "bg-gold/10 text-[#FFD700]"}`}>
                   {completion}% Complete
                 </span>
               )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border/40 my-2" />
        
        <div className="flex flex-col gap-1">
          <DropdownMenuItem 
            onClick={() => navigate({ to: dashboardPath })}
            className="hover:bg-white/5 cursor-pointer gap-3 px-3 py-2.5 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-foreground">
              <LayoutDashboard size={16} />
            </div>
            <span className="text-sm font-medium">Dashboard</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => navigate({ to: `/${role}/profile` })}
            className="hover:bg-white/5 cursor-pointer gap-3 px-3 py-2.5 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-foreground">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">My Profile</span>
              {completion !== null && completion < 100 && (
                <span className="text-[10px] text-neon-orange font-bold">Finish setup to unlock full potential</span>
              )}
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-border/40 my-2" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer gap-3 px-3 py-2.5 rounded-xl mt-1 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center">
            <LogOut size={16} />
          </div>
          <span className="text-sm font-bold">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
