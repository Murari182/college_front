import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { getFirebaseAuth } from "@/lib/firebase";
import { formatFirebaseAuthError } from "@/lib/firebaseAuthErrors";
import { requestSignupOtp, verifySignupOtp, registerStudent, registerAdvisor } from "@/lib/restApi";
import { FirebaseError } from "firebase/app";
import { Link, useNavigate } from "@tanstack/react-router";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { CheckCircle, Loader, Mail, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthShell } from "./AuthShell";

export default function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "advisor">("student");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const isPersonalEmail = (email: string) => {
    const personalDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "me.com", "live.com", "msn.com"];
    return personalDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSendOtp = async (isResend = false) => {
    if (role === "advisor" && isPersonalEmail(email)) {
      alert("Please provide your College ID email (e.g., yourname@iit.ac.in) instead of a personal ID.");
      return;
    }
    setBusy(true);
    try {
      await requestSignupOtp(role, email.trim());
      setOtpSent(true);
      if (!isResend) setStep(4);
      setResendTimer(60); // Start 60s cooldown
      alert(isResend ? "New verification code sent!" : "Verification code sent to your email.");
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
      await verifySignupOtp(role, email.trim(), otp.trim(), password);
      const auth = getFirebaseAuth();
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCred.user;
      await updateProfile(user, { displayName: name });
      const token = await user.getIdToken();

      const payload = role === "student" 
        ? { 
            name, 
            email: email.trim(),
            referral_code: referralCode.trim() || undefined 
          }
        : {
            name,
            collegeEmail: email.trim(),
            referral_code: referralCode.trim() || undefined
          };

      if (role === "student") {
        await registerStudent(token, payload);
        localStorage.setItem("user_role", "student");
        navigate({ to: "/student/dashboard" });
      } else {
        await registerAdvisor(token, payload);
        localStorage.setItem("user_role", "advisor");
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
      title={step === 4 ? "Verify Email" : "Create Account"}
      subtitle={
        step === 1 ? "Start with your name and referral code." :
        step === 2 ? "Enter your email address." :
        step === 3 ? "Secure your account with a password." :
        "Enter the 6-digit code sent to " + email
      }
    >
      <div className="flex flex-col gap-6">
        {step === 1 && (
          <div className="flex p-1 bg-muted rounded-xl gap-1">
            <button onClick={() => setRole("student")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "student" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>I'm a Student</button>
            <button onClick={() => setRole("advisor")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === "advisor" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>I'm an Advisor</button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {step === 1 && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">Full Name</label>
                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-neon-teal outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">Referral Code (Optional)</label>
                <input type="text" placeholder="REF123" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-neon-teal outline-none" />
              </div>
              <Button onClick={() => name ? nextStep() : alert("Please enter your name")} className={`w-full font-semibold rounded-xl h-11 ${role === "student" ? "bg-neon-teal text-background" : "bg-neon-orange text-black"}`}>Next</Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-neon-teal outline-none" />
                {role === "advisor" && email && isPersonalEmail(email) && (
                  <p className="text-[10px] text-neon-orange font-medium animate-pulse mt-1">Please provide your College ID email.</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-1 rounded-xl">Back</Button>
                <Button onClick={() => email ? nextStep() : alert("Please enter your email")} className={`flex-[2] font-semibold rounded-xl ${role === "student" ? "bg-neon-teal text-background" : "bg-neon-orange text-black"}`}>Next</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <PasswordField label="Password" value={password} onChange={setPassword} variant={role === "student" ? "teal" : "orange"} />
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={prevStep} className="flex-1 rounded-xl">Back</Button>
                <Button onClick={() => handleSendOtp(false)} disabled={busy} className={`flex-[2] font-semibold rounded-xl ${role === "student" ? "bg-neon-teal text-background" : "bg-neon-orange text-black"}`}>
                  {busy ? <Loader size={18} className="animate-spin" /> : "Verify & Sign Up"}
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">Verification Code</label>
                <input type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-neon-teal outline-none tracking-widest" />
              </div>
              <Button onClick={handleVerifyAndSignup} disabled={busy} className={`w-full font-semibold rounded-xl h-11 ${role === "student" ? "bg-neon-teal text-background" : "bg-neon-orange text-black"}`}>
                {busy ? <Loader size={18} className="animate-spin" /> : <><CheckCircle size={18} className="mr-2" />Complete Signup</>}
              </Button>
              
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => handleSendOtp(true)} 
                  disabled={busy || resendTimer > 0} 
                  className={`text-sm font-medium transition-colors ${resendTimer > 0 ? "text-muted-foreground cursor-not-allowed" : "text-neon-teal hover:underline"}`}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                </button>
                <button onClick={() => setStep(2)} className="text-xs text-muted-foreground hover:underline text-center">Entered wrong email? Change it here.</button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-2">Already have an account? <Link to="/auth/signin" className="text-foreground font-medium hover:underline">Sign In</Link></p>
        </div>
      </div>
    </AuthShell>
  );
}
