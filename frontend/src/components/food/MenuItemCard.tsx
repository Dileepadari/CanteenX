
import React from "react";
import { Plus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {item.isVegetarian && (
            <Badge className="bg-green-500 text-white">Veg</Badge>
          )}
          {item.isPopular && (
            <Badge className="bg-canteen-orange text-white">Popular</Badge>
          )}
        </div>
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-base font-bold">{item.name}</h3>
          <div className="flex items-center text-sm bg-gray-100 px-2 py-0.5 rounded">
            <span className="font-medium">₹{item.price}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>

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
