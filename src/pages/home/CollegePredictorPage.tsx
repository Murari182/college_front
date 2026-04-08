import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, GraduationCap, Table2 } from "lucide-react";
import { motion } from "motion/react";

const JOSAA_2025_URL =
  "https://docs.google.com/spreadsheets/d/1UOihhPYYDPUcLN5coF2-wGxlR7DJQxGR/edit?usp=sharing&ouid=102708880640851630376&rtpof=true&sd=true";

const JOSAA_2024_URL =
  "https://docs.google.com/spreadsheets/d/1il-AcBuWqMUDY6uvaXmOGATRA1bO1Gme/edit?usp=sharing&ouid=102708880640851630376&rtpof=true&sd=true";

export default function CollegePredictorPage() {
  return (
    <div className="relative min-h-screen px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 175) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, oklch(0.67 0.19 40) 0%, transparent 70%)",
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

      <div className="relative z-10 w-full max-w-2xl mx-auto pt-24 sm:pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} aria-hidden />
            Back to home
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground mb-4">
            <GraduationCap size={14} className="text-neon-teal" aria-hidden />
            Tools
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            College Predictor
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Open official JoSAA cutoff data in Google Sheets and use a temporary filter view to search safely without
            affecting other students.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="rounded-2xl border border-border/70 bg-background/50 backdrop-blur-sm p-6 sm:p-8 mb-8"
        >
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-foreground mb-5">
            <span className="shrink-0" aria-hidden>
              🔍
            </span>
            How to Search the JoSAA Cutoff Database
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              To keep our data secure and ensure multiple students can search at the exact same time without
              interrupting each other, this database is set to <span className="text-foreground font-medium">View Only</span>.
            </p>
            <p>
              However, you can still easily search and filter the data using a{" "}
              <span className="text-foreground font-medium">Temporary Filter View</span>. Here is how to do it in 3
              quick steps:
            </p>

            <div className="space-y-5 pt-1">
              <div>
                <h3 className="text-foreground font-semibold text-base mb-2">Step 1: Open the Database</h3>
                <p>
                  Click one of the JoSAA sheet links in the <span className="text-foreground font-medium">JoSAA Cutoff Data</span>{" "}
                  section below to open the official College Connects JoSAA Database in Google Sheets.
                </p>
              </div>

              <div>
                <h3 className="text-foreground font-semibold text-base mb-2">Step 2: Create Your Private Filter</h3>
                <p className="mb-3">
                  Because the sheet is View Only, the normal filter button is locked. Instead, look at the top menu
                  bar:
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-0.5 marker:text-neon-teal marker:font-semibold">
                  <li>
                    Click on <span className="text-foreground font-medium">Data</span>.
                  </li>
                  <li>
                    Hover over <span className="text-foreground font-medium">Filter views</span>.
                  </li>
                  <li>
                    Click on <span className="text-foreground font-medium">Create new temporary filter view</span>.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-foreground font-semibold text-base mb-2">Step 3: Search Your Dream Colleges!</h3>
                <p className="mb-3">
                  The edges of your screen will turn dark grey. This means you are now in a private, temporary
                  workspace!
                </p>
                <p className="mb-3">
                  You will now see the filter icons (little funnels) at the top of every column.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-0.5 marker:text-neon-teal">
                  <li>
                    Click the funnel on the <span className="text-foreground font-medium">Institute Name</span> column to
                    search for specific IITs or NITs.
                  </li>
                  <li>
                    Click the funnel on the <span className="text-foreground font-medium">Program Name</span> to filter
                    for CSE, Electrical, etc.
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-xs sm:text-sm pt-4 border-t border-border/50 text-muted-foreground">
              <span className="text-foreground font-medium">Note:</span> Since this is a temporary view, your filtering
              will not affect anyone else looking at the sheet, and it will disappear as soon as you close the tab.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="rounded-2xl border border-border/70 bg-background/50 backdrop-blur-sm p-6 sm:p-8"
        >
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-foreground mb-5">
            <Table2 size={22} className="text-neon-orange shrink-0" aria-hidden />
            JoSAA Cutoff Data
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Open the sheet for the year you need. Each link opens in a new tab.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <a
              href={JOSAA_2025_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neon-teal/50 bg-neon-teal/10 hover:bg-neon-teal/20 text-foreground font-medium px-5 py-3 text-sm transition-colors"
            >
              JoSAA 2025
              <ExternalLink size={16} className="opacity-80" aria-hidden />
            </a>
            <div className="flex flex-col gap-1.5 sm:items-start">
              <a
                href={JOSAA_2024_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border hover:border-neon-orange/50 hover:bg-neon-orange/5 text-foreground font-medium px-5 py-3 text-sm transition-colors w-full sm:w-auto"
              >
                JoSAA 2024
                <ExternalLink size={16} className="opacity-80" aria-hidden />
              </a>
              <p className="text-xs text-muted-foreground px-1">
                For JoSAA 2024 or 2025: if the sheet asks for a password, use <span className="font-mono text-foreground">1234</span>.
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-5">
            After opening a sheet, follow the steps above to create a temporary filter view and narrow down institutes
            and programs.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
