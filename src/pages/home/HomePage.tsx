import { useEffect } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { useNavigate } from "@tanstack/react-router";
import { onAuthStateChanged } from "firebase/auth";
import HeroSection from "../../sections/HeroSection";
import HowItWorksSection from "../../sections/HowItWorksSection";
import WhySection from "../../sections/WhySection";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const role = localStorage.getItem("user_role");
        if (role === "student") {
          navigate({ to: "/student/dashboard" });
        } else if (role === "advisor") {
          navigate({ to: "/advisor/dashboard" });
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="bg-white">
      <HeroSection />
      <HowItWorksSection />
      <WhySection />
    </div>
  );
}