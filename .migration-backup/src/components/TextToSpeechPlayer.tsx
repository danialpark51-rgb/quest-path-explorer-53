import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

type TextToSpeechPlayerProps = {
  text: string;
  title?: string;
  className?: string;
};

const chunkText = (input: string) => {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
  const chunks: string[] = [];
  let buffer = "";

  sentences.forEach((sentence) => {
    if (`${buffer} ${sentence}`.trim().length > 220) {
      if (buffer.trim()) chunks.push(buffer.trim());
      buffer = sentence.trim();
      return;
    }

    buffer = `${buffer} ${sentence}`.trim();
  });

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
};

const TextToSpeechPlayer = ({ text, title = "Audio reader", className = "" }: TextToSpeechPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [isSupported, setIsSupported] = useState(false);
  const chunkIndexRef = useRef(0);
  const chunks = useMemo(() => chunkText(text), [text]);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    chunkIndexRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
  };

  const speakFromIndex = (index: number) => {
    if (!isSupported || index >= chunks.length) {
      setIsPlaying(false);
      setIsPaused(false);
      chunkIndexRef.current = 0;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.rate = rate;
    utterance.onend = () => {
      if (!window.speechSynthesis.paused) {
        chunkIndexRef.current = index + 1;
        speakFromIndex(index + 1);
      }
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (!isSupported || chunks.length === 0) return;

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPlaying && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    stopSpeaking();
    setIsPlaying(true);
    setIsPaused(false);
    chunkIndexRef.current = 0;
    speakFromIndex(0);
  };

  if (!isSupported) {
    return (
      <div className={`rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground ${className}`}>
        Voice playback is not supported in this browser.
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 shadow-card ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Voice reader</p>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Speed
          <select
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="rounded-full border border-border bg-background px-3 py-1 text-foreground outline-none"
          >
            <option value={0.9}>0.9x</option>
            <option value={1}>1.0x</option>
            <option value={1.1}>1.1x</option>
            <option value={1.2}>1.2x</option>
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handlePlayPause}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying && !isPaused ? "Pause audio" : isPaused ? "Resume audio" : "Play audio"}
        </button>
        <button
          type="button"
          onClick={stopSpeaking}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <Square className="h-4 w-4" /> Stop
        </button>
      </div>
    </div>
  );
};

export default TextToSpeechPlayer;