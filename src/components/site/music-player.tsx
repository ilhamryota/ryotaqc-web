import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music2,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import qcsongs from "@/assets/qcsongs.mp3.asset.json";
import ryotaqc from "@/assets/ryotaqc.mp3.asset.json";
import ryotaqccountry from "@/assets/ryotaqccountry.mp3.asset.json";

type Track = { title: string; artist: string; src: string };

const PLAYLIST: Track[] = [
  { title: "Ryota QC", artist: "Ryota QC Theme", src: ryotaqc.url },
  { title: "QC Songs", artist: "Ryota QC Vibes", src: qcsongs.url },
  { title: "Ryota QC Country", artist: "Country Edition", src: ryotaqccountry.url },
];

type Ctx = {
  playlist: Track[];
  index: number;
  playing: boolean;
  visible: boolean;
  muted: boolean;
  progress: number;
  duration: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  selectIndex: (i: number) => void;
  show: () => void;
  hide: () => void;
  toggleMute: () => void;
  seek: (pct: number) => void;
};

const MusicCtx = createContext<Ctx | null>(null);

export function useMusic() {
  const ctx = useContext(MusicCtx);
  if (!ctx) throw new Error("useMusic must be used inside <MusicProvider>");
  return ctx;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Create audio once — persists across route changes because provider lives in root.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (audioRef.current) return; // guard StrictMode double-mount
    const a = new Audio(PLAYLIST[0].src);
    a.preload = "auto";
    a.volume = 0.7;
    audioRef.current = a;
    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setIndex((i) => (i + 1) % PLAYLIST.length);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);

    // Attempt autoplay; on block, play muted and unmute on first gesture
    // (without forcing play again — fixes pause-not-working bug).
    let unmuteHandler: (() => void) | null = null;
    const cleanupUnmute = () => {
      if (!unmuteHandler) return;
      window.removeEventListener("pointerdown", unmuteHandler);
      window.removeEventListener("keydown", unmuteHandler);
      window.removeEventListener("touchstart", unmuteHandler);
      window.removeEventListener("scroll", unmuteHandler);
      unmuteHandler = null;
    };
    const tryAutoplay = async () => {
      try {
        await a.play();
      } catch {
        try {
          a.muted = true;
          setMuted(true);
          await a.play();
          unmuteHandler = () => {
            a.muted = false;
            setMuted(false);
            // Do NOT force play here — if user already paused, respect that.
            if (!userPausedRef.current && a.paused) a.play().catch(() => {});
            cleanupUnmute();
          };
          window.addEventListener("pointerdown", unmuteHandler);
          window.addEventListener("keydown", unmuteHandler);
          window.addEventListener("touchstart", unmuteHandler);
          window.addEventListener("scroll", unmuteHandler);
        } catch {
          const startOnGesture = () => {
            a.muted = false;
            setMuted(false);
            if (!userPausedRef.current) a.play().catch(() => {});
            window.removeEventListener("pointerdown", startOnGesture);
            window.removeEventListener("keydown", startOnGesture);
            window.removeEventListener("touchstart", startOnGesture);
          };
          window.addEventListener("pointerdown", startOnGesture, { once: true });
          window.addEventListener("keydown", startOnGesture, { once: true });
          window.addEventListener("touchstart", startOnGesture, { once: true });
        }
      }
    };
    tryAutoplay();

    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      cleanupUnmute();
      audioRef.current = null;
    };
  }, []);

  // Swap source when index changes
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const wasPlaying = playing;
    a.src = PLAYLIST[index].src;
    a.load();
    if (wasPlaying) a.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const play = useCallback(() => {
    userPausedRef.current = false;
    audioRef.current?.play().catch(() => {});
  }, []);
  const pause = useCallback(() => {
    userPausedRef.current = true;
    audioRef.current?.pause();
  }, []);
  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      userPausedRef.current = false;
      a.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      a.pause();
    }
  }, []);
  const next = useCallback(() => setIndex((i) => (i + 1) % PLAYLIST.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length),
    [],
  );
  const selectIndex = useCallback((i: number) => {
    userPausedRef.current = false;
    setIndex(i);
    setTimeout(() => audioRef.current?.play().catch(() => {}), 50);
  }, []);
  const toggleMute = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }, []);
  const seek = useCallback((pct: number) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = pct * a.duration;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      playlist: PLAYLIST,
      index,
      playing,
      visible,
      muted,
      progress,
      duration,
      play,
      pause,
      toggle,
      next,
      prev,
      selectIndex,
      show: () => setVisible(true),
      hide: () => setVisible(false),
      toggleMute,
      seek,
    }),
    [index, playing, visible, muted, progress, duration, play, pause, toggle, next, prev, selectIndex, toggleMute, seek],
  );

  return <MusicCtx.Provider value={value}>{children}</MusicCtx.Provider>;
}

