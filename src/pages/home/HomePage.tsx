import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getSessionAccessToken } from "@/lib/restApi";
import HeroSection from "../../sections/HeroSection";
import HowItWorksSection from "../../sections/HowItWorksSection";
import WhySection from "../../sections/WhySection";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Only auto-redirect if there's no hash — hash links (#how-it-works, #why-us)
    // should always show the section, even for logged-in users.
    if (window.location.hash) return;

    if (getSessionAccessToken() && !window.location.hash) {
      const role = localStorage.getItem("user_role");
      if (role === "student") {
        navigate({ to: "/student/dashboard" });
      } else if (role === "advisor") {
        navigate({ to: "/advisor/dashboard" });
      }
    }
  }, [navigate]);

  return (
    <div className="bg-white">
      <HeroSection />
      <HowItWorksSection />
      <WhySection />
    </div>
  );
}