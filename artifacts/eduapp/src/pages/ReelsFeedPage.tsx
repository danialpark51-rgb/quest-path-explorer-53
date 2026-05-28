/**
 * Skill Reels Feed — Social reel discovery page
 *
 * Features:
 *  - Public reel feed (newest first)
 *  - Like / comment on reels
 *  - Trending hashtags (AI-powered, goal-aware)
 *  - Leaderboard (top reels by likes)
 *  - Tab: Feed | Leaderboard | My Reels
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageSquare, Send, X, Plus, Trophy,
  Loader2, Film, Sparkles, ArrowLeft, Trash2,
  TrendingUp, ChevronDown, ChevronUp,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import BottomNav from "@/components/BottomNav";
import { REEL_TEMPLATES, getTrendingHashtags } from "@/data/reelTemplates";
import type { ContentType } from "@/data/reelTemplates";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReelCard = {
  id: number;
  reelId: string;
  username: string;
  fullName: string;
  title: string;
  templateId: string;
  thumbnailData: string | null;
  hashtags: string;
  goal: string;
  contentType: string;
  likes: number;
  views: number;
  createdAt: string;
};

type Comment = {
  id: number;
  reelId: string;
  username: string;
  fullName: string;
  message: string;
  createdAt: string;
};

// ─── API helpers ──────────────────────────────────────────────────────────────

const API = (path: string, opts?: RequestInit) =>
  fetch(`/api${path}`, { headers: { "Content-Type": "application/json" }, ...opts });

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReelsFeedPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [tab,           setTab]           = useState<"feed" | "leaderboard" | "mine">("feed");
  const [reels,         setReels]         = useState<ReelCard[]>([]);
  const [leaderboard,   setLeaderboard]   = useState<ReelCard[]>([]);
  const [myReels,       setMyReels]       = useState<ReelCard[]>([]);
  const [trending,      setTrending]      = useState<string[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [likedIds,      setLikedIds]      = useState<Set<string>>(new Set());
  const [expandedReel,  setExpandedReel]  = useState<string | null>(null);
  const [comments,      setComments]      = useState<Record<string, Comment[]>>({});
  const [commentInput,  setCommentInput]  = useState("");
  const [commentingId,  setCommentingId]  = useState<string | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);

  // ── Load feed data ────────────────────────────────────────────────────────
  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [feedRes, lbRes, trendRes] = await Promise.all([
        API("/reels"),
        API("/reels/leaderboard"),
        API(`/reels/trending?goal=${encodeURIComponent(user?.selectedGoal ?? "")}`),
      ]);
      const [feedData, lbData, trendData] = await Promise.all([
        feedRes.json() as Promise<{ reels: ReelCard[] }>,
        lbRes.json()   as Promise<{ leaderboard: ReelCard[] }>,
        trendRes.json() as Promise<{ hashtags: string[] }>,
      ]);
      setReels(feedData.reels ?? []);
      setLeaderboard(lbData.leaderboard ?? []);
      setTrending(trendData.hashtags ?? []);
    } catch {
      // silent — show empty state
    } finally {
      setLoading(false);
    }
  }, [user?.selectedGoal]);

  const loadMyReels = useCallback(async () => {
    if (!user?.username) return;
    try {
      const res  = await API(`/reels/user/${encodeURIComponent(user.username)}`);
      const data = await res.json() as { reels: ReelCard[] };
      setMyReels(data.reels ?? []);
    } catch { /* silent */ }
  }, [user?.username]);

  useEffect(() => {
    loadFeed();
    loadMyReels();
    // Restore liked IDs from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("edupath_liked_reels") ?? "[]") as string[];
      setLikedIds(new Set(saved));
    } catch { /* ignore */ }
  }, [loadFeed, loadMyReels]);

  // ── Like toggle ───────────────────────────────────────────────────────────
  const handleLike = async (reelId: string) => {
    if (!user) return;
    const wasLiked = likedIds.has(reelId);

    // Optimistic update
    setLikedIds(prev => {
      const next = new Set(prev);
      wasLiked ? next.delete(reelId) : next.add(reelId);
      localStorage.setItem("edupath_liked_reels", JSON.stringify([...next]));
      return next;
    });
    const updateCount = (list: ReelCard[]) =>
      list.map(r => r.reelId === reelId ? { ...r, likes: r.likes + (wasLiked ? -1 : 1) } : r);
    setReels(updateCount);
    setLeaderboard(updateCount);
    setMyReels(updateCount);

    await API(`/reels/${reelId}/like`, {
      method: "POST",
      body: JSON.stringify({ username: user.username }),
    });
  };

  // ── Load comments ─────────────────────────────────────────────────────────
  const loadComments = async (reelId: string) => {
    if (comments[reelId]) return;
    try {
      const res  = await API(`/reels/${reelId}/comments`);
      const data = await res.json() as { comments: Comment[] };
      setComments(prev => ({ ...prev, [reelId]: data.comments ?? [] }));
    } catch { /* silent */ }
  };

  const toggleComments = (reelId: string) => {
    if (expandedReel === reelId) {
      setExpandedReel(null);
    } else {
      setExpandedReel(reelId);
      loadComments(reelId);
    }
    setCommentingId(null);
    setCommentInput("");
  };

  // ── Post comment ──────────────────────────────────────────────────────────
  const postComment = async (reelId: string) => {
    if (!user || !commentInput.trim()) return;
    const msg = commentInput.trim();
    setCommentInput("");
    try {
      const res  = await API(`/reels/${reelId}/comment`, {
        method: "POST",
        body: JSON.stringify({ username: user.username, fullName: user.fullName, message: msg }),
      });
      const data = await res.json() as Comment;
      setComments(prev => ({ ...prev, [reelId]: [...(prev[reelId] ?? []), data] }));
    } catch { /* silent */ }
  };

  // ── Delete reel ───────────────────────────────────────────────────────────
  const deleteReel = async (reelId: string) => {
    if (!user) return;
    setDeletingId(reelId);
    try {
      await API(`/reels/${reelId}`, {
        method: "DELETE",
        body: JSON.stringify({ username: user.username }),
      });
      setMyReels(prev => prev.filter(r => r.reelId !== reelId));
      setReels(prev => prev.filter(r => r.reelId !== reelId));
    } catch { /* silent */ }
    setDeletingId(null);
  };

  // ── View increment ────────────────────────────────────────────────────────
  const markView = useCallback(async (reelId: string) => {
    await API(`/reels/${reelId}/view`, { method: "POST" }).catch(() => {});
  }, []);

  const activeList = tab === "feed" ? reels : tab === "leaderboard" ? leaderboard : myReels;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="px-4 pt-3 pb-2 flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="p-1.5 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-base text-foreground flex items-center gap-1.5">
              <Film className="w-4 h-4 text-primary" /> Skill Reels
            </h1>
            <p className="text-xs text-muted-foreground">Student-made reels · EduPath</p>
          </div>
          <button
            onClick={() => navigate("/reels/studio")}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-full active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" /> Create
          </button>
        </div>

        {/* Trending hashtags */}
        {trending.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {trending.slice(0, 8).map(tag => (
                <span
                  key={tag}
                  className="shrink-0 text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-t border-border">
          {(["feed", "leaderboard", "mine"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
                tab === t
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "leaderboard" ? "🏆 Top Reels" : t === "mine" ? "👤 My Reels" : "🎬 Feed"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading reels…</p>
        </div>
      ) : activeList.length === 0 ? (
        <EmptyState tab={tab} onCreate={() => navigate("/reels/studio")} />
      ) : (
        <div className="divide-y divide-border">
          {activeList.map((reel, idx) => (
            <ReelCardItem
              key={reel.reelId}
              reel={reel}
              rank={tab === "leaderboard" ? idx + 1 : undefined}
              isLiked={likedIds.has(reel.reelId)}
              isMine={reel.username === user?.username}
              isExpanded={expandedReel === reel.reelId}
              comments={comments[reel.reelId] ?? []}
              commentInput={commentingId === reel.reelId ? commentInput : ""}
              isDeleting={deletingId === reel.reelId}
              onLike={() => handleLike(reel.reelId)}
              onToggleComments={() => toggleComments(reel.reelId)}
              onCommentChange={v => { setCommentingId(reel.reelId); setCommentInput(v); }}
              onCommentSubmit={() => postComment(reel.reelId)}
              onDelete={() => deleteReel(reel.reelId)}
              onView={() => markView(reel.reelId)}
            />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// ─── Reel Card ────────────────────────────────────────────────────────────────

interface ReelCardItemProps {
  reel: ReelCard;
  rank?: number;
  isLiked: boolean;
  isMine: boolean;
  isExpanded: boolean;
  comments: Comment[];
  commentInput: string;
  isDeleting: boolean;
  onLike: () => void;
  onToggleComments: () => void;
  onCommentChange: (v: string) => void;
  onCommentSubmit: () => void;
  onDelete: () => void;
  onView: () => void;
}

function ReelCardItem({
  reel, rank, isLiked, isMine, isExpanded, comments,
  commentInput, isDeleting, onLike, onToggleComments,
  onCommentChange, onCommentSubmit, onDelete, onView,
}: ReelCardItemProps) {
  const { user } = useUser();
  const tpl = REEL_TEMPLATES.find(t => t.id === reel.templateId) ?? REEL_TEMPLATES[0];
  const tags = reel.hashtags?.split(",").filter(Boolean) ?? [];
  const userInitial = user?.fullName?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? "?";

  // Fire view once on mount
  const viewedRef = useRef(false);
  useEffect(() => {
    if (!viewedRef.current) { viewedRef.current = true; onView(); }
  }, [onView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card p-4 space-y-3"
    >
      {/* Card header */}
      <div className="flex items-start gap-3">
        {/* Thumbnail / gradient preview */}
        <div
          className="w-16 h-24 rounded-xl shrink-0 overflow-hidden flex items-center justify-center relative"
          style={{ background: `linear-gradient(135deg, ${tpl.gradient[0]}, ${tpl.gradient[1]})` }}
        >
          {reel.thumbnailData ? (
            <img
              src={reel.thumbnailData}
              alt="Reel thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">{
              REEL_TEMPLATES.find(t => t.id === reel.templateId)?.emoji ?? "🎬"
            }</span>
          )}
          {/* Duration badge */}
          <div className="absolute bottom-1 left-1 right-1 text-center">
            <span className="text-white text-[9px] font-bold drop-shadow-md">REEL</span>
          </div>
          {rank && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold flex items-center justify-center shadow-md">
              {rank}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="font-bold text-sm text-foreground line-clamp-2 leading-snug">{reel.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">@{reel.username} · {timeAgo(reel.createdAt)}</p>
            </div>
            {isMine && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Template + goal badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ background: tpl.gradient[0] }}
            >
              {tpl.emoji} {tpl.name}
            </span>
            {reel.goal && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{reel.goal}</span>
            )}
          </div>

          {/* Hashtags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 4).map(tag => (
                <span key={tag} className="text-[10px] text-primary font-medium">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
          <span>{reel.likes}</span>
        </button>
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{comments.length}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <span className="ml-auto text-xs text-muted-foreground/60">{reel.views} views</span>
      </div>

      {/* Expandable comments section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border pt-3 space-y-3">
              {/* Comment list */}
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {comments.map(c => (
                    <div key={c.id} className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {c.fullName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="bg-muted rounded-xl px-3 py-2 min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">{c.fullName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment input */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 flex items-center gap-1 bg-muted rounded-full px-3 py-1.5">
                  <input
                    value={commentInput}
                    onChange={e => onCommentChange(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && onCommentSubmit()}
                    placeholder="Add a comment…"
                    maxLength={300}
                    className="flex-1 bg-transparent text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <button onClick={onCommentSubmit} disabled={!commentInput.trim()} className="text-primary disabled:opacity-40">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab, onCreate }: { tab: string; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
        {tab === "mine" ? "🎬" : tab === "leaderboard" ? "🏆" : "📱"}
      </div>
      <div>
        <p className="font-bold text-foreground text-lg">No reels yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          {tab === "mine"
            ? "You haven't created any reels yet."
            : "Be the first to post a reel!"}
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm active:scale-95 transition-transform"
      >
        <Sparkles className="w-4 h-4" /> Create My First Reel
      </button>
    </div>
  );
}

