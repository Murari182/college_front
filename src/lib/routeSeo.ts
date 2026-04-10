/**
 * Central SEO metadata map.
 * Set VITE_SITE_URL in production for canonical URLs, Open Graph, and JSON-LD.
 */

export const SITE_NAME = "Collegeconnects";

export const DEFAULT_DESCRIPTION =
  "Connect with verified college advisors for JEE prep, admissions guidance, and mentoring. Book online sessions with students from IITs, NITs, and colleges across India.";

export function siteBaseUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL;
  if (typeof raw !== "string" || !raw.trim()) return "";
  return raw.trim().replace(/\/$/, "");
}

export type RouteSeo = {
  title: string;
  description: string;
  noindex?: boolean;
};

const PUBLIC: Record<string, RouteSeo> = {
  "/": {
    title: `${SITE_NAME} | Find your college advisor`,
    description: DEFAULT_DESCRIPTION,
  },

  "/college-predictor": {
    title: `College Predictor | ${SITE_NAME}`,
    description:
      "How to use the college predictor and quick links to JoSAA cutoff data in Google Sheets for 2024 and 2025.",
  },
  "/about": {
    title: `About | ${SITE_NAME}`,
    description: `Learn about ${SITE_NAME}, our mission, and how we connect students with verified college advisors.`,
  },
  "/contact": {
    title: `Contact | ${SITE_NAME}`,
    description: `Contact ${SITE_NAME} for support, partnerships, and questions about student-advisor sessions.`,
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: `Privacy policy for ${SITE_NAME}: how we handle personal data, authentication, and booking information.`,
  },
  "/terms": {
    title: `Terms of Service | ${SITE_NAME}`,
    description: `Terms of service for using ${SITE_NAME} as a student or advisor.`,
  },
  "/auth/signup": {
    title: `Sign Up | ${SITE_NAME}`,
    description: "Create an account on Collegeconnects to browse advisors or guide students.",
  },
  "/auth/signin": {
    title: `Sign In | ${SITE_NAME}`,
    description: "Sign in to your Collegeconnects account.",
  },
};

const NOINDEX_FALLBACK: RouteSeo = {
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  noindex: true,
};

export function getSeoForPath(pathname: string): RouteSeo {
  const path = pathname.split("?")[0] || "/";
  if (!path.startsWith("/")) return { ...PUBLIC["/"] };


  if (path.startsWith("/student/dashboard")) {
    return {
      title: `Student Dashboard | ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/student/advisor/")) {
    return {
      title: `Advisor Profile | ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/student/session/")) {
    return {
      title: `Session Details | ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/advisor/dashboard")) {
    return {
      title: `Advisor Dashboard | ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/advisor/session/")) {
    return {
      title: `Session Details | ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  if (path.startsWith("/student/") || path.startsWith("/advisor/")) {
    return { ...NOINDEX_FALLBACK };
  }

  if (PUBLIC[path]) return { ...PUBLIC[path] };
  return { ...PUBLIC["/"], title: SITE_NAME };
}

export function jsonLdWebsite(baseUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: baseUrl,
  };
}

export function jsonLdOrganization(baseUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: baseUrl,
    description: DEFAULT_DESCRIPTION,
    logo: `${baseUrl}/favicon-transparent.png`,
  };
}

export function jsonLdWebApplication(baseUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: baseUrl,
    applicationCategory: "EducationApplication",
    operatingSystem: "Web",
  };
}

export function jsonLdWebPage(url: string, title: string, description: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteBaseUrl() || undefined,
    },
  };
}
