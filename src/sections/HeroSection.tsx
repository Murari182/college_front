import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useSpring, useAnimation } from "motion/react";
import { ArrowRight, Star, ShieldCheck, Award, MessageSquare } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getAdvisorsDirectory, type AdvisorDirectoryItem } from "@/lib/restApi";

const MOCK_ADVISORS: AdvisorDirectoryItem[] = [
  { id: "1", name: "Priya Sharma", college: "IIT Bombay", branch: "Computer Science", session_price: "299", languages: ["English", "Hindi"] },
  { id: "2", name: "Arjun Mehta", college: "BITS Pilani", branch: "Mechanical Eng.", session_price: "249", languages: ["English", "Hindi"] },
  { id: "3", name: "Ananya Iyer", college: "NIT Trichy", branch: "Electronics", session_price: "199", languages: ["English", "Tamil"] },
  { id: "4", name: "Rohan Das", college: "IIT Delhi", branch: "Electrical Eng.", session_price: "349", languages: ["English", "Bengali"] },
  { id: "5", name: "Sneha Reddy", college: "IIT Madras", branch: "Chemical Eng.", session_price: "299", languages: ["English", "Telugu"] },
  { id: "6", name: "Vikram Malhotra", college: "DTU Delhi", branch: "Software Eng.", session_price: "249", languages: ["English", "Punjabi"] },
];

