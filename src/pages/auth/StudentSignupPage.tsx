import { LanguageMultiSelect } from "@/components/signup/LanguageMultiSelect";
import { CollegeIdImageUploadBox } from "@/components/CollegeIdImageUploadBox";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { OTHER_LANGUAGE_LABEL } from "@/constants/signupLanguages";
import { getFirebaseAuth } from "@/lib/firebase";
import { extractStudentFieldsFromIdCard } from "@/lib/idCardOcr";
import {
  formatFirebaseAuthError,
} from "@/lib/firebaseAuthErrors";
import { useEmailVerificationSync } from "@/hooks/useEmailVerificationSync";
import { finalizeFirebaseSignup } from "@/lib/firebaseSignupFinalize";
import { studentPostAuthPath } from "@/lib/studentPostAuthGate";
import {
  registerStudent,
  requestSignupOtp,
  uploadCollegeIdPairToS3,
  uploadCollegeIdPairToS3Temp,
  verifySignupOtp,
} from "@/lib/restApi";
import { FirebaseError } from "firebase/app";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  type User,
  onAuthStateChanged,
  reload,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { CheckCircle, Loader, Mail, UserPlus } from "lucide-react";
import { type ChangeEvent, useEffect, useReducer, useState } from "react";
import { AuthShell } from "./AuthShell";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

type StudentSignupDraft = {
  name: string;
  email: string;
  phone: string;
  upiId: string;
  gender: string;
  state: string;
  academicStatus: string;
  jeeMainsPercentile: string;
  jeeMainsRank: string;
  jeeAdvancedRank: string;
  languages: string[];
  languageOther: string;
  idFrontPreview: string | null;
  idFrontFile: File | null;
  idBackPreview: string | null;
  idBackFile: File | null;
  idUploadToken: string;
  dateOfBirth: string;
  referralCode: string;
  acceptedPolicies: boolean;
  signupStep: 1 | 2;
};

let studentSignupDraft: StudentSignupDraft | null = null;

