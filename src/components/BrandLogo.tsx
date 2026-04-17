import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-transparent.png";

/** Re-use for hero watermarks / meta tags if needed */
export const brandLogoSrc = logo;

const sizeMap = {
  sm: "h-8 w-auto max-w-[2rem]",
  md: "h-9 w-auto max-w-[2.25rem] sm:h-10 sm:max-w-[2.5rem]",
  lg: "h-14 w-auto max-w-[3.75rem] sm:h-16 sm:max-w-[4rem]",
  xl: "h-20 w-auto max-w-[5.5rem] sm:h-24 sm:max-w-[6rem]",
  hero: "h-28 w-auto max-w-[8rem] sm:h-32 sm:max-w-[9rem] md:h-36 md:max-w-[10rem]",
};

/** Wordmark: transparent PNG + Collegeconnects text. */
export function BrandLogo({
  size = "md",
  withText = true,
  asLink = false,
  align = "center",
  className,
  imgClassName,
}: {
  size?: keyof typeof sizeMap;
  withText?: boolean;
  asLink?: boolean;
  /** Use `start` to pin mark + wordmark to the left (e.g. auth headers). */
  align?: "center" | "start";
  className?: string;
  imgClassName?: string;
}) {
  const mark = (
    <img
      src={logo}
      alt={withText ? "" : "Collegeconnects"}
      width={512}
      height={512}
      draggable={false}
      className={cn(
        sizeMap[size],
        "object-contain object-center bg-transparent",
        imgClassName,
      )}
    />
  );

  const wordmark = withText ? (
    <span className="font-display font-bold tracking-tight text-xl text-slate-900 hidden sm:block">
      CollegeConnects
    </span>
  ) : null;

  const inner = (
    <span
      className={cn(
        withText
          ? "inline-flex flex-row items-center gap-2"
          : "inline-flex items-center",
        className,
      )}
    >
      {mark}
      {wordmark}
    </span>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className={cn(
          "inline-flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]/50 rounded-lg",
          align === "start" ? "items-start" : "items-center",
        )}
        data-ocid="nav.link"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
