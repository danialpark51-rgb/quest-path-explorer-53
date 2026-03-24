import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, CheckCircle, XCircle } from "lucide-react";
import { observationImages, ObservationImage } from "@/data/observations";
import { useUser } from "@/context/UserContext";
import { useLanguage } from "@/context/LanguageContext";
import BottomNav from "@/components/BottomNav";

const ObservationPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addXP } = useUser();
  const [selectedImage, setSelectedImage] = useState<ObservationImage | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filter, setFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  const filtered = filter === "All" ? observationImages : observationImages.filter(i => i.difficulty === filter);

  const handleAddItem = () => {
    if (!input.trim()) return;
    const item = input.trim().toLowerCase();
    if (!userAnswers.includes(item)) {
      setUserAnswers([...userAnswers, item]);
    }
    setInput("");
  };

  const handleSubmit = () => {
    if (!selectedImage) return;
    const correct = userAnswers.filter(a =>
      selectedImage.items.some(item => item.toLowerCase().includes(a) || a.includes(item.toLowerCase()))
    );
    addXP(correct.length * 2);
    setShowResults(true);
  };

  const handleBack = () => {
    setSelectedImage(null);
    setUserAnswers([]);
    setShowResults(false);
    setInput("");
  };

  if (selectedImage) {
    const correctAnswers = userAnswers.filter(a =>
      selectedImage.items.some(item => item.toLowerCase().includes(a) || a.includes(item.toLowerCase()))
    );

    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
            <ArrowLeft className="w-4 h-4" /> {t("back")}
          </button>

          <h1 className="text-xl font-display font-bold text-foreground mb-3">{selectedImage.title}</h1>

          <div className="rounded-xl overflow-hidden border border-border mb-4">
            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-64 object-cover" />
          </div>

          {!showResults ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                🔍 Observe the image carefully and list as many things as you can see!
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddItem()}
                  placeholder="Type an object you see..."
                  className="flex-1 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-sm"
                />
                <button onClick={handleAddItem} className="px-4 py-2 rounded-xl gradient-hero text-primary-foreground text-sm font-medium">Add</button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {userAnswers.map((a, i) => (
                  <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    {a}
                    <button onClick={() => setUserAnswers(userAnswers.filter((_, idx) => idx !== i))} className="text-primary/60 hover:text-primary">×</button>
                  </span>
                ))}
              </div>

              {userAnswers.length > 0 && (
                <button onClick={handleSubmit} className="w-full py-3 rounded-xl gradient-hero text-primary-foreground font-semibold">
                  Submit ({userAnswers.length} items)
                </button>
              )}
            </>
          ) : (
            <div>
              <div className="bg-card border border-border rounded-xl p-4 mb-4">
                <p className="text-lg font-bold text-foreground mb-2">
                  {correctAnswers.length}/{selectedImage.items.length} items found!
                </p>
                <p className="text-sm text-muted-foreground">You earned {correctAnswers.length * 2} XP</p>
              </div>

              <h3 className="font-display font-bold text-foreground mb-2">Your Answers:</h3>
              <div className="space-y-1 mb-4">
                {userAnswers.map((a, i) => {
                  const isCorrect = selectedImage.items.some(item => item.toLowerCase().includes(a) || a.includes(item.toLowerCase()));
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {isCorrect ? <CheckCircle className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
                      <span className={isCorrect ? "text-primary" : "text-muted-foreground"}>{a}</span>
                    </div>
                  );
                })}
              </div>

              <h3 className="font-display font-bold text-foreground mb-2">All Items in Image:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedImage.items.map((item, i) => (
                  <span key={i} className="bg-muted text-foreground px-3 py-1 rounded-full text-sm">{item}</span>
                ))}
              </div>

              <button onClick={handleBack} className="w-full mt-6 py-3 rounded-xl gradient-hero text-primary-foreground font-semibold">
                Try Another Image
              </button>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => navigate("/home")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> {t("home")}
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">👁️ {t("observation")}</h1>
        <p className="text-sm text-muted-foreground mb-4">Test your observation skills! Look at images and list everything you see.</p>

        <div className="flex gap-2 mb-4">
          {(["All", "Easy", "Medium", "Hard"] as const).map(d => (
            <button key={d} onClick={() => setFilter(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((img, idx) => (
            <motion.div key={img.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              onClick={() => setSelectedImage(img)}
              className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-elevated transition group">
              <div className="aspect-video bg-muted relative">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition flex items-center justify-center">
                  <Eye className="w-8 h-8 text-primary-foreground opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-foreground">{img.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${img.difficulty === "Easy" ? "bg-primary/10 text-primary" : img.difficulty === "Medium" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                    {img.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">{img.items.length} items</span>
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

export default ObservationPage;
