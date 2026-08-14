import { StrictMode } from "react";
import { ApolloProvider } from "@apollo/client";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import App from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { apolloClient } from "@/lib/apollo";
import { ThemeProvider } from "@/providers/ThemeProvider";

import "@/index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root is missing from index.html.");
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter>
            <TooltipProvider delayDuration={200}>
              <App />
              {/* One toast system. The previous build mounted three
                  simultaneously: Radix Toaster, Sonner, and a bespoke one. */}
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  classNames: {
                    toast:
                      "border border-border bg-popover text-popover-foreground",
                  },
                }}
              />
            </TooltipProvider>
          </BrowserRouter>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
