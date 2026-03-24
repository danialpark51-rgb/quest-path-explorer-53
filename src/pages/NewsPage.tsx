import { newsItems } from "@/data/news";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const NewsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">📰 Daily News</h1>
        <div className="space-y-3">
          {newsItems.map((news, idx) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <span className="text-3xl flex-shrink-0">{news.emoji}</span>
              <div>
                <h3 className="font-semibold text-foreground">{news.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{news.summary}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{news.category}</span>
                  <span className="text-xs text-muted-foreground">{news.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default NewsPage;