function Floating3DCard({ 
  advisor, 
  index, 
  scrollProgress, 
  constraintsRef 
}: { 
  advisor: AdvisorDirectoryItem; 
  index: number; 
  scrollProgress: any;
  constraintsRef: React.RefObject<HTMLDivElement>;
}) {
  const [zIndex, setZIndex] = useState(index + 1);
  const controls = useAnimation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Base constants
  const xOffset = [ -120, 120, -150, 150, -80, 80 ][index % 6];
  const zOffset = [ 50, -50, 100, -100, 150, -150 ][index % 6];
  
  // Drift targets
  const floatX = [xOffset - 25, xOffset + 25, xOffset - 25];
  const floatY = [index % 2 === 0 ? -20 : 20, index % 2 === 0 ? 20 : -20, index % 2 === 0 ? -20 : 20];
  
  // High-level scroll transforms
  const rotateX = useTransform(scrollProgress, [0, 1], [0, 20 * (index % 2 === 0 ? 1 : -1)]);
  const rotateY = useTransform(scrollProgress, [0, 1], [0, 25 * (index % 3 === 0 ? 1 : -1)]);
  const translateZ = useTransform(scrollProgress, [0, 1], [zOffset, zOffset + 200]);
  const opacity = useTransform(scrollProgress, [0, 0.7, 1], [1, 1, 0]);
  const yParallax = useTransform(scrollProgress, [0, 1], [0, -200 * (index % 2 === 0 ? 1.2 : 0.8)]);

  // Start the drifting loop
  const startDrift = async () => {
    await controls.start({
      x: floatX,
      y: floatY,
      rotate: [0, index % 2 === 0 ? 1 : -1, 0],
      transition: {
        duration: 7 + (index % 3),
        repeat: Infinity,
        ease: "easeInOut",
      }
    });
  };

  useEffect(() => {
    startDrift();
    return () => controls.stop();
  }, []);

  const handleDragStart = (e: any) => {
    e.stopPropagation();
    controls.stop(); // Stop drifting so user has full control
    setZIndex(10000);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleDragEnd = () => {
    setZIndex(index + 100);
    timerRef.current = setTimeout(async () => {
      // Return to base local center
      await controls.start({ 
        x: 0, 
        y: 0, 
        transition: { type: "spring", stiffness: 50, damping: 20 } 
      });
      // Resume drift
      startDrift();
    }, 5000);
  };

  return (
    <motion.div
      style={{
        y: yParallax,
        z: translateZ,
        rotateX,
        rotateY,
        opacity,
        position: 'absolute',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        zIndex: zIndex,
        x: xOffset, // Use base offset for positioning
      }}
      onPointerDown={() => setZIndex(10000)}
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.05}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        
        whileDrag={{ 
          scale: 1.15, 
          zIndex: 10000, 
          cursor: 'grabbing',
          boxShadow: "0 40px 100px rgba(0,0,0,0.2)" 
        }}
        whileHover={{ scale: 1.05 }}
        
        className="w-56 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] cursor-grab active:cursor-grabbing group hover:border-[#F5A623] transition-colors duration-500 overflow-hidden touch-none"
      >
        {/* Grab Prompt Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/60 backdrop-blur-[1px] transition-all z-20 pointer-events-none">
           <div className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
              <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-white shadow-xl animate-bounce">
                 <MessageSquare size={20} />
              </div>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-900">Grab Card</span>
           </div>
        </div>

        <div className="absolute top-3 right-3 z-30">
           <div className="w-2 h-2 rounded-full bg-[#F5A623] animate-ping" />
        </div>
      
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden ring-4 ring-white shadow-sm">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${advisor.name}`} 
              alt={advisor.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black text-slate-900">{advisor.name}</h4>
            <div className="flex items-center gap-1">
               <ShieldCheck size={8} className="text-emerald-500" />
               <span className="text-[7px] font-black text-slate-400 tracking-widest uppercase">Verified</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-1 mb-3">
          <p className="text-[8px] font-black text-[#F5A623] uppercase tracking-wider">
            {advisor.college}
          </p>
          <p className="text-[9px] font-bold text-slate-400">{advisor.branch}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1 text-slate-900">
            <Star size={8} fill="currentColor" className="text-[#F5A623]" />
            <span className="text-[9px] font-black">4.9</span>
          </div>
          <p className="text-[9px] font-black text-slate-900">₹{advisor.session_price}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const [advisors, setAdvisors] = useState<AdvisorDirectoryItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scrollSmooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Headline Parallax
  const textY = useTransform(scrollSmooth, [0, 1], [0, -150]);
  const textScale = useTransform(scrollSmooth, [0, 1], [1, 0.85]);
  const textOpacity = useTransform(scrollSmooth, [0, 0.8], [1, 0]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdvisorsDirectory();
        if (data && data.length > 0) {
          setAdvisors(data.slice(0, 6)); 
        } else {
          setAdvisors(MOCK_ADVISORS);
        }
      } catch (e) {
        console.error("Hero data load error:", e);
        setAdvisors(MOCK_ADVISORS);
      }
    }
    load();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen lg:min-h-[160vh] bg-white pt-24 lg:pt-32 pb-20 overflow-visible">
      
      {/* Content Container - Use sticky only on large screens */}
      <div className="lg:sticky lg:top-0 lg:h-screen flex items-center overflow-visible">
        
        {/* Background Grid Accent */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div className="grid grid-cols-6 h-full border-l border-slate-900">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-r border-slate-900 h-full" />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content - Parallax disabled on mobile */}
            <motion.div 
              className="flex flex-col items-center lg:items-start"
              style={{ 
                y: typeof window !== 'undefined' && window.innerWidth > 1024 ? textY : 0, 
                scale: typeof window !== 'undefined' && window.innerWidth > 1024 ? textScale : 1, 
                opacity: typeof window !== 'undefined' && window.innerWidth > 1024 ? textOpacity : 1 
              }}
            >
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="w-1 h-6 bg-[#F5A623]" />
                <span className="text-[10px] sm:text-[11px] font-black text-[#F5A623] uppercase tracking-[0.2em] text-center lg:text-left">
                  India's First Student Advisory Platform
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#1E1E1E] leading-[1.1] md:leading-[0.9] mb-6 lg:mb-8 text-center lg:text-left">
                Talk to Real<br className="hidden sm:block" />
                College <span className="mango-italic underline decoration-slate-100 underline-offset-8">Students.</span>
              </h1>

              <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-xl mb-10 lg:mb-12 leading-relaxed text-center lg:text-left">
                Connect with verified undergrads from IITs, BITS, and NITs. Get the real truth before you decide your future.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start w-full sm:w-auto">
                <Link to="/auth/signup" className="btn-primary flex items-center gap-2 px-10 h-14 w-full sm:w-auto justify-center text-sm tracking-widest">
                  FIND YOUR ADVISOR <ArrowRight size={18} />
                </Link>
                <Link to="/how-it-works" className="btn-secondary h-14 flex items-center px-10 uppercase tracking-widest text-[11px] font-black w-full sm:w-auto justify-center">
                  How It Works
                </Link>
              </div>
            </motion.div>

            {/* Right Side: 3D Interaction Hub */}
            <div 
              ref={cloudRef}
              className="relative flex items-center justify-center w-full h-[400px] lg:h-[600px] perspective-[2000px] transform-style-3d rounded-[2rem] lg:rounded-[4rem] mt-12 lg:mt-0"
            >
              <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
                 {/* Visual guide hidden on mobile for cleaner look */}
                 <div className="absolute bottom-6 right-10 text-[9px] font-black text-slate-200 uppercase tracking-widest italic">3D Interaction Zone</div>
              </div>

              {advisors.length > 0 ? (
                advisors.map((advisor, i) => (
                  <Floating3DCard 
                    key={advisor.id || i}
                    advisor={advisor} 
                    index={i} 
                    scrollProgress={scrollSmooth}
                    constraintsRef={cloudRef}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <div className="w-24 h-24 border-2 border-dashed border-[#F5A623] rounded-2xl" />
                  <p className="text-[10px] font-black text-[#F5A623] uppercase tracking-widest">Loading Advisors...</p>
                </div>
              )}
              
              {/* Decorative Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-orange-100/20 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}