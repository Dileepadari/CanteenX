/**
 * Application error boundary.
 *
 * The previous build had none, so any render error blanked the whole page with
 * no way back.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Left as console output deliberately: wiring this to a reporting service
    // is a deployment decision, and swallowing it silently is worse.
    console.error("Unhandled render error", error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="surface w-full max-w-md p-8 text-center">
          <h1 className="font-display text-xl font-semibold">
            This page hit an error
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something broke while rendering. Reloading usually clears it.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-destructive">
              {error.message}
            </pre>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Button variant="outline" onClick={this.reset}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
