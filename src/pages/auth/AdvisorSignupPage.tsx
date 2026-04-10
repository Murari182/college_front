import { LanguageMultiSelect } from "@/components/signup/LanguageMultiSelect";

import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { OTHER_LANGUAGE_LABEL } from "@/constants/signupLanguages";
import { getFirebaseAuth } from "@/lib/firebase";
import { extractAdvisorFieldsFromIdCard } from "@/lib/idCardOcr";
import {
  formatFirebaseAuthError,
} from "@/lib/firebaseAuthErrors";
import { useEmailVerificationSync } from "@/hooks/useEmailVerificationSync";
import { finalizeFirebaseSignup } from "@/lib/firebaseSignupFinalize";
import { CollegeIdImageUploadBox } from "@/components/CollegeIdImageUploadBox";
import {
  registerAdvisor,
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
];

const EMAIL_TO_COLLEGE: Record<string, string> = {

  // IITs
  "rgipt.ac.in": "RAJIV GANDHI INSTITUTE OF PETROLEUM TECHNOLOGY(RGIPT)",
  "iitd.ac.in": "IIT Delhi",
  "iitb.ac.in": "IIT Bombay",
  "iitm.ac.in": "IIT Madras",
  "iitkgp.ac.in": "IIT Kharagpur",
  "iitk.ac.in": "IIT Kanpur",
  "iitg.ac.in": "IIT Guwahati",
  "iith.ac.in": "IIT Hyderabad",
  "iitr.ac.in": "IIT Roorkee",
  "iitbhu.ac.in": "IIT BHU",
  "iitism.ac.in": "IIT Dhanbad",
  "iiti.ac.in": "IIT Indore",
  "iitgn.ac.in": "IIT Gandhinagar",
  "iitp.ac.in": "IIT Patna",
  "iitrpr.ac.in": "IIT Ropar",
  "iitbbs.ac.in": "IIT Bhubaneswar",
  "iitj.ac.in": "IIT Jodhpur",
  "iitmandi.ac.in": "IIT Mandi",
  "iittp.ac.in": "IIT Tirupati",
  "iitpkd.ac.in": "IIT Palakkad",
  "iitbhilai.ac.in": "IIT Bhilai",
  "iitgoa.ac.in": "IIT Goa",
  "iitjammu.ac.in": "IIT Jammu",
  "iitdh.ac.in": "IIT Dharwad",

  //NITS
  "nitt.edu": "NIT Trichy",
  "nitk.ac.in": "NIT Surathkal",
  "nitw.ac.in": "NIT Warangal",
  "nitrkl.ac.in": "NIT Rourkela",
  "nitc.ac.in": "NIT Calicut",
  "mnit.ac.in": "MNIT Jaipur",
  "mnnit.ac.in": "MNNIT Allahabad",
  "manit.ac.in": "MANIT Bhopal",
  "vnit.ac.in": "VNIT Nagpur",
  "svnit.ac.in": "SVNIT Surat",
  "nitdgp.ac.in": "NIT Durgapur",
  "nitj.ac.in": "NIT Jalandhar",
  "nitjsr.ac.in": "NIT Jamshedpur",
  "nitp.ac.in": "NIT Patna",
  "nitrr.ac.in": "NIT Raipur",
  "nitsri.ac.in": "NIT Srinagar",
  "nits.ac.in": "NIT Silchar",
  "nith.ac.in": "NIT Hamirpur",
  "nita.ac.in": "NIT Agartala",

  //IITS
  "iiith.ac.in": "IIIT Hyderabad",
  "iiitb.ac.in": "IIIT Bangalore",
  "iiitd.ac.in": "IIIT Delhi",
  "iiita.ac.in": "IIIT Allahabad",
  "iiitm.ac.in": "IIITM Gwalior",
  "iiitdmj.ac.in": "IIITDM Jabalpur",
  "iiitdm.ac.in": "IIITDM Kancheepuram",
  "iiitk.ac.in": "IIIT Kurnool",
  "iiits.ac.in": "IIIT Sri City",
  "iiitvadodara.ac.in": "IIIT Vadodara",
  "iiitn.ac.in": "IIIT Nagpur",
  "iiitl.ac.in": "IIIT Lucknow",
  "iiitdwd.ac.in": "IIIT Dharwad",
  "iiitpune.ac.in": "IIIT Pune",
  "iiitbh.ac.in": "IIIT Bhagalpur",
  "iiitbhopal.ac.in": "IIIT Bhopal",
  "iiitsurat.ac.in": "IIIT Surat",
  "iiitu.ac.in": "IIIT Una",
  "iiitkottayam.ac.in": "IIIT Kottayam",
  "iiitranchi.ac.in": "IIIT Ranchi",
  "iiitkota.ac.in": "IIIT Kota",
  "iiitg.ac.in": "IIIT Guwahati",
  "iiitsonepat.ac.in": "IIIT Sonepat",
  "iiitmanipur.ac.in": "IIIT Manipur",
  "iiitkalyani.ac.in": "IIIT Kalyani",
  "iiitt.ac.in": "IIIT Tiruchirappalli",
  "iiitr.ac.in": "IIIT Raichur",
  "iiitagartala.ac.in": "IIIT Agartala",

  //IISERS

  "iiserkol.ac.in": "IISER Kolkata",
  "iiserpune.ac.in": "IISER Pune",
  "iiserb.ac.in": "IISER Bhopal",
  "iisermohali.ac.in": "IISER Mohali",
  "iisertvm.ac.in": "IISER Thiruvananthapuram",
  "iisertirupati.ac.in": "IISER Tirupati",
  "iiserberhampur.ac.in": "IISER Berhampur",

  "bits-pilani.ac.in": "BITS Pilani", // bits

  "dtu.ac.in": "DTU Delhi",

  "nsut.ac.in": "NSUT Delhi", // -------- TOP PRIVATE COLLEGES (INDIA) --------
  
  "vit.ac.in": "VIT Vellore",

  "vitstudent.ac.in": "VIT Vellore",


  "srm.edu.in": "SRM University",

  "amity.edu": "Amity University",

  "manipal.edu": "Manipal Institute of Technology",

  "learner.manipal.edu": "Manipal University",

  "shivnadaredu.com": "Shiv Nadar University"
  ,
  "snu.edu.in": "Shiv Nadar University",

  "ashoka.edu.in": "Ashoka University",

  "flame.edu.in": "FLAME University",

  "opju.ac.in": "OP Jindal Global University"
  ,
  "jgu.edu.in": "Jindal Global University",

  "nmims.edu": "NMIMS Mumbai",

  "christuniversity.in": "Christ University",

  "symbiosis.ac.in": "Symbiosis International University",

  "siu.edu.in": "Symbiosis University",

  "mitwpu.edu.in": "MIT World Peace University",

  "kiit.ac.in": "KIIT University",

  "lpu.in": "Lovely Professional University",

  "upes.ac.in": "UPES Dehradun",

  "bennett.edu.in": "Bennett University",

  "plaksha.edu.in": "Plaksha University",

  "mahindrauniversity.edu.in": "Mahindra University",

  "spit.ac.in": "SPIT Mumbai",

  "thapar.edu": "Thapar Institute of Engineering and Technology",

  "iitmjanakpuri.com": "IITM Delhi (Private)",

  "iitm.edu": "IITM (various private institutes - handle carefully)",

  // Design / niche institutes
  "nift.ac.in": "NIFT",
  "nid.edu": "NID",
  "iihmr.edu.in": "IIHMR University",

  // Business schools
  "isb.edu": "Indian School of Business",
  "mdi.ac.in": "MDI Gurgaon",
  "greatlakes.edu.in": "Great Lakes Institute of Management",
  "spjimr.org": "SPJIMR Mumbai",

  // -------- Top State Colleges --------
"coep.org.in": "COEP Pune",
"vjti.ac.in": "VJTI Mumbai",
"jadavpuruniversity.in": "Jadavpur University",
"annauniv.edu": "Anna University",
"osmania.ac.in": "Osmania University",
"msrit.edu": "MS Ramaiah Institute of Technology",
"rvce.edu.in": "RV College of Engineering",
"pes.edu": "PES University",
"bmsce.ac.in": "BMS College of Engineering",
"krea.edu.in": "Krea University",

// Engineering-focused / others (avoid duplicate domain keys above)
"shivajicollege.ac.in": "Shivaji College",
"jainuniversity.ac.in": "Jain University",

"srmist.edu.in": "SRM Institute of Science and Technology (Kattankulathur, Ramapuram, Vadapalani, NCR)",
"srmrmp.edu.in": "SRM IST Ramapuram Campus",
"srmistvdp.edu.in": "SRM IST Vadapalani Campus",
"srmup.in": "SRM IST Delhi-NCR (Modinagar)",
"srmtrichy.edu.in": "SRM IST Tiruchirappalli (Trichy)",

"srmap.edu.in": "SRM University AP (Amaravati)",
"srmuniversity.ac.in": "SRM University Haryana (Sonepat)",
"srmus.ac.in": "SRM University Sikkim (Gangtok)",

"trp.srmtrichy.edu.in": "SRM TRP Engineering College (Trichy)"


};

