
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative bg-gradient-to-r from-canteen-blue to-canteen-orange text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Smart Canteen: Your Campus Food Solution
          </h1>
          <p className="text-lg mb-8 opacity-90">
            Skip the lines. Order ahead. Real-time tracking. Multiple canteens.
            All in one place.
          </p>

          <div className="max-w-md mx-auto bg-white rounded-lg p-1 flex">
            <Input
              placeholder="Search for canteens, dishes..."
              className="border-0 focus-visible:ring-0 text-black"
            />
            <Button size="sm" className="shrink-0">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex justify-center mt-8 space-x-4">
            <Button variant="secondary" size="lg" onClick={() => navigate("/canteens")}>
              View Canteens
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white" onClick={() => navigate("#how-it-works")}>
              How It Works
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
