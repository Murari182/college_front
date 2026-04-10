import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { getFirebaseAuth } from "@/lib/firebase";
import { formatFirebaseAuthError } from "@/lib/firebaseAuthErrors";
import { requestSignupOtp, verifySignupOtp, registerStudent, registerAdvisor } from "@/lib/restApi";
import { FirebaseError } from "firebase/app";
import { Link, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { CheckCircle, Loader, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "./AuthShell";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "advisor">("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSendOtp = async () => {
    if (!name || !email || !password) {
      alert("Please fill in name, email, and password.");
      return;
    }
    setBusy(true);
    try {
      await requestSignupOtp(role, email.trim());
      setOtpSent(true);
      alert("Verification code sent to your email.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (!otp) {
      alert("Please enter the verification code.");
      return;
    }
    setBusy(true);
    try {
      // 1. Verify OTP and create Firebase user
      await verifySignupOtp(role, email.trim(), otp.trim(), password);
      
      // 2. Sign in to get token
      const auth = getFirebaseAuth();
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCred.user;
      
      // Update display name in Firebase
      await updateProfile(user, { displayName: name });
      
      const token = await user.getIdToken();

      // 3. Register minimal profile in our DB
      if (role === "student") {
        await registerStudent(token, { name, email: email.trim() });
        navigate({ to: "/student/dashboard" });
      } else {
        await registerAdvisor(token, { name, email: email.trim() });
        navigate({ to: "/advisor/dashboard" });
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        alert(formatFirebaseAuthError(e));
      } else {
        alert(e instanceof Error ? e.message : "Signup failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create Account"
      subtitle="Join Collegeconnects today. Simple and fast."
    >
      <div className="flex flex-col gap-6">
        {/* Role Selection */}
        <div className="flex p-1 bg-muted rounded-xl gap-1">
          <button
            onClick={() => setRole("student")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              role === "student"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            I'm a Student
          </button>
          <button
            onClick={() => setRole("advisor")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              role === "advisor"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            I'm an Advisor
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-teal transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-teal transition-colors"
            />
          </div>

          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            variant={role === "student" ? "teal" : "orange"}
          />

          {otpSent && (
            <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm text-muted-foreground">Verification Code</label>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-teal transition-colors tracking-widest"
              />
            </div>
          )}

          <Button
            onClick={otpSent ? handleVerifyAndSignup : handleSendOtp}
            disabled={busy}
            className={`w-full font-semibold rounded-xl h-11 transition-all ${
              role === "student"
                ? "bg-neon-teal hover:bg-neon-teal/90 text-background glow-teal"
                : "bg-neon-orange hover:bg-neon-orange/90 text-black glow-orange"
            }`}
          >
            {busy ? (
              <Loader size={18} className="animate-spin" />
            ) : otpSent ? (
              <>
                <CheckCircle size={18} className="mr-2" />
                Complete Signup
              </>
            ) : (
              <>
                <Mail size={18} className="mr-2" />
                Get OTP
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/signin" className="text-foreground font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
