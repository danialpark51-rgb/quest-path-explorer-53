import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { games } from "@/data/games";
import { useLanguage } from "@/context/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";

const diffColors = { Easy: "bg-primary/10 text-primary", Medium: "bg-accent/10 text-accent", Hard: "bg-destructive/10 text-destructive" };

const GamesPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const categories = ["All", ...Array.from(new Set(games.map(g => g.category)))];
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? games : games.filter(g => g.category === filter);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> {t("home")}
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">🎮 {t("games")}</h1>
        <p className="text-sm text-muted-foreground mb-4">Play skill-building games and puzzles to sharpen your mind!</p>

        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filtered.map((game, idx) => (
            <motion.a
              key={game.id}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-elevated transition group block"
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{game.icon}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mt-3">{game.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[game.difficulty]}`}>{game.difficulty}</span>
                {game.skills.map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export const GamePlayPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-foreground mb-4">Games open in a new tab!</p>
        <button onClick={() => navigate("/games")} className="px-4 py-2 rounded-lg gradient-hero text-primary-foreground">Back to Games</button>
      </div>
    </div>
  );
};

export default GamesPage;