const HOURLY_TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:00 ${suffix}`;
});
const SESSION_PRICE_OPTIONS = ["100", "150", "200", "250", "300", "350", "400"] as const;

type AdvisorSignupDraft = {
  name: string;
  gender: string;
  collegeEmail: string;
  detectedCollege: string;
  branch: string;
  phone: string;
  upiId: string;
  state: string;
  dateOfBirth: string;
  rollNumber: string;
  studyYearAtSignup: string;
  jeeMainsPercentile: string;
  jeeMainsRank: string;
  jeeAdvancedRank: string;
  bio: string;
  skills: string;
  achievements: string;
  languages: string[];
  languageOther: string;
  sessionPrice: string;
  preferredTimezones: Array<{ from: string; to: string }>;
  idFrontPreview: string | null;
  idFrontFile: File | null;
  idBackPreview: string | null;
  idBackFile: File | null;
  idUploadToken: string;
  referralCode: string;
  acceptedPolicies: boolean;
  signupStep: 1 | 2;
};

let advisorSignupDraft: AdvisorSignupDraft | null = null;

function plusOneHour(timeLabel: string): string {
  const idx = HOURLY_TIME_OPTIONS.indexOf(timeLabel);
  if (idx < 0) return "";
  return HOURLY_TIME_OPTIONS[(idx + 1) % HOURLY_TIME_OPTIONS.length] ?? "";
}

function detectCollege(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "";
  if (EMAIL_TO_COLLEGE[domain]) return EMAIL_TO_COLLEGE[domain];
  for (const key of Object.keys(EMAIL_TO_COLLEGE)) {
    if (domain.includes(key)) return EMAIL_TO_COLLEGE[key];
  }
  return "";
}


export default function AdvisorSignupPage() {
  const navigate = useNavigate();
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [detectedCollege, setDetectedCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [state, setState] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [studyYearAtSignup, setStudyYearAtSignup] = useState("");
  const [jeeMainsPercentile, setJeeMainsPercentile] = useState("");
  const [jeeMainsRank, setJeeMainsRank] = useState("");
  const [jeeAdvancedRank, setJeeAdvancedRank] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [achievements, setAchievements] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageOther, setLanguageOther] = useState("");
  const [sessionPrice, setSessionPrice] = useState("");
  const [preferredTimezones, setPreferredTimezones] = useState<
    Array<{ from: string; to: string }>
  >([
    { from: "", to: "" },
    { from: "", to: "" },
    { from: "", to: "" },
    { from: "", to: "" },
  ]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");
  const [authenticating, setAuthenticating] = useState(false);
  const [refreshingEmail, setRefreshingEmail] = useState(false);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idUploadToken, setIdUploadToken] = useState("");
  const [uploadingIdToS3, setUploadingIdToS3] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extractingIdDetails, setExtractingIdDetails] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, setAuthUser);
  }, []);

  useEffect(() => {
    if (!advisorSignupDraft) return;
    const draft = advisorSignupDraft;
    setName(draft.name);
    setGender(draft.gender);
    setCollegeEmail(draft.collegeEmail);
    setDetectedCollege(draft.detectedCollege);
    setBranch(draft.branch);
    setPhone(draft.phone);
    setUpiId(draft.upiId);
    setState(draft.state);
    setDateOfBirth(draft.dateOfBirth);
    setRollNumber(draft.rollNumber);
    setStudyYearAtSignup(draft.studyYearAtSignup);
    setJeeMainsPercentile(draft.jeeMainsPercentile);
    setJeeMainsRank(draft.jeeMainsRank);
    setJeeAdvancedRank(draft.jeeAdvancedRank);
    setBio(draft.bio);
    setSkills(draft.skills);
    setAchievements(draft.achievements);
    setLanguages(draft.languages);
    setLanguageOther(draft.languageOther);
    setSessionPrice(draft.sessionPrice);
    setPreferredTimezones(draft.preferredTimezones);
    setIdFrontPreview(draft.idFrontPreview);
    setIdFrontFile(draft.idFrontFile);
    setIdBackPreview(draft.idBackPreview);
    setIdBackFile(draft.idBackFile);
    setIdUploadToken(draft.idUploadToken);
    setReferralCode(draft.referralCode);
    setAcceptedPolicies(draft.acceptedPolicies);
    setSignupStep(draft.signupStep);
  }, []);

  // Keep local email in sync when a session exists (e.g. refresh).
  useEffect(() => {
    const u = authUser?.email;
    if (!u) return;
    setCollegeEmail(u);
    setDetectedCollege(detectCollege(u));
  }, [authUser]);

  useEmailVerificationSync(authUser, setAuthUser, bump);

  useEffect(() => {
    advisorSignupDraft = {
      name,
      gender,
      collegeEmail,
      detectedCollege,
      branch,
      phone,
      upiId,
      state,
      dateOfBirth,
      rollNumber,
      studyYearAtSignup,
      jeeMainsPercentile,
      jeeMainsRank,
      jeeAdvancedRank,
      bio,
      skills,
      achievements,
      languages,
      languageOther,
      sessionPrice,
      preferredTimezones,
      idFrontPreview,
      idFrontFile,
      idBackPreview,
      idBackFile,
      idUploadToken,
      referralCode,
      acceptedPolicies,
      signupStep,
    };
  }, [
    name,
    gender,
    collegeEmail,
    detectedCollege,
    branch,
    phone,
    upiId,
    state,
    dateOfBirth,
    rollNumber,
    studyYearAtSignup,
    jeeMainsPercentile,
    jeeMainsRank,
    jeeAdvancedRank,
    bio,
    skills,
    achievements,
    languages,
    languageOther,
    sessionPrice,
    preferredTimezones,
    idFrontPreview,
    idFrontFile,
    idBackPreview,
    idBackFile,
    idUploadToken,
    referralCode,
    acceptedPolicies,
    signupStep,
  ]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    const signedIn = authUser?.email;
    // Update state synchronously so the controlled input stays responsive; sign-out
    // in the background after a mismatch (awaiting before setState felt "stuck").
    setCollegeEmail(next);
    setDetectedCollege(detectCollege(next));
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

  const handleSendSignupOtp = async () => {
    if (!collegeEmail.trim() || !detectedCollege) {
      alert(
        "Use a recognized college email domain so we can detect your institution.",
      );
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
    const trimmedCollege = collegeEmail.trim();
    const auth = getFirebaseAuth();
    if (
      auth.currentUser &&
      auth.currentUser.email?.toLowerCase() === trimmedCollege.toLowerCase()
    ) {
      alert(
        "You're already signed in with this college email. Continue below or sign out to use a different email.",
      );
      return;
    }
    setAuthenticating(true);
    try {
      const res = await requestSignupOtp("advisor", trimmedCollege);
      setSignupOtpSent(true);
      alert(
        [
          `We sent a 6-digit code to ${trimmedCollege}.`,
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
    const trimmedCollege = collegeEmail.trim();
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
      await verifySignupOtp("advisor", trimmedCollege, signupOtp.trim(), password);
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, trimmedCollege, password);
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
    setCollegeEmail("");
    setDetectedCollege("");
    setPassword("");
    setConfirmPassword("");
    setSignupOtpSent(false);
    setSignupOtp("");
  };

  const handleIdUpload = (side: "front" | "back", file: File) => {
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
    } else {
      if (idBackPreview?.startsWith("blob:")) URL.revokeObjectURL(idBackPreview);
      setIdBackPreview(objectUrl);
      setIdBackFile(file);
      setIdUploadToken("");
    }
  };

  useEffect(() => {
    if (!idFrontFile || !idBackFile) return;
    if (idUploadToken) return;
    let cancelled = false;

    const runTempUpload = async () => {
      setUploadingIdToS3(true);
      try {
        const uploaded = await uploadCollegeIdPairToS3Temp("advisor", idFrontFile, idBackFile);
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
        const extracted = await extractAdvisorFieldsFromIdCard(
          idFrontFile,
          idBackFile,
          INDIAN_STATES,
        );
        if (cancelled) return;

        if (extracted.fullName && !name.trim()) setName(extracted.fullName);
        if (extracted.gender && !gender) setGender(extracted.gender);
        if (extracted.collegeEmail && !collegeEmail.trim()) {
          setCollegeEmail(extracted.collegeEmail);
          setDetectedCollege(detectCollege(extracted.collegeEmail));
        }
        if (extracted.branch && !branch.trim()) setBranch(extracted.branch);
        if (extracted.mobileNumber && !phone.trim()) setPhone(extracted.mobileNumber);
        if (extracted.state && !state) setState(extracted.state);
        if (extracted.dateOfBirth && !dateOfBirth.trim()) setDateOfBirth(extracted.dateOfBirth);
        if (extracted.rollNumber && !rollNumber.trim()) setRollNumber(extracted.rollNumber);
      } catch {
        if (!cancelled) {
          alert("Could not auto-extract all details from the ID. Please fill missing fields manually.");
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

  const handleNextStep = () => {
    if (
      !idFrontFile ||
      !idBackFile ||
      !name ||
      !gender ||
      !collegeEmail ||
      !detectedCollege ||
      !branch ||
      !phone ||
      !upiId.trim() ||
      !state
    ) {
      alert("Please complete all required personal details before continuing.");
      return;
    }
    if (!password || password !== confirmPassword) {
      alert("Please enter matching password and confirm password.");
      return;
    }
    if (!authUser || !emailOk) {
      alert("Please verify your college email first, then continue to education details.");
      return;
    }
    setSignupStep(2);
  };

  const handleSignup = async () => {
    const selectedPreferredTimezones = preferredTimezones
      .filter((slot) => slot.from && slot.to && slot.from !== slot.to)
      .map((slot) => `${slot.from} - ${slot.to}`);

    if (
      !name ||
      !gender ||
      !collegeEmail ||
      !detectedCollege ||
      !branch ||
      !phone ||
      !upiId.trim() ||
      !state ||
      !studyYearAtSignup ||
      !jeeMainsPercentile ||
      !jeeMainsRank ||
      !bio ||
      !sessionPrice ||
      selectedPreferredTimezones.length < 4
    ) {
      alert(
        "Please fill all required fields and select at least 4 preferred time slots.",
      );
      return;
    }
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) {
      alert("Send the verification code, enter it, and sign in before creating your profile.");
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
    if (!idFrontFile || !idBackFile) {
      alert("Please upload both sides of your college ID!");
      return;
    }
    if (Number(sessionPrice) > 200) {
      alert(
        "At initial signup, you can select up to Rs 200 only. Unlock rules: Rs 250 (>=2 sessions), Rs 300 (>=5 sessions), Rs 350 (>=8 sessions), Rs 400 (>=10 sessions).",
      );
      return;
    }
    if (languages.length === 0) {
      alert("Please select at least one language.");
      return;
    }
    if (languages.includes(OTHER_LANGUAGE_LABEL) && !languageOther.trim()) {
      alert('Please specify your language(s) when "Other" is selected.');
      return;
    }
    if (!acceptedPolicies) {
      alert("Please accept Terms, About, and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await finalizeFirebaseSignup(collegeEmail.trim(), password, name);
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
          "advisor",
          idFrontFile,
          idBackFile,
        );
        collegeIdFrontKey = uploaded.collegeIdFrontKey;
        collegeIdBackKey = uploaded.collegeIdBackKey;
      }

      const studyYear = Number.parseInt(studyYearAtSignup, 10);
      const studyYearAnchorDate = new Date().toISOString();

      const payload: Record<string, unknown> = {
        name,
        gender,
        collegeEmail: collegeEmail.trim(),
        detectedCollege,
        branch,
        phone,
        upiId: upiId.trim(),
        state,
        dateOfBirth,
        rollNumber,
        jeeMainsPercentile,
        jeeMainsRank,
        bio,
        sessionPrice,
        current_study_year: studyYear,
        study_year_at_signup: studyYear,
        study_year_anchor_date: studyYearAnchorDate,
        collegeIdAcknowledged: true,
        languages,
        preferredTimezones: selectedPreferredTimezones,
      };
      if (idUploadToken) {
        payload.idUploadToken = idUploadToken;
      } else {
        payload.collegeIdFrontKey = collegeIdFrontKey;
        payload.collegeIdBackKey = collegeIdBackKey;
      }
      const skillsValue = skills.trim();
      if (skillsValue) payload.skills = skillsValue;
      const dob = dateOfBirth.trim();
      if (dob) payload.dateOfBirth = dob;
      const rn = rollNumber.trim();
      if (rn) payload.rollNumber = rn;
      const ja = jeeAdvancedRank.trim();
      if (ja) payload.jeeAdvancedRank = ja;
      const ach = achievements.trim();
      if (ach) payload.achievements = ach;
      const lo = languageOther.trim();
      if (lo) payload.languageOther = lo;
      if (referralCode.trim()) payload.referralCode = referralCode.trim();

      const saved = await registerAdvisor(token, payload);
      advisorSignupDraft = null;
      navigate({
        to: "/advisor/dashboard",
        state: { profileSavedId: saved.id } as Record<string, unknown>,
      });
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
      title="Advisor Sign Up"
      subtitle="Create your advisor account to start listing sessions."
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border/60 bg-background/30 px-3 py-2 text-xs text-muted-foreground">
          Step {signupStep} of 2  -  {signupStep === 1 ? "Personal Details" : "Education Details"}
        </div>

        <div className={signupStep === 1 ? "flex flex-col gap-4" : "hidden"}>
        <div className="border border-border/60 rounded-xl bg-background/20 p-3">
          <p className="text-sm font-semibold text-foreground mb-1">
            College ID Card Upload <span className="text-neon-orange">*</span>
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Upload front and back first. We auto-fill details from your ID; you can edit everything.
          </p>
          <div className="flex gap-3">
            <CollegeIdImageUploadBox
              variant="orange"
              label="Front Side"
              preview={idFrontPreview}
              onUpload={(file) => handleIdUpload("front", file)}
              onRemove={() => {
                if (idFrontPreview?.startsWith("blob:")) URL.revokeObjectURL(idFrontPreview);
                setIdFrontPreview(null);
                setIdFrontFile(null);
                setIdUploadToken("");
              }}
            />
            <CollegeIdImageUploadBox
              variant="orange"
              label="Back Side"
              preview={idBackPreview}
              onUpload={(file) => handleIdUpload("back", file)}
              onRemove={() => {
                if (idBackPreview?.startsWith("blob:")) URL.revokeObjectURL(idBackPreview);
                setIdBackPreview(null);
                setIdBackFile(null);
                setIdUploadToken("");
              }}
            />
          </div>
          {extractingIdDetails ? (
            <p className="text-xs text-neon-orange mt-2">Extracting details from ID card...</p>
          ) : null}
          {uploadingIdToS3 ? (
            <p className="text-xs text-neon-orange mt-1">Securing ID upload...</p>
          ) : idUploadToken ? (
            <p className="text-xs text-green-500 mt-1">ID uploaded securely (temporary).</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-border/60 bg-background/30 px-3 py-3 space-y-2">
          <label
            htmlFor="advisor-signup-referral"
            className="text-sm text-muted-foreground"
          >
            Referral code <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            id="advisor-signup-referral"
            type="text"
            placeholder="e.g. ADV-AB12CD34"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            If an advisor invited you, enter their code from Refer &amp; Earn. They earn 3% on your
            session fees for up to 5 sessions; the referrer must have attended at least 2 sessions.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            Full Name <span className="text-neon-orange">⬢</span>
          </label>
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            Gender <span className="text-neon-orange">⬢</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            College Email <span className="text-neon-orange">⬢</span>
          </label>
          <input
            type="email"
            placeholder="you@college.edu.in"
            autoComplete="email"
            value={collegeEmail}
            onChange={handleEmailChange}
            className={`bg-background border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none transition-colors ${
              authUser && collegeEmail === authUser.email
                ? "border-green-500/60"
                : detectedCollege
                  ? "border-neon-orange focus:border-neon-orange"
                  : "border-border focus:border-neon-orange"
            }`}
          />
          {!authUser && !detectedCollege && collegeEmail.includes("@") ? (
            <p className="text-xs text-amber-500/90 mt-1">
              We could not detect a college from this domain. Try your official
              institute email.
            </p>
          ) : null}
        </div>

        <PasswordField
          id="advisor-signup-password"
          label={
            <>
              Password <span className="text-neon-orange">⬢</span>
            </>
          }
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={setPassword}
          variant="orange"
        />

        <PasswordField
          id="advisor-signup-password-confirm"
          label={
            <>
              Confirm password <span className="text-neon-orange">⬢</span>
            </>
          }
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          variant="orange"
        />

        {!authUser ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your college email and password, then tap <strong className="text-foreground">Send email OTP</strong>.
              We email you a one-time code; enter it below to sign in.
            </p>
            {!signupOtpSent ? (
              <Button
                type="button"
                onClick={handleSendSignupOtp}
                disabled={authenticating || !detectedCollege}
                className="w-full bg-neon-orange hover:bg-neon-orange/95 text-black font-semibold rounded-xl shadow-lg shadow-neon-orange/30 border border-orange-400/90 ring-1 ring-white/10 disabled:opacity-50 disabled:shadow-none"
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
                  htmlFor="advisor-signup-otp"
                >
                  Email OTP
                </label>
                <input
                  id="advisor-signup-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors tracking-widest"
                />
                <Button
                  type="button"
                  onClick={handleVerifySignupOtp}
                  disabled={authenticating || signupOtp.length < 6}
                  className="w-full bg-neon-orange hover:bg-neon-orange/95 text-black font-semibold rounded-xl shadow-lg shadow-neon-orange/30 border border-orange-400/90 ring-1 ring-white/10 disabled:opacity-50 disabled:shadow-none"
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
                    className="text-xs underline text-neon-orange disabled:opacity-50"
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
                className="text-xs underline text-neon-orange disabled:opacity-50"
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
          <label className="text-sm text-muted-foreground">
            College <span className="text-neon-orange">⬢</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Auto-detected from your email"
              value={detectedCollege}
              readOnly
              className={`w-full bg-background border rounded-xl px-4 py-2 text-sm transition-colors cursor-not-allowed ${
                detectedCollege
                  ? "border-green-500 text-green-400"
                  : "border-border text-muted-foreground"
              }`}
            />
            {detectedCollege && (
              <CheckCircle
                size={16}
                className="absolute right-3 top-2.5 text-green-500"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            Branch <span className="text-neon-orange">⬢</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science, Petroleum Engineering"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="advisor-signup-mobile"
            className="text-sm text-muted-foreground"
          >
            Mobile number <span className="text-neon-orange">⬢</span>
          </label>
          <input
            id="advisor-signup-mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="advisor-signup-upi"
            className="text-sm text-muted-foreground"
          >
            UPI ID <span className="text-neon-orange">⬢</span>
          </label>
          <input
            id="advisor-signup-upi"
            type="text"
            placeholder="example@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            State <span className="text-neon-orange">⬢</span>
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
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
          className="w-full bg-neon-orange hover:bg-neon-orange/90 text-background font-semibold rounded-xl px-5"
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

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            Date of birth <span className="text-xs">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            Roll number <span className="text-xs">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Your institute roll number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            Current studying year <span className="text-neon-orange">⬢</span>
          </label>
          <select
            value={studyYearAtSignup}
            onChange={(e) => setStudyYearAtSignup(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
          >
            <option value="">Select current year</option>
            <option value="1">1st year</option>
            <option value="2">2nd year</option>
            <option value="3">3rd year</option>
            <option value="4">4th year</option>
            <option value="5">5th year</option>
          </select>
          <p className="text-xs text-muted-foreground">
            We auto-promote this every May after signup.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-muted-foreground">
            JEE Mains <span className="text-neon-orange">⬢</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Percentile (e.g. 98.5)"
              value={jeeMainsPercentile}
              onChange={(e) => setJeeMainsPercentile(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
            />
            <input
              type="number"
              placeholder="Rank"
              value={jeeMainsRank}
              onChange={(e) => setJeeMainsRank(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">
            JEE Advanced Rank <span className="text-xs">(optional)</span>
          </label>
          <input
            type="number"
            placeholder="Optional  -  e.g. rank, or leave blank"
            value={jeeAdvancedRank}
            onChange={(e) => setJeeAdvancedRank(e.target.value)}
            className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
          />
          <p className="text-xs text-muted-foreground">
            Not attempted or no rank yet? Leave empty  -  you can still create
            your account.
          </p>
        </div>

        {/* Bio Section */}
        <div className="border-t border-border/50 pt-4 mt-2">
          <p className="text-sm font-semibold text-foreground mb-4">
            Your Profile Info
          </p>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-muted-foreground">
              Bio <span className="text-neon-orange">*</span>
            </label>
            <textarea
              placeholder="Tell students about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/500
            </p>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-muted-foreground">
              Skills <span className="text-xs">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Coding, Data Science, CAD, Public Speaking"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate skills with commas
            </p>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm text-muted-foreground">
              Achievements <span className="text-xs">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Smart India Hackathon winner, Dean's List..."
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={3}
              className="bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors resize-none"
            />
          </div>

          <div className="mb-4">
            <LanguageMultiSelect
              variant="orange"
              label="Languages I speak"
              optionalHint="*"
              value={languages}
              onChange={setLanguages}
              otherDetail={languageOther}
              onOtherDetailChange={setLanguageOther}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">
              Session Price (Rs) <span className="text-neon-orange">*</span>
            </label>
            <select
              value={sessionPrice}
              onChange={(e) => setSessionPrice(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
            >
              <option value="">Select amount</option>
              {SESSION_PRICE_OPTIONS.map((amount) => {
                const numeric = Number(amount);
                const locked = numeric > 200;
                const withCrown = numeric >= 250;
                return (
                  <option key={`session-price-${amount}`} value={amount} disabled={locked}>
                    {withCrown ? `Rs ${amount}` : `Rs ${amount}`}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              How much you charge per session
            </p>
            <p className="text-xs text-amber-500/90">
              Note: At initial signup, amounts above Rs 200 are locked. Unlock rules by sessions attended: Rs 250 (at least 2 sessions), Rs 300 (at least 5 sessions), Rs 350 (at least 8 sessions), Rs 400 (at least 10 sessions).
            </p>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="text-sm text-muted-foreground">
              Preferred Timezones / Time Slots{" "}
              <span className="text-neon-orange">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {preferredTimezones.map((slot, index) => (
                <div key={`timezone-slot-${index}`} className="grid grid-cols-2 gap-2">
                  <select
                    value={slot.from}
                    onChange={(e) =>
                      setPreferredTimezones((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                from: e.target.value,
                                // Keep slot duration fixed to 1 hour from selected start.
                                to: plusOneHour(e.target.value),
                              }
                            : item,
                        ),
                      )
                    }
                    className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
                  >
                    <option value="">From</option>
                    {HOURLY_TIME_OPTIONS.map((time) => (
                      <option key={`from-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <select
                    value={slot.to}
                    onChange={(e) =>
                      setPreferredTimezones((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, to: e.target.value } : item,
                        ),
                      )
                    }
                    className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-neon-orange transition-colors cursor-pointer"
                  >
                    <option value="">To</option>
                    {HOURLY_TIME_OPTIONS.map((time) => (
                      <option key={`to-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() =>
                  setPreferredTimezones((prev) => [...prev, { from: "", to: "" }])
                }
                className="text-xs underline text-neon-orange"
              >
                + Add another slot
              </button>
              {preferredTimezones.length > 4 ? (
                <button
                  type="button"
                  onClick={() =>
                    setPreferredTimezones((prev) =>
                      prev.length > 4 ? prev.slice(0, -1) : prev,
                    )
                  }
                  className="text-xs underline text-muted-foreground"
                >
                  Remove last slot
                </button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select from/to time for each slot (1-hour options). Minimum 4 slots required.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Providing a greater number of available time slots can significantly enhance an advisor's chances of receiving more session bookings by increasing accessibility and flexibility for students.
            </p>
          </div>
        </div>

        <div className="mt-2">
          <div className="rounded-xl border border-border/60 bg-background/20 px-3 py-3 mb-3">
            <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer leading-relaxed">
              <input
                type="checkbox"
                checked={acceptedPolicies}
                onChange={(e) => setAcceptedPolicies(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border border-border bg-background accent-[#FF6B2C]"
              />
              <span>
                I accept the{" "}
                <Link to="/terms" target="_blank" rel="noreferrer" className="text-neon-orange hover:underline">
                  Terms
                </Link>
                {", "}
                <Link to="/about" target="_blank" rel="noreferrer" className="text-neon-orange hover:underline">
                  About
                </Link>
                {" and "}
                <Link to="/privacy" target="_blank" rel="noreferrer" className="text-neon-orange hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>
          <Button
            onClick={handleSignup}
            disabled={submitting || !acceptedPolicies}
            className="w-full bg-neon-orange hover:bg-neon-orange/90 text-background font-semibold rounded-xl px-5 glow-orange transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-sm text-muted-foreground text-center mt-3">
            Already have an account?{" "}
            <Link
              to="/auth/advisor/login"
              className="text-neon-orange hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
        </div>
      </div>
    </AuthShell>
  );
}
