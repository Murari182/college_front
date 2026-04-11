import { useNavigate } from "@tanstack/react-router";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";

interface ProfileDropdownProps {
  role: "student" | "advisor";
  userName?: string;
  avatarUrl?: string;
}

export function ProfileDropdown({ role, userName, avatarUrl }: ProfileDropdownProps) {
  const navigate = useNavigate();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 border border-border/50 transition-transform active:scale-95">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback className={role === "student" ? "bg-neon-teal/20 text-neon-teal" : "bg-neon-orange/20 text-neon-orange text-black"}>
            {(userName || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-strong border-border mt-2">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-bold truncate">{userName || "User"}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{role} Profile</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        
        <DropdownMenuItem 
          onClick={() => navigate({ to: dashboardPath })}
          className="hover:bg-accent cursor-pointer gap-2"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate({ to: `/${role}/profile` })}
          className="hover:bg-accent cursor-pointer gap-2"
        >
          <User size={16} />
          My Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/40" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-500/10 hover:text-red-500 cursor-pointer gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
