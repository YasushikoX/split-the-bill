import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    className={cn("text-primary", className)}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25 15C25 12.2386 27.2386 10 30 10H70C72.7614 10 75 12.2386 75 15V90H25V15Z"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M25 50L75 50"
      stroke="hsl(var(--accent))"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="4 8"
    />
    <path
      d="M35 25H65"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M35 35H55"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M35 65H65"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M35 75H55"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);
