import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <div className="text-3xl font-bold text-foreground">Terjadi kesalahan</div>
          <p className="max-w-md text-sm text-muted-foreground">
            {this.state.message || "Sesuatu tidak berjalan sebagaimana mestinya."}
          </p>
          <Button onClick={() => window.location.reload()}>Muat ulang halaman</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
