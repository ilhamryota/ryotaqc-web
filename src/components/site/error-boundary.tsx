import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
  boundary?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Section-level error boundary. Wrap non-critical widgets (music player,
 * animated hero, third-party embeds) so a single failure doesn't crash the page.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportLovableError(error, { boundary: this.props.boundary ?? "section_error_boundary", componentStack: info.componentStack ?? undefined });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-xl border border-border bg-card/60 p-4 text-xs text-muted-foreground">
            Komponen ini gagal dimuat. Bagian lain halaman tetap dapat digunakan.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
