import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Background image (uses public/placeholder.svg). Keeps an overlay for text legibility. */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url('/hero-bg.png')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/10" />
      </div>

      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 C300,160 600,0 1440,120 L1440,150 L0,150 Z"
          className="fill-background"
        />
      </svg>

      <div className="relative z-10 container mx-auto px-4 py-28 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white drop-shadow-lg">
          CanteenX: Your Campus Food Solution
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90 mb-10 font-bold">
          Skip the lines. Order ahead. Real-time tracking. Multiple canteens.
          All in one place.
        </p>

        <div className="flex justify-center gap-4 mt-4">
          <Button
            variant="secondary"
            size="lg"
            className="font-semibold shadow-lg"
            onClick={() => navigate("/canteens")}
          >
            View Canteens
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="font-semibold bg-white/10 hover:bg-white/20 text-white border-white"
            onClick={() => navigate('/how-it-works')}
          >
            How It Works
          </Button>
        </div>
      </div>
    </section>
  );
};

