import { useNavigate, useLocation } from "react-router-dom";
import { HeartPulse } from "lucide-react";

interface SmartLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
}

export const SmartLogo = ({ size = "md", variant = "dark" }: SmartLogoProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const sizes = {
    sm: { icon: 18, text: "text-lg" },
    md: { icon: 22, text: "text-xl" },
    lg: { icon: 28, text: "text-2xl" },
  };

  const s = sizes[size];

// Determine category home page based on current route - login flow → main dashboard (/login)
  const getCategoryHome = () => {
    const path = location.pathname.toLowerCase();
    // Login flow pages → main dashboard (login)
    if (path === '/login' || path === '/details' || path === '/patient-details') {
      return '/login';
    }
    // Category subpages → category home
    if (path.includes("/dashboard") || path.includes("/new-data") || path.includes("/previous-data")) {
      return "/dashboard"; // Doctor category
    }
    if (path.includes("/patient-dashboard")) {
      return "/patient-dashboard"; // Patient dashboard
    }
    if (path.includes("/nurse")) {
      return "/nurse"; // Nurse category
    }
    if (path.includes("/lab")) {
      return "/lab"; // Lab category
    }
    return "/login"; // Default to main dashboard
  };

  const categoryHome = getCategoryHome();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (categoryHome && location.pathname !== categoryHome) {
      navigate(categoryHome);
    }
  };

  return (
    <button onClick={handleClick} className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2 ring-offset-background -m-1">
      {/* Icon */}
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
        <HeartPulse size={s.icon} className="text-primary-foreground" strokeWidth={2.5} />
      </div>

      {/* Text */}
      <div
        className={`font-display font-extrabold ${s.text} ${
          variant === "light" ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        Cura<span className="gradient-text">Sense</span>
      </div>
    </button>
  );
};

