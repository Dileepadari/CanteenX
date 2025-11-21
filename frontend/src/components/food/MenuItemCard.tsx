
import React from "react";
import { Plus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPlaceholderImage, ensureImageSrc } from '@/lib/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    isPopular: boolean;
    customizationOptions: Array<{ id: number; name: string; price: number }>;
    rating: number;
    ratingCount?: number;
    preparationTime?: number;
    stockCount?: number;
    tags?: string[];
  };
  onAddToCart: (itemId: number) => void;
  onViewDetails: (itemId: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  onViewDetails,
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <img
          src={ensureImageSrc(item.image, item.id, 800, 480)}
          alt={item.name}
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage(item.id, 800, 480); }}
        />
        {/* Veg / Non-veg marker (top-right) */}
        <div className="absolute top-2 right-2">
          <div
            title={item.isVegetarian ? 'Vegetarian' : 'Non - Vegetarian'}
            className={`w-5 h-5 rounded-full ring-2 ring-white ${item.isVegetarian ? 'bg-emerald-500' : 'bg-red-600'}`}
          />
        </div>

        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {item.isPopular && (
            <Badge variant="secondary">Popular</Badge>
          )}
        </div>
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-muted/60 flex items-center justify-center">
            <span className="text-muted-foreground font-bold text-lg">Out of Stock</span>
          </div>
        )}

        {/* Bottom-left overlay: prep time and stock */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          {item.preparationTime != null && (
            <div className="bg-white/80 text-sm text-gray-800 px-2 py-0.5 rounded-md">{item.preparationTime} min</div>
          )}
          {item.stockCount != null && (
            <div className={`text-sm px-2 py-0.5 rounded-md ${item.stockCount > 0 ? 'bg-white/80 text-gray-800' : 'bg-red-50 text-red-600'}`}>
              {item.stockCount > 0 ? `${item.stockCount} left` : '0 in stock'}
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-bold">{item.name}</h3>
          <div className="flex items-center text-sm bg-muted px-2 py-0.5 rounded">
            <span className="font-medium">₹{item.price}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-0 w-8 h-8 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onViewDetails(item.id);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="default"
            size="sm"
            className="gap-1"
            disabled={!item.isAvailable}
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(item.id);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;
