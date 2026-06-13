import ceoPhoto from "@/assets/team/ceo.png.jpeg";
import cioPhoto from "@/assets/team/cio.png.jpeg";
import cmoPhoto from "@/assets/team/cmo.png.jpeg";
import ctoPhoto from "@/assets/team/cto.png.jpeg";
import foundingEngineerPhoto from "@/assets/team/founding engineer.png.jpeg";
import { motion } from "motion/react";
import { Users } from "lucide-react";

const TEAM_MEMBERS = [
  { role: "CEO", photo: ceoPhoto },
  { role: "CTO", photo: ctoPhoto },
  { role: "CIO", photo: cioPhoto },
  { role: "CMO", photo: cmoPhoto },
  { role: "Founding Engineer", photo: foundingEngineerPhoto },
] as const;

export default function TeamPage() {
  return (
    <div className="relative min-h-screen px-4 sm:px-6 overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, oklch(0.67 0.19 40) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 175) 0%, transparent 70%)",
            filter: "blur(55px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.6 0.01 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0.01 265) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto pt-28 sm:pt-32 pb-20">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-14 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 mb-4">
            <Users size={14} className="text-[#F5A623]" aria-hidden />
            Leadership
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
            Our <span className="text-[#F5A623]">Team</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            The people building Collegeconnects and shaping how students make confident college decisions.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {TEAM_MEMBERS.map((member, index) => (
            <motion.article
              key={member.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group flex flex-col items-center"
            >
              <div className="w-full aspect-[3/4] max-w-[280px] overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 shadow-sm transition-all duration-300 group-hover:border-[#F5A623]/40 group-hover:shadow-lg">
                <img
                  src={member.photo}
                  alt={member.role}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-5 text-sm sm:text-base font-black uppercase tracking-[0.2em] text-slate-900">
                {member.role}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
