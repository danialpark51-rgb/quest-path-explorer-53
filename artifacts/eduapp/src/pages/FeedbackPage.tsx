/**
 * Feedback Page — Students can rate the app and submit feedback, suggestions, bug reports.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus, ArrowLeft, Star, Send, CheckCircle,
  Bug, Lightbulb, ThumbsUp, AlertCircle,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useUser } from "@/context/UserContext";

// ─── Star Rating ──────────────────────────────────────────────────────────────

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= (hovered || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <p className="text-sm font-semibold text-yellow-600">
          {labels[hovered || value]}
        </p>
      )}
    </div>
  );
};

// ─── Category options ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "general",         label: "General Feedback",  icon: <ThumbsUp className="w-4 h-4" /> },
  { value: "bug",             label: "Bug Report",        icon: <Bug className="w-4 h-4" /> },
  { value: "suggestion",      label: "Suggestion",        icon: <Lightbulb className="w-4 h-4" /> },
  { value: "feature_request", label: "Feature Request",   icon: <Star className="w-4 h-4" /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

const FeedbackPage = () => {
  const navigate  = useNavigate();
  const { user }  = useUser();

  const [rating, setRating]               = useState(0);
  const [category, setCategory]           = useState("general");
  const [message, setMessage]             = useState("");
  const [suggestions, setSuggestions]     = useState("");
  const [bugReport, setBugReport]         = useState("");
  const [featureRequest, setFeatureRequest] = useState("");

  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (message.trim().length < 5) {
      setError("Please write a brief feedback message (at least 5 characters).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user?.username ?? "anonymous",
          rating,
          category,
          message: message.trim(),
          suggestions: suggestions.trim(),
          bugReport: bugReport.trim(),
          featureRequest: featureRequest.trim(),
        }),
      });

      const data = await res.json() as { success?: boolean; message?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to submit. Please try again.");
      } else {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setCategory("general");
    setMessage("");
    setSuggestions("");
    setBugReport("");
    setFeatureRequest("");
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white px-4 pt-6 pb-12 rounded-b-3xl">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <MessageSquarePlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Feedback</h1>
              <p className="text-sm text-white/70">Help us improve EduPath</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">

        {/* Success State */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-8 shadow-card flex flex-col items-center gap-4 text-center mt-4"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h2 className="font-display font-bold text-foreground text-xl">Thank you!</h2>
                <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
                  Your feedback has been submitted successfully. It helps us make EduPath better for every student.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition"
                >
                  Submit More
                </button>
                <button
                  onClick={() => navigate("/home")}
                  className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
                >
                  Back to Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {!success && (
          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="mt-4 space-y-5"
          >
            {/* Star Rating */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-foreground mb-4 text-center">
                Overall Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            {/* Category */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-foreground mb-3">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
                      category === cat.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Message */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Feedback Message <span className="text-destructive">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts about EduPath…"
                rows={4}
                maxLength={2000}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/2000</p>
            </div>

            {/* Suggestions (optional) */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <label className="block text-sm font-semibold text-foreground mb-1">
                Suggestions <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">What could we do better?</p>
              <textarea
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="e.g. Add more quiz topics, improve the AI assistant…"
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
              />
            </div>

            {/* Bug Report (conditional) */}
            {(category === "bug" || category === "general") && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Bug Report <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">Describe any issue you found and how to reproduce it.</p>
                <textarea
                  value={bugReport}
                  onChange={(e) => setBugReport(e.target.value)}
                  placeholder="e.g. The quiz page crashes when I press the back button…"
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
                />
              </div>
            )}

            {/* Feature Request (conditional) */}
            {(category === "feature_request" || category === "general") && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Feature Request <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">What new feature would you love to see?</p>
                <textarea
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  placeholder="e.g. I'd love a dark mode, or a feature to track my study hours…"
                  rows={3}
                  maxLength={1000}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
                />
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 items-start"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || rating === 0 || message.trim().length < 5}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl disabled:opacity-50 hover:opacity-90 transition text-base"
            >
              <Send className="w-5 h-5" />
              {loading ? "Submitting…" : "Submit Feedback"}
            </button>

            <p className="text-xs text-muted-foreground text-center pb-2">
              Your feedback is anonymous and helps improve EduPath for all students.
            </p>
          </motion.form>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default FeedbackPage;
