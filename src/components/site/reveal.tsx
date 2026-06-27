import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({ children, className = "", delay = 0, y = 24 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        opacity: shown ? 1 : 0,
        transition: `transform 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms, opacity 700ms ease ${delay}ms`,
        willChange: "transform, opacity",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[70] h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary/80 to-transparent shadow-[0_0_10px_var(--color-primary)]"
        style={{ width: `${p}%`, transition: "width 80ms linear" }}
      />
    </div>
  );
}

export function RouteFade({ pathKey, children }: { pathKey: string; children: ReactNode }) {
  return (
    <div key={pathKey} className="animate-route-in">
      {children}
    </div>
  );
}
