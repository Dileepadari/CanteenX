import { Link } from "react-router-dom";

import { CanteenXMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grain flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center">
      <div className="relative z-[2]">
        <CanteenXMark className="mx-auto h-14 w-14 text-primary opacity-40" />
        <p className="mt-6 font-display text-6xl font-semibold tracking-tight">404</p>
        <h1 className="mt-2 font-display text-xl font-semibold">
          That page is off the menu
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The link may be out of date, or the page may have moved.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/menu">Browse the menu</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