function fmt(s: number) {
  if (!isFinite(s) || s <= 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function FloatingMusicPlayer() {
  const m = useMusic();
  const [open, setOpen] = useState(false);
  const track = m.playlist[m.index];
  const pct = m.duration > 0 ? (m.progress / m.duration) * 100 : 0;

  if (!m.visible) {
    return (
      <button
        onClick={m.show}
        aria-label="Show music player"
        className="fixed bottom-4 right-4 z-[60] grid h-11 w-11 place-items-center rounded-full border border-primary/40 bg-background/80 text-primary backdrop-blur-xl hover:bg-primary/10 shadow-[var(--shadow-glow)] animate-fade-in"
      >
        <Music2 className={`h-5 w-5 ${m.playing ? "animate-pulse" : ""}`} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[min(94vw,360px)] rounded-2xl border border-primary/30 bg-background/85 backdrop-blur-xl shadow-[var(--shadow-glow)] animate-fade-in overflow-hidden">
      {/* Equalizer / header */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/60">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary shrink-0">
          <Music2 className={`h-4 w-4 ${m.playing ? "animate-pulse" : ""}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">{track.title}</div>
          <div className="text-[11px] text-muted-foreground truncate">{track.artist}</div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] rounded-md border border-border/70 px-2 py-1 hover:border-primary/50 hover:text-primary"
        >
          {open ? "Tutup" : "Playlist"}
        </button>
        <button
          onClick={m.hide}
          aria-label="Hide player"
          className="grid h-7 w-7 place-items-center rounded-md border border-border/70 hover:border-primary/50 hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress */}
      <div
        className="group relative h-1.5 cursor-pointer bg-muted"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          m.seek((e.clientX - r.left) / r.width);
        }}
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/40"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="text-[10px] tabular-nums text-muted-foreground w-9">{fmt(m.progress)}</span>
        <div className="flex-1 flex items-center justify-center gap-1">
          <button
            onClick={m.prev}
            aria-label="Previous"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent/50"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={m.toggle}
            aria-label={m.playing ? "Pause" : "Play"}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)]"
          >
            {m.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
          </button>
          <button
            onClick={m.next}
            aria-label="Next"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent/50"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={m.toggleMute}
          aria-label="Mute"
          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent/50 text-muted-foreground"
        >
          {m.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <span className="text-[10px] tabular-nums text-muted-foreground w-9 text-right">{fmt(m.duration)}</span>
      </div>

      {open && (
        <ul className="max-h-56 overflow-auto border-t border-border/60 py-1 text-sm">
          {m.playlist.map((t, i) => (
            <li key={t.src}>
              <button
                onClick={() => m.selectIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent/40 transition ${
                  i === m.index ? "text-primary" : ""
                }`}
              >
                <span className="text-[10px] w-4 text-muted-foreground tabular-nums">{i + 1}</span>
                <span className="flex-1 truncate">{t.title}</span>
                {i === m.index && m.playing && (
                  <span className="flex items-end gap-[2px] h-3">
                    <span className="w-[2px] bg-primary animate-eq1" />
                    <span className="w-[2px] bg-primary animate-eq2" />
                    <span className="w-[2px] bg-primary animate-eq3" />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
