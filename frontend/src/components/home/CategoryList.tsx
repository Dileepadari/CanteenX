
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Coffee, 
  UtensilsCrossed, 
  Moon, 
  Cookie, 
  Wine, 
  IceCream,
  LucideIcon
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  // Map icon names to Lucide icons
  const getIcon = (iconName: string): React.ReactElement => {
    const iconMap: Record<string, LucideIcon> = {
      coffee: Coffee,
      utensils: UtensilsCrossed,
      moon: Moon,
      cookie: Cookie,
      "mug-hot": Wine,
      "ice-cream": IceCream,
    };

    const IconComponent = iconMap[iconName] || Coffee;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-4">Categories</h2>
      <div className="flex overflow-x-auto pb-2 -mx-2 px-2 space-x-2 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          className="rounded-full px-4"
          onClick={() => onSelectCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className="rounded-full px-4 whitespace-nowrap"
            onClick={() => onSelectCategory(category.id)}
          >
            {getIcon(category.icon)}
            <span className="ml-2">{category.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
