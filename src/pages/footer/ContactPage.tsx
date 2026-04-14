"use client"; // Required if using Next.js App Router

import React, { useState, useEffect } from "react";

export default function Contact() {
  const content = `Contact Us
  

We're here to help you make the right decisions and ensure a smooth experience on CollegeConnect.

Whether you're a student, parent, advisor, or partner — feel free to reach out to us through the appropriate channels below.

General Support

For any platform-related issues, technical problems, account help, or general queries:

📧 support@collegeconnects.co.in

---

Session & Booking Support

Facing issues with session booking, rescheduling, payments, or refunds?

📧 sessionbooking@collegeconnects.co.in

---

Partnerships & Collaborations

For college collaborations, business partnerships, sponsorships, or institutional tie-ups:

📧 partnership@collegeconnects.co.in

---

Marketing & Promotions

For marketing campaigns, brand promotions, influencer collaborations, or media inquiries:

📧 marketing@collegeconnects.co.in

---

Technical & Development

To report bugs, technical issues, or suggest improvements:

📧 dev@collegeconnects.co.in

---

Team & Internal Communication

For internal or team-related communication:

📧 team@collegeconnects.co.in

---

Important Notice

- Please contact only through the official email channels listed above.
- We do not encourage sharing personal contact details outside the platform.
- Our team typically responds within 24–48 hours.

---

About CollegeConnect

CollegeConnect is a student-to-student interaction platform designed to provide real, unbiased insights into colleges by connecting aspirants and parents directly with verified undergraduate students.

Our mission is to make college decision-making transparent, reliable, and stress-free.

---

💬 Need urgent help?

Reach out to our support team, and we'll assist you as quickly as possible.`;

  const lines = content.split("\n");

  const creators = [
    { id: 1, src: "/figures/1.jpeg", name: "Karri Kishan", position: "Founder & CEO" },
    { id: 2, src: "/figures/2.jpeg", name: "Bhargav Venkat", position: "Co-Founder and Founding Engineer" },
    { id: 3, src: "/figures/3.jpeg", name: "Yaswanth Buduru", position: "CTO and Co-Founder" },
    { id: 4, src: "/figures/4.jpeg", name: "Sai Badrishwar S S", position: "Chief Marketing officer (CMO)" },
    { id: 6, src: "/figures/6.jpeg", name: "Sreeramadasu Mukunda Rama Chary", position: "Chief Information Officer (CIO)" },
  ];

  // Placeholder data for the rest of your team
  const extendedTeam = [
    { role: "Technical Team", members: [ "Hitesh Sirvi"] },
    { role: "Marketing & Outreach", members: ["Anil Kumar", "Ajay Gagan Deep"] },
    { role: "Management Team", members: ["Kartik Shukla", "V Rushi"] },
    { role: "Consulting Team", members: ["Manne Greeshmant", "Nimmagadda Nayanamitra"]},
    { role: "Info Collector Team", members: [ "Charan Raj V"]}
  ];

  // Carousel State
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % creators.length);
    }, 2000); // 3000ms = 3 seconds

    // Cleanup function
    return () => clearInterval(interval);
  }, [creators.length]);

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-8 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        
        {/* Automatic Carousel Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Meet the Core Team</h2>
          
          <div className="relative flex items-center justify-center h-64 w-full">
            {creators.map((creator, i) => {
              const isActive = i === activeIndex;

              // Determine position and styling based on active index
              let positionClass = "translate-x-[200%] opacity-0 scale-50 z-0"; // Hidden by default
              
              if (isActive) {
                // Center Image (Active)
                positionClass = "translate-x-0 opacity-100 scale-100 z-10 blur-none";
              } else if (i === (activeIndex - 1 + creators.length) % creators.length) {
                // Left Adjacent Image
                positionClass = "-translate-x-24 sm:-translate-x-40 opacity-60 scale-75 z-0 blur-[2px]";
              } else if (i === (activeIndex + 1) % creators.length) {
                // Right Adjacent Image
                positionClass = "translate-x-24 sm:translate-x-40 opacity-60 scale-75 z-0 blur-[2px]";
              }

              return (
                <div 
                  key={creator.id} 
                  className={`absolute flex flex-col items-center text-center transition-all duration-500 ease-in-out ${positionClass}`}
                >
                  <img 
                    src={creator.src} 
                    alt={creator.name} 
                    loading={isActive ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={isActive ? "high" : "low"}
                    width={160}
                    height={160}
                    sizes="(max-width: 640px) 128px, 160px"
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover mb-4 border-4 border-yellow-500 shadow-lg shadow-yellow-500/50"
                  />
                  <h3 className="text-xl font-semibold text-foreground">{creator.name}</h3>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">{creator.position}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extended Team Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">Extended Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {extendedTeam.map((team, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                <h3 className="text-lg font-bold mb-4 text-yellow-600 dark:text-yellow-500">{team.role}</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  {team.members.map((member, mIdx) => (
                    <li key={mIdx} className="text-sm font-medium">{member}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Text Content */}
        <div className="text-foreground leading-relaxed space-y-3 whitespace-pre-wrap pt-8 border-t border-gray-200 dark:border-gray-800">
          {lines.map((line, index) => (
            <div key={index}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
