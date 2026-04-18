import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { getFirebaseAuth } from "@/lib/firebase";
import { formatFirebaseAuthError } from "@/lib/firebaseAuthErrors";
import { getMyStudentProfile, getMyAdvisorProfile } from "@/lib/restApi";
import { Link, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader, LogIn } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { ForgotPasswordOtpDialog } from "@/components/auth/ForgotPasswordOtpDialog";

export default function SigninPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "advisor">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }
    setBusy(true);
    try {
      // 1. Firebase Auth
      const userCred = await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      const token = await userCred.user.getIdToken();

      // 2. Explicit Role Check
      try {
        if (role === "student") {
          await getMyStudentProfile(token);
          localStorage.setItem("user_role", "student");
          navigate({ to: "/student/dashboard" });
        } else {
          await getMyAdvisorProfile(token);
          localStorage.setItem("user_role", "advisor");
          navigate({ to: "/advisor/dashboard" });
        }
      } catch (err: any) {
        // Handle 403 Role Conflict specifically
        if (err.status === 403 || (err.message && err.message.includes("403"))) {
          const otherRole = role === "student" ? "Advisor" : "Student";
          alert(`It looks like you have an ${otherRole} account. Please switch to "I'm an ${otherRole}" above.`);
        } else {
          alert(`Profile not found. You don't have a ${role} account. Try switching roles or signing up.`);
        }
        await getFirebaseAuth().signOut();
      }
    } catch (e) {
      alert(formatFirebaseAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AuthShell
        title="Welcome Back"
        subtitle="Sign in to your account. Please select your role below."
      >
        <div className="flex flex-col gap-6">
          {/* Role Selection — color-coded for clarity */}
          <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1.5">
            <button
              onClick={() => setRole("student")}
              className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all duration-300 ${
                role === "student"
                  ? "bg-[#1E3A8A] text-white shadow-lg shadow-navy/20"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              I'm a Student
            </button>
            <button
              onClick={() => setRole("advisor")}
              className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all duration-300 ${
                role === "advisor"
                  ? "bg-[#F5A623] text-white shadow-lg shadow-mango/20"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              I'm an Advisor
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email</label>
            <input
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-white border-2 ${
                role === "student" ? "focus:border-[#1E3A8A]" : "focus:border-[#F5A623]"
              } border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none transition-colors placeholder:text-slate-300`}
            />
          </div>

          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            variant={role === "student" ? "teal" : "orange"}
            autoComplete="current-password"
          />

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              onClick={handleLogin}
              disabled={busy}
              className={`flex-1 font-black rounded-xl h-12 text-sm tracking-wide transition-all duration-300 ${
                role === "student"
                  ? "bg-[#1E3A8A] hover:bg-navy-dark text-white shadow-lg shadow-navy/25"
                  : "bg-[#F5A623] hover:bg-mango-dark text-white shadow-lg shadow-mango/25"
              }`}
            >
              {busy ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={18} className="mr-2" />
                  Sign In
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForgotOpen(true)}
              className="border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-bold rounded-xl h-12 transition-all"
            >
              Forgot Password
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500 font-medium mt-2">
            New here?{" "}
            <Link
              to="/auth/signup"
              className={`font-black hover:underline ${
                role === "student" ? "text-navy" : "text-mango-dark"
              }`}
            >
              Create account
            </Link>
          </p>
        </div>
      </AuthShell>

      <ForgotPasswordOtpDialog
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        role={role}
        email={email}
        onEmailChange={setEmail}
        accent={role === "student" ? "teal" : "orange"}
        onResetSuccess={async (e, newPass) => {
          await signInWithEmailAndPassword(getFirebaseAuth(), e, newPass);
          handleLogin();
        }}
      />
    </>
  );
}
