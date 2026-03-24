import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";

type Message = { role: "user" | "assistant"; content: string };

const sampleResponses: Record<string, string> = {
  default: "I'm your AI study assistant! I can help you with questions about any subject — Math, Science, History, or career guidance. Try asking me something specific! 📚",
  math: "Great question about Math! Here's a tip: Practice is the key to mastering mathematics. Start with understanding the concepts, then solve problems step by step. Would you like me to explain a specific topic?",
  science: "Science is fascinating! Whether it's Physics, Chemistry, or Biology, the key is to understand 'why' things happen, not just 'what' happens. What specific science topic interests you?",
  career: "Choosing a career is a big decision! Think about what you enjoy doing, your strengths, and what impact you want to make. I can help you explore different career paths. Which field interests you?",
  study: "Here are some study tips: 1) Use the Pomodoro technique (25 min study, 5 min break), 2) Teach what you learn to someone else, 3) Make mind maps for complex topics, 4) Review before sleeping!",
  exam: "Exam preparation tips: 1) Start early, don't cram, 2) Focus on understanding, not memorizing, 3) Solve previous year papers, 4) Take mock tests, 5) Stay healthy — sleep well and eat right!",
};

const AIAssistantPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi there! 👋 I'm your AI learning assistant. Ask me anything about your studies, career guidance, exam tips, or any subject you're curious about!" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let response = sampleResponses.default;
      if (lower.includes("math") || lower.includes("calcul") || lower.includes("algebra")) response = sampleResponses.math;
      else if (lower.includes("science") || lower.includes("physics") || lower.includes("chemistry") || lower.includes("biology")) response = sampleResponses.science;
      else if (lower.includes("career") || lower.includes("job") || lower.includes("future")) response = sampleResponses.career;
      else if (lower.includes("study") || lower.includes("learn") || lower.includes("tip")) response = sampleResponses.study;
      else if (lower.includes("exam") || lower.includes("test") || lower.includes("jee") || lower.includes("neet") || lower.includes("upsc")) response = sampleResponses.exam;

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground text-sm">AI Study Assistant</h1>
            <p className="text-xs text-primary">Online • Ready to help</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full gradient-hero flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "gradient-hero text-primary-foreground rounded-tr-sm" : "bg-card border border-border text-foreground rounded-tl-sm"}`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <div className="w-7 h-7 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AIAssistantPage;
