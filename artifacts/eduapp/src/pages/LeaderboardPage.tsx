import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Medal, Star, Flame, Trophy, RefreshCw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";

type Player = {
  id: string;
  name: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  goal: string;
  avatar: string;
  isCurrentUser?: boolean;
};

type ApiEntry = {
  username: string;
  fullName: string;
  xp: number;
  level: number;
  streak: number;
  goal: string;
  school: string;
};

const MOCK_PLAYERS: Player[] = [
  { id: "p1",  name: "Priya Sharma",  username: "priya_s",  xp: 2450, level: 25, streak: 21, goal: "Medical",     avatar: "👩‍⚕️" },
  { id: "p2",  name: "Arjun Verma",   username: "arjun_v",  xp: 2180, level: 22, streak: 15, goal: "Engineering", avatar: "👨‍💻" },
  { id: "p3",  name: "Sneha Patel",   username: "sneha_p",  xp: 1990, level: 20, streak: 18, goal: "Engineering", avatar: "👩‍🔬" },
  { id: "p4",  name: "Rahul Kumar",   username: "rahul_k",  xp: 1780, level: 18, streak: 10, goal: "IT",          avatar: "👨‍🎓" },
  { id: "p5",  name: "Anjali Singh",  username: "anjali_s", xp: 1650, level: 17, streak: 12, goal: "Commerce",    avatar: "👩‍💼" },
  { id: "p6",  name: "Vikram Rao",    username: "vikram_r", xp: 1520, level: 16, streak: 8,  goal: "Defence",     avatar: "👨‍✈️" },
  { id: "p7",  name: "Kavya Nair",    username: "kavya_n",  xp: 1380, level: 14, streak: 9,  goal: "Arts",        avatar: "👩‍🎨" },
  { id: "p8",  name: "Rohit Gupta",   username: "rohit_g",  xp: 1240, level: 13, streak: 6,  goal: "Govt",        avatar: "👨‍⚖️" },
  { id: "p9",  name: "Meera Iyer",    username: "meera_i",  xp: 1100, level: 12, streak: 7,  goal: "Medical",     avatar: "👩‍🏫" },
  { id: "p10", name: "Aditya Joshi",  username: "aditya_j", xp: 980,  level: 10, streak: 4,  goal: "IT",          avatar: "👨‍🚀" },
];

const AVATARS = ["👦","👧","🧑","👩","👨","🧒","👶","🧑‍🎓","👩‍🎓","👨‍🎓","🧑‍💻","👩‍💻","👨‍💻","🧑‍🔬","👩‍🔬","👨‍🔬"];
function getAvatar(username: string): string {
  const idx = username.charCodeAt(0) % AVATARS.length;
  return AVATARS[idx];
}

const GOAL_COLORS: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700",
  Medical:     "bg-green-100 text-green-700",
  Commerce:    "bg-yellow-100 text-yellow-700",
  Arts:        "bg-purple-100 text-purple-700",
  IT:          "bg-cyan-100 text-cyan-700",
  Defence:     "bg-red-100 text-red-700",
  Govt:        "bg-orange-100 text-orange-700",
};

function getRankBadge(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
}

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useLanguage();

  const [liveData, setLiveData] = useState<ApiEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchLeaderboard = () => {
    setLoading(true);
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d: { players: ApiEntry[] }) => {
        if (d.players && d.players.length >= 2) {
          setLiveData(d.players);
          setIsLive(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const currentPlayer: Player | null = user
    ? {
        id: "current",
        name: user.fullName,
        username: user.username,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        goal: user.selectedGoal || "Explorer",
        avatar: "⭐",
        isCurrentUser: true,
      }
    : null;

  let allPlayers: Player[];
  if (isLive && liveData) {
    const livePlayers: Player[] = liveData.map((e) => ({
      id: e.username,
      name: e.fullName,
      username: e.username,
      xp: e.xp,
      level: e.level,
      streak: e.streak,
      goal: e.goal,
      avatar: e.username === user?.username ? "⭐" : getAvatar(e.username),
      isCurrentUser: e.username === user?.username,
    }));
    allPlayers = livePlayers.sort((a, b) => b.xp - a.xp);
  } else {
    allPlayers = currentPlayer
      ? [...MOCK_PLAYERS, currentPlayer].sort((a, b) => b.xp - a.xp)
      : MOCK_PLAYERS;
  }

  const currentUserRank = currentPlayer
    ? allPlayers.findIndex((p) => p.isCurrentUser) + 1
    : null;

  const top3 = allPlayers.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {t("lb.back")}
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">{t("lb.title")}</h1>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-primary-foreground/70">{t("lb.subtitle")}</p>
                  {isLive && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={fetchLeaderboard} disabled={loading}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {currentUserRank !== null && currentUserRank > 0 && currentPlayer && (
            <div className="mt-4 bg-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentPlayer.avatar}</span>
                <div>
                  <p className="font-semibold text-sm">{t("lb.you")}</p>
                  <p className="text-xs text-primary-foreground/70">{currentPlayer.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-bold">#{currentUserRank}</p>
                <p className="text-xs text-primary-foreground/70">{currentPlayer.xp.toLocaleString()} {t("lb.xp")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-3 mb-6">
              {[top3[1], top3[0], top3[2]].map((player, i) => {
                if (!player) return null;
                const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                const heightClass = i === 1 ? "h-32" : i === 0 ? "h-24" : "h-20";
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-1 max-w-[30%] flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">{player.avatar}</span>
                    <p className="text-xs font-semibold text-foreground text-center line-clamp-1 mb-1">{player.name.split(" ")[0]}</p>
                    <p className="text-xs text-muted-foreground mb-2">{player.xp.toLocaleString()} {t("lb.xp")}</p>
                    <div className={`w-full ${heightClass} rounded-t-xl flex items-end justify-center pb-3 ${actualRank === 1 ? "bg-yellow-400" : actualRank === 2 ? "bg-gray-300" : "bg-amber-500"}`}>
                      {actualRank === 1 && <Crown className="w-6 h-6 text-white" />}
                      {actualRank !== 1 && <span className="text-xl font-bold text-white">{actualRank}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Full Rankings */}
            <div className="space-y-2">
              {allPlayers.map((player, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                const isCurrent = player.isCurrentUser;
                const maxXP = allPlayers[0]?.xp ?? 1;
                const xpPct = Math.round((player.xp / maxXP) * 100);

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`rounded-xl border p-3 transition ${
                      isCurrent ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                      : isTop3 ? "bg-card border-yellow-200"
                      : "bg-card border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        {getRankBadge(rank)}
                      </div>
                      <span className="text-xl flex-shrink-0">{player.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">
                            {player.name}
                            {isCurrent && (
                              <span className="ml-1 text-xs text-primary font-normal">({t("lb.you")})</span>
                            )}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${GOAL_COLORS[player.goal] ?? "bg-muted text-muted-foreground"}`}>
                            {player.goal}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isCurrent ? "bg-primary" : "bg-muted-foreground/40"}`}
                              style={{ width: `${xpPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {player.xp.toLocaleString()} {t("lb.xp")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-orange-500 flex-shrink-0">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{player.streak}d</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary flex-shrink-0">
                        <Star className="w-3.5 h-3.5" />
                        <span>Lv{player.level}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Motivational Card */}
        <div className="mt-6 rounded-2xl gradient-hero p-5 text-center">
          <p className="text-primary-foreground font-display font-bold text-lg">🚀 {t("tasks.subtitle")}</p>
          <p className="text-primary-foreground/80 text-sm mt-1">{t("home.quizzes")} · {t("home.skill_modules")} · {t("home.daily_tasks")}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
