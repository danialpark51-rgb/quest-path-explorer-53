import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Medal, Star, Flame, Trophy } from "lucide-react";
import BottomNav from "@/components/BottomNav";

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

const MOCK_PLAYERS: Player[] = [
  { id: "p1", name: "Priya Sharma", username: "priya_s", xp: 2450, level: 25, streak: 21, goal: "Medical", avatar: "👩‍⚕️" },
  { id: "p2", name: "Arjun Verma", username: "arjun_v", xp: 2180, level: 22, streak: 15, goal: "Engineering", avatar: "👨‍💻" },
  { id: "p3", name: "Sneha Patel", username: "sneha_p", xp: 1990, level: 20, streak: 18, goal: "Engineering", avatar: "👩‍🔬" },
  { id: "p4", name: "Rahul Kumar", username: "rahul_k", xp: 1780, level: 18, streak: 10, goal: "IT", avatar: "👨‍🎓" },
  { id: "p5", name: "Anjali Singh", username: "anjali_s", xp: 1650, level: 17, streak: 12, goal: "Commerce", avatar: "👩‍💼" },
  { id: "p6", name: "Vikram Rao", username: "vikram_r", xp: 1520, level: 16, streak: 8, goal: "Defence", avatar: "👨‍✈️" },
  { id: "p7", name: "Kavya Nair", username: "kavya_n", xp: 1380, level: 14, streak: 9, goal: "Arts", avatar: "👩‍🎨" },
  { id: "p8", name: "Rohit Gupta", username: "rohit_g", xp: 1240, level: 13, streak: 6, goal: "Govt", avatar: "👨‍⚖️" },
  { id: "p9", name: "Meera Iyer", username: "meera_i", xp: 1100, level: 12, streak: 7, goal: "Medical", avatar: "👩‍🏫" },
  { id: "p10", name: "Aditya Joshi", username: "aditya_j", xp: 980, level: 10, streak: 4, goal: "IT", avatar: "👨‍🚀" },
];

const GOAL_COLORS: Record<string, string> = {
  Engineering: "bg-blue-100 text-blue-700",
  Medical: "bg-green-100 text-green-700",
  Commerce: "bg-yellow-100 text-yellow-700",
  Arts: "bg-purple-100 text-purple-700",
  IT: "bg-cyan-100 text-cyan-700",
  Defence: "bg-red-100 text-red-700",
  Govt: "bg-orange-100 text-orange-700",
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

  const allPlayers = currentPlayer
    ? [...MOCK_PLAYERS, currentPlayer].sort((a, b) => b.xp - a.xp)
    : MOCK_PLAYERS;

  const currentUserRank = currentPlayer
    ? allPlayers.findIndex((p) => p.isCurrentUser) + 1
    : null;

  const top3 = allPlayers.slice(0, 3);
  const rest = allPlayers.slice(3);
  const maxXP = allPlayers[0]?.xp ?? 1;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-dark text-primary-foreground px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">XP Leaderboard</h1>
              <p className="text-sm text-primary-foreground/70">Top learners this season</p>
            </div>
          </div>

          {currentUserRank && (
            <div className="mt-4 bg-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentPlayer?.avatar}</span>
                <div>
                  <p className="font-semibold text-sm">Your Rank</p>
                  <p className="text-xs text-primary-foreground/70">{currentPlayer?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-bold">#{currentUserRank}</p>
                <p className="text-xs text-primary-foreground/70">{currentPlayer?.xp.toLocaleString()} XP</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-3 mb-6">
          {[top3[1], top3[0], top3[2]].map((player, i) => {
            if (!player) return null;
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = ["h-24", "h-32", "h-20"];
            const heightClass = i === 0 ? heights[0] : i === 1 ? heights[1] : heights[2];
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
                <p className="text-xs text-muted-foreground mb-2">{player.xp.toLocaleString()} XP</p>
                <div className={`w-full ${heightClass} rounded-t-xl flex items-end justify-center pb-3 ${actualRank === 1 ? "bg-yellow-400" : actualRank === 2 ? "bg-gray-300" : "bg-amber-500"}`}>
                  {actualRank === 1 && <Crown className="w-6 h-6 text-white" />}
                  {actualRank === 2 && <span className="text-xl font-bold text-white">2</span>}
                  {actualRank === 3 && <span className="text-xl font-bold text-white">3</span>}
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
            const xpPct = Math.round((player.xp / maxXP) * 100);

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl border p-3 transition ${
                  isCurrent
                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
                    : isTop3
                    ? "bg-card border-yellow-200"
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
                          <span className="ml-1 text-xs text-primary font-normal">(You)</span>
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
                        {player.xp.toLocaleString()} XP
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

        {/* Motivational Card */}
        <div className="mt-6 rounded-2xl gradient-hero p-5 text-center">
          <p className="text-primary-foreground font-display font-bold text-lg">
            🚀 Keep Learning!
          </p>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Complete tasks, quizzes & skills to earn more XP and climb the ranks!
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
