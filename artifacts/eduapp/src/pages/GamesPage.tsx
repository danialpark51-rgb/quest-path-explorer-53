import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { games } from "@/data/games";
import { useLanguage } from "@/context/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import InAppGameArena from "@/components/InAppGameArena";

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
        <p className="text-sm text-muted-foreground mb-4">All games play directly in the app — no external links!</p>

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
            <motion.button key={game.id} type="button" onClick={() => navigate(`/game/${game.id}`)}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-elevated transition group block text-left">
              <span className="text-4xl">{game.emoji}</span>
              <h3 className="text-lg font-display font-bold text-foreground mt-3">{game.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[game.difficulty]}`}>{game.difficulty}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{game.category}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">▶ Play In-App</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export const GamePlayPage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const game = games.find(item => item.id === gameId);

  if (!game) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Game not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-5">
        <button onClick={() => navigate("/games")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-elevated">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">In-app game</p>
              <h1 className="mt-1 text-2xl font-display font-bold text-foreground">{game.emoji} {game.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{game.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${diffColors[game.difficulty]}`}>{game.difficulty}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{game.category}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
          {gameId && <InAppGameArena gameId={gameId} />}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default GamesPage;