export default function StudentSignupPage() {
  const navigate = useNavigate();
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [academicStatus, setAcademicStatus] = useState("");
  const [jeeMainsPercentile, setJeeMainsPercentile] = useState("");
  const [jeeMainsRank, setJeeMainsRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageOther, setLanguageOther] = useState("");
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idUploadToken, setIdUploadToken] = useState("");
  const [uploadingIdToS3, setUploadingIdToS3] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [extractingIdDetails, setExtractingIdDetails] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [refreshingEmail, setRefreshingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, setAuthUser);
  }, []);

  useEffect(() => {
    if (!studentSignupDraft) return;
    const draft = studentSignupDraft;
    setName(draft.name);
    setEmail(draft.email);
    setPhone(draft.phone);
    setUpiId(draft.upiId);
    setGender(draft.gender);
    setState(draft.state);
    setAcademicStatus(draft.academicStatus);
    setJeeMainsPercentile(draft.jeeMainsPercentile);
    setJeeMainsRank(draft.jeeMainsRank);
    setJeeAdvancedRank(draft.jeeAdvancedRank);
    setLanguages(draft.languages);
    setLanguageOther(draft.languageOther);
    setIdFrontPreview(draft.idFrontPreview);
    setIdFrontFile(draft.idFrontFile);
    setIdBackPreview(draft.idBackPreview);
    setIdBackFile(draft.idBackFile);
    setIdUploadToken(draft.idUploadToken);
    setDateOfBirth(draft.dateOfBirth);
    setReferralCode(draft.referralCode);
    setAcceptedPolicies(draft.acceptedPolicies);
    setSignupStep(draft.signupStep);
  }, []);

  useEffect(() => {
    const u = authUser?.email;
    if (!u) return;
    setEmail(u);
  }, [authUser]);

  useEmailVerificationSync(authUser, setAuthUser, bump);

  useEffect(() => {
    studentSignupDraft = {
      name,
      email,
      phone,
      upiId,
      gender,
      state,
      academicStatus,
      jeeMainsPercentile,
      jeeMainsRank,
      jeeAdvancedRank,
      languages,
      languageOther,
      idFrontPreview,
      idFrontFile,
      idBackPreview,
      idBackFile,
      idUploadToken,
      dateOfBirth,
      referralCode,
      acceptedPolicies,
      signupStep,
    };
  }, [
    name,
    email,
    phone,
    upiId,
    gender,
    state,
    academicStatus,
    jeeMainsPercentile,
    jeeMainsRank,
    jeeAdvancedRank,
    languages,
    languageOther,
    idFrontPreview,
    idFrontFile,
    idBackPreview,
    idBackFile,
    idUploadToken,
    dateOfBirth,
    referralCode,
    acceptedPolicies,
    signupStep,
  ]);

  const handleStudentIdUpload = (side: "front" | "back", file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("College ID image must be under 5MB.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    if (side === "front") {
      if (idFrontPreview?.startsWith("blob:")) URL.revokeObjectURL(idFrontPreview);
      setIdFrontPreview(objectUrl);
      setIdFrontFile(file);
      setIdUploadToken("");
      return;
    }
    if (idBackPreview?.startsWith("blob:")) URL.revokeObjectURL(idBackPreview);
    setIdBackPreview(objectUrl);
    setIdBackFile(file);
    setIdUploadToken("");
  };

  useEffect(() => {
    if (!idFrontFile || !idBackFile) return;
    if (idUploadToken) return;
    let cancelled = false;

    const runTempUpload = async () => {
      setUploadingIdToS3(true);
      try {
        const uploaded = await uploadCollegeIdPairToS3Temp("student", idFrontFile, idBackFile);
        if (!cancelled) setIdUploadToken(uploaded.tempUploadToken);
      } catch {
        if (!cancelled) {
          alert("Could not pre-upload ID images yet. We will upload during final submit.");
        }
      } finally {
        if (!cancelled) setUploadingIdToS3(false);
      }
    };

    void runTempUpload();
    return () => {
      cancelled = true;
    };
  }, [idFrontFile, idBackFile, idUploadToken]);

  useEffect(() => {
    if (!idFrontFile || !idBackFile) return;
    let cancelled = false;

    const runExtraction = async () => {
      setExtractingIdDetails(true);
      try {
        const extracted = await extractStudentFieldsFromIdCard(
          idFrontFile,
          idBackFile,
          INDIAN_STATES,
        );
        if (cancelled) return;

        if (extracted.fullName && !name.trim()) setName(extracted.fullName);
        if (extracted.email && !email.trim()) setEmail(extracted.email);
        if (extracted.mobileNumber && !phone.trim()) setPhone(extracted.mobileNumber);
        if (extracted.gender && !gender) setGender(extracted.gender);
        if (extracted.state && !state) setState(extracted.state);
        if (extracted.dateOfBirth && !dateOfBirth.trim()) setDateOfBirth(extracted.dateOfBirth);
      } catch {
        if (!cancelled) {
          alert("Could not auto-extract all details from the ID. Please fill fields manually where needed.");
        }
      } finally {
        if (!cancelled) setExtractingIdDetails(false);
      }
    };

    void runExtraction();
    return () => {
      cancelled = true;
    };
  }, [idFrontFile, idBackFile]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    const signedIn = authUser?.email;
    setEmail(next);
    setSignupOtpSent(false);
    setSignupOtp("");
    if (signedIn != null && signedIn !== "" && next !== signedIn) {
      void signOut(getFirebaseAuth())
        .then(() => {
          setPassword("");
          setConfirmPassword("");
        })
        .catch(() => {
          /* ignore */
        });
    }
  };

  const isValidEmail = (e: string) => e.includes("@") && e.includes(".");

  const handleSendSignupOtp = async () => {
    if (!email || !isValidEmail(email)) {
      alert("Enter a valid email.");
      return;
    }
    if (!password || password !== confirmPassword) {
      alert("Passwords must match.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    const trimmedEmail = email.trim();
    const auth = getFirebaseAuth();
    if (
      auth.currentUser &&
      auth.currentUser.email?.toLowerCase() === trimmedEmail.toLowerCase()
    ) {
      alert(
        "You're already signed in with this email. Continue below or use 'Use a different email'.",
      );
      return;
    }
    setAuthenticating(true);
    try {
      const res = await requestSignupOtp("student", trimmedEmail);
      setSignupOtpSent(true);
      alert(
        [
          `We sent a 6-digit code to ${trimmedEmail}.`,
          "",
          `It expires in about ${Math.round(res.expires_in_seconds / 60)} minutes.`,
          "Check Spam/Promotions if you don't see it.",
        ].join("\n"),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not send verification code.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    const trimmedEmail = email.trim();
    if (!signupOtp.trim()) {
      alert("Enter the 6-digit code from your email.");
      return;
    }
    if (!password || password !== confirmPassword) {
      alert("Passwords must match.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setAuthenticating(true);
    try {
      await verifySignupOtp("student", trimmedEmail, signupOtp.trim(), password);
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      setSignupOtp("");
    } catch (e) {
      if (e instanceof FirebaseError) {
        alert(
          `${formatFirebaseAuthError(e)}\n\nIf the code was accepted but sign-in failed, try Sign in with the same email and password.`,
        );
      } else {
        alert(e instanceof Error ? e.message : "Could not verify code.");
      }
    } finally {
      setAuthenticating(false);
    }
  };

  const handleResendSignupOtp = async () => {
    setSignupOtp("");
    await handleSendSignupOtp();
  };

  const handleRefreshEmail = async () => {
    if (!authUser) return;
    setRefreshingEmail(true);
    try {
      await reload(authUser);
      bump();
    } finally {
      setRefreshingEmail(false);
    }
  };

  const handleSignOutFirebase = async () => {
    await signOut(getFirebaseAuth());
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSignupOtpSent(false);
    setSignupOtp("");
  };

  const handleNextStep = () => {
    if (!idFrontFile || !idBackFile) {
      alert("Please upload both sides of your ID card first.");
      return;
    }
    if (!name || !email || !phone || !upiId.trim() || !gender || !state) {
      alert("Please complete all required personal details before continuing.");
      return;
    }
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!password || password !== confirmPassword) {
      alert("Please enter matching password and confirm password.");
      return;
    }
    if (!authUser || !emailOk) {
      alert("Please verify your email first, then continue to education details.");
      return;
    }
    setSignupStep(2);
  };

  const handleSignup = async () => {
    if (
      !name ||
      !email ||
      !phone ||
      !upiId.trim() ||
      !gender ||
      !state ||
      !academicStatus ||
      !jeeMainsPercentile ||
      !jeeMainsRank
    ) {
      alert("Please fill all required fields!");
      return;
    }
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) {
      alert("Send the verification code, enter it, and sign in before creating your profile.");
      return;
    }
    if (!idFrontFile || !idBackFile) {
      alert("Please upload both sides of your ID card first.");
      return;
    }
    await reload(u);
    if (!u.emailVerified) {
      alert(
        "Your email is not marked verified yet. Sign out and complete code verification again, or contact support.",
      );
      return;
    }
    if (!password || password !== confirmPassword) {
      alert(
        "Re-enter your password (and confirmation) to verify with Firebase before saving your profile.",
      );
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (languages.includes(OTHER_LANGUAGE_LABEL) && !languageOther.trim()) {
      alert('Please specify your language(s) when "Other" is selected.');
      return;
    }
    if (languages.length === 0) {
      alert("Please select at least one language.");
      return;
    }
    if (!acceptedPolicies) {
      alert("Please accept Terms, About, and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await finalizeFirebaseSignup(email.trim(), password, name);
      const after = getFirebaseAuth().currentUser;
      if (!after) {
        alert("Signed out unexpectedly. Sign in again and try once more.");
        return;
      }
      const token = await after.getIdToken(true);

      let collegeIdFrontKey: string | undefined;
      let collegeIdBackKey: string | undefined;
      if (!idUploadToken) {
        const uploaded = await uploadCollegeIdPairToS3(
          token,
          "student",
          idFrontFile,
          idBackFile,
        );
        collegeIdFrontKey = uploaded.collegeIdFrontKey;
        collegeIdBackKey = uploaded.collegeIdBackKey;
      }

      const payload: Record<string, unknown> = {
        name,
        email: email.trim(),
        phone,
        upiId: upiId.trim(),
        gender,
        state,
        academicStatus,
        jeeMainsPercentile,
        jeeMainsRank,
        languages,
      };
      const adv = jeeAdvancedRank.trim();
      if (adv) payload.jeeAdvancedRank = adv;
      const lo = languageOther.trim();
      if (lo) payload.languageOther = lo;
      if (dateOfBirth.trim()) payload.dateOfBirth = dateOfBirth.trim();
      if (idUploadToken) {
        payload.idUploadToken = idUploadToken;
      } else {
        payload.collegeIdFrontKey = collegeIdFrontKey;
        payload.collegeIdBackKey = collegeIdBackKey;
      }
      if (referralCode.trim()) payload.referralCode = referralCode.trim();

      const saved = await registerStudent(token, payload);
      studentSignupDraft = null;
      const afterSignup = studentPostAuthPath();
      if (afterSignup === "/student/dashboard") {
        navigate({
          to: "/student/dashboard",
          state: { profileSavedId: saved.id } as Record<string, unknown>,
        });
      } else {
        navigate({ to: afterSignup });
      }
    } catch (e) {
      if (e instanceof FirebaseError) {
        alert(formatFirebaseAuthError(e));
      } else if (e instanceof Error) {
        alert(e.message);
      } else {
        alert(
          "Could not save your profile. Is the API running (pnpm api on port 8001)?",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const emailOk = !!authUser?.emailVerified;
  return (
    <AuthShell
      title="Student Sign Up"
      subtitle="Create your student account to book sessions with advisors."
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-xs text-muted-foreground">
          Step {signupStep} of 2  -  {signupStep === 1 ? "Personal Details" : "Education Details"}
        </div>

        <div className={signupStep === 1 ? "flex flex-col gap-4" : "hidden"}>
        <div className="border border-border/60 rounded-xl bg-background/20 p-3">
          <p className="text-sm font-semibold text-foreground mb-1">
            Student ID Card Upload <span className="text-neon-teal">*</span>
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Upload front and back first. We auto-fill personal details from your ID; you can edit any field.
          </p>
          <div className="flex gap-3">
            <CollegeIdImageUploadBox
              variant="teal"
              label="Front Side"
              preview={idFrontPreview}
              onUpload={(file) => handleStudentIdUpload("front", file)}
              onRemove={() => {
                if (idFrontPreview?.startsWith("blob:")) URL.revokeObjectURL(idFrontPreview);
                setIdFrontPreview(null);
                setIdFrontFile(null);
                setIdUploadToken("");
              }}
            />
            <CollegeIdImageUploadBox
              variant="teal"
              label="Back Side"
              preview={idBackPreview}
              onUpload={(file) => handleStudentIdUpload("back", file)}
              onRemove={() => {
                if (idBackPreview?.startsWith("blob:")) URL.revokeObjectURL(idBackPreview);
                setIdBackPreview(null);
                setIdBackFile(null);
                setIdUploadToken("");
              }}
            />
          </div>
          {extractingIdDetails ? (
            <p className="text-xs text-neon-teal mt-2">Extracting details from ID card...</p>
          ) : null}
          {uploadingIdToS3 ? (
            <p className="text-xs text-neon-teal mt-1">Securing ID upload...</p>
          ) : idUploadToken ? (
            <p className="text-xs text-green-500 mt-1">ID uploaded securely (temporary).</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-border/60 bg-background/30 px-3 py-3 space-y-2">
          <label
            htmlFor="student-signup-referral"
            className="text-sm text-muted-foreground"
          >
            Referral code <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            id="student-signup-referral"
            type="text"
            placeholder="e.g. STU-AB12CD34"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            If another student invited you, enter their code from Refer &amp; Earn. They earn 10%
            discount credit on a session when you complete yours; the referrer must have attended at
            least 2 sessions.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-name"
            className="text-sm text-muted-foreground"
          >
            Full Name <span className="text-neon-teal">⬢</span>
          </label>
          <input
            id="student-signup-name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        {/* Email + password - Resend OTP - Firebase user */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-email"
            className="text-sm text-muted-foreground"
          >
            Email <span className="text-neon-teal">⬢</span>
          </label>
          <input
            id="student-signup-email"
            type="email"
            placeholder="you@gmail.com"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            className={`bg-background border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none transition-colors ${
              authUser && email === authUser.email
                ? "border-green-500/60"
                : "border-border focus:border-neon-teal"
            }`}
          />
        </div>

        <PasswordField
          id="student-signup-password"
          label={
            <>
              Password <span className="text-neon-teal">⬢</span>
            </>
          }
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={setPassword}
          variant="teal"
        />

        <PasswordField
          id="student-signup-password-confirm"
          label={
            <>
              Confirm password <span className="text-neon-teal">⬢</span>
            </>
          }
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          variant="teal"
        />

        {!authUser ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your email and password, then tap <strong className="text-foreground">Send email OTP</strong>.
              We email you a one-time code; enter it below to sign in.
            </p>
            {!signupOtpSent ? (
              <Button
                type="button"
                onClick={handleSendSignupOtp}
                disabled={authenticating || !isValidEmail(email)}
                className="w-full bg-neon-teal hover:bg-neon-teal/95 text-black font-semibold rounded-xl shadow-lg shadow-neon-teal/30 border border-teal-400/90 ring-1 ring-white/10 disabled:opacity-50 disabled:shadow-none"
              >
                {authenticating ? (
                  <Loader size={16} className="mr-2 animate-spin" />
                ) : (
                  <Mail size={16} className="mr-2" />
                )}
                {authenticating ? "Sending..." : "Send email OTP"}
              </Button>
            ) : (
              <div className="flex flex-col gap-2 rounded-xl border border-border/80 p-3">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="student-signup-otp"
                >
                  Email OTP
                </label>
                <input
                  id="student-signup-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors tracking-widest"
                />
                <Button
                  type="button"
                  onClick={handleVerifySignupOtp}
                  disabled={authenticating || signupOtp.length < 6}
                  className="w-full bg-neon-teal hover:bg-neon-teal/95 text-black font-semibold rounded-xl shadow-lg shadow-neon-teal/30 border border-teal-400/90 ring-1 ring-white/10 disabled:opacity-50 disabled:shadow-none"
                >
                  {authenticating ? (
                    <Loader size={16} className="mr-2 animate-spin" />
                  ) : (
                    <CheckCircle size={16} className="mr-2" />
                  )}
                  {authenticating ? "Verifying..." : "Verify OTP & sign in"}
                </Button>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResendSignupOtp}
                    disabled={authenticating}
                    className="text-xs underline text-neon-teal disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupOtpSent(false);
                      setSignupOtp("");
                    }}
                    disabled={authenticating}
                    className="text-xs underline text-muted-foreground disabled:opacity-50"
                  >
                    Start over
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 p-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Email verified</span>
              {emailOk ? (
                <span className="inline-flex items-center gap-1 text-green-500">
                  <CheckCircle size={16} /> Ready to continue
                </span>
              ) : (
                <span className="text-amber-500/90">Syncing...</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRefreshEmail}
                disabled={refreshingEmail}
                className="text-xs underline text-neon-teal disabled:opacity-50"
              >
                {refreshingEmail ? "Refreshing..." : "Refresh status"}
              </button>
              <button
                type="button"
                onClick={handleSignOutFirebase}
                className="text-xs underline text-muted-foreground"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-dob"
            className="text-sm text-muted-foreground"
          >
            Date of birth <span className="text-xs">(optional)</span>
          </label>
          <input
            id="student-signup-dob"
            type="text"
            placeholder="DD/MM/YYYY"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-mobile"
            className="text-sm text-muted-foreground"
          >
            Mobile number <span className="text-neon-teal">⬢</span>
          </label>
          <input
            id="student-signup-mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-upi"
            className="text-sm text-muted-foreground"
          >
            UPI ID <span className="text-neon-teal">⬢</span>
          </label>
          <input
            id="student-signup-upi"
            type="text"
            placeholder="example@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-gender"
            className="text-sm text-muted-foreground"
          >
            Gender <span className="text-neon-teal">⬢</span>
          </label>
          <select
            id="student-signup-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-state"
            className="text-sm text-muted-foreground"
          >
            State <span className="text-neon-teal">⬢</span>
          </label>
          <select
            id="student-signup-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
          >
            <option value="">Select your state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="button"
          onClick={handleNextStep}
          className="w-full bg-neon-teal hover:bg-neon-teal/90 text-background font-semibold rounded-xl px-5"
        >
          Continue to education details
        </Button>
        </div>

        <div className={signupStep === 2 ? "flex flex-col gap-4" : "hidden"}>
        <Button
          type="button"
          onClick={() => setSignupStep(1)}
          variant="outline"
          className="w-full"
        >
          Back to personal details
        </Button>

        {/* Academic Status */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-academic"
            className="text-sm text-muted-foreground"
          >
            Academic Status <span className="text-neon-teal">⬢</span>
          </label>
          <select
            id="student-signup-academic"
            value={academicStatus}
            onChange={(e) => setAcademicStatus(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors cursor-pointer"
          >
            <option value="">Select status</option>
            <option value="12th">Currently in 12th</option>
            <option value="drop1">1st Drop</option>
            <option value="drop2">2nd Drop</option>
          </select>
        </div>

        {/* JEE Mains */}
        <div className="flex flex-col gap-2">
          <p
            className="text-sm text-muted-foreground"
            id="student-signup-jee-mains-label"
          >
            JEE Mains <span className="text-neon-teal">⬢</span>
          </p>
          <div
            className="flex gap-2"
            aria-labelledby="student-signup-jee-mains-label"
          >
            <input
              type="number"
              placeholder="Percentile (e.g. 98.5)"
              value={jeeMainsPercentile}
              onChange={(e) => setJeeMainsPercentile(e.target.value)}
              aria-label="JEE Mains percentile"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
            />
            <input
              type="number"
              placeholder="Rank"
              value={jeeMainsRank}
              onChange={(e) => setJeeMainsRank(e.target.value)}
              aria-label="JEE Mains rank"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="student-signup-jee-adv"
            className="text-sm text-muted-foreground"
          >
            JEE Advanced Rank <span className="text-xs">(optional)</span>
          </label>
          <input
            id="student-signup-jee-adv"
            type="number"
            placeholder="Optional  -  e.g. rank, or leave blank"
            value={jeeAdvancedRank}
            onChange={(e) => setJeeAdvancedRank(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-teal transition-colors"
          />
          <p className="text-xs text-muted-foreground">
            Not attempted or no rank yet? Leave empty  -  you can still create
            your account.
          </p>
        </div>

        <LanguageMultiSelect
          variant="teal"
          label="Languages I speak"
          optionalHint="*"
          value={languages}
          onChange={setLanguages}
          otherDetail={languageOther}
          onOtherDetailChange={setLanguageOther}
        />

        <div className="rounded-xl border border-border/60 bg-background/20 px-3 py-3">
          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer leading-relaxed">
            <input
              type="checkbox"
              checked={acceptedPolicies}
              onChange={(e) => setAcceptedPolicies(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border border-border bg-background accent-[#2DE2C7]"
            />
            <span>
              I accept the{" "}
              <Link to="/terms" target="_blank" rel="noreferrer" className="text-neon-teal hover:underline">
                Terms
              </Link>
              {", "}
              <Link to="/about" target="_blank" rel="noreferrer" className="text-neon-teal hover:underline">
                About
              </Link>
              {" and "}
              <Link to="/privacy" target="_blank" rel="noreferrer" className="text-neon-teal hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <div className="mt-2">
          <Button
            onClick={handleSignup}
            disabled={submitting || !acceptedPolicies}
            className="w-full bg-neon-teal hover:bg-neon-teal/90 text-background font-semibold rounded-xl px-5 glow-teal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader size={16} className="mr-2 animate-spin" />
            ) : (
              <UserPlus size={16} className="mr-2" />
            )}
            {submitting ? "Creating account..." : "Create account"}
          </Button>
          {authUser && !emailOk ? (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Tap Refresh status if this message persists.
            </p>
          ) : null}
        </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            to="/auth/student/login"
            className="text-neon-teal hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
