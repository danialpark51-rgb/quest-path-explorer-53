import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Trophy, Headphones, MessageCircle, UserCircle2 } from "lucide-react";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/skills", icon: BookOpen, label: "Skills" },
  { path: "/quiz", icon: Trophy, label: "Quiz" },
  { path: "/stories", icon: Headphones, label: "Stories" },
  { path: "/ai-assistant", icon: MessageCircle, label: "AI" },
  { path: "/profile", icon: UserCircle2, label: "Profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
