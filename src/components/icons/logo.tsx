import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("text-primary", className)}
  >
    <path
      d="M9.5 21.5L4.5 21.5C3.39543 21.5 2.5 20.6046 2.5 19.5L2.5 4.5C2.5 3.39543 3.39543 2.5 4.5 2.5L19.5 2.5C20.6046 2.5 21.5 3.39543 21.5 4.5V12.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary/30"
    />
    <path
      d="M7 8H17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 13H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 21.5L20.5 18.5M17.5 21.5L14.5 18.5M17.5 15.5L17.5 21.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
