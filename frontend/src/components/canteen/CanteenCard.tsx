
import React from "react";
import { Link } from "react-router-dom";
import { Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CanteenCardProps {
  canteen: {
    id: number;
    name: string;
    image: string;
    location: string;
    rating: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  };
}

const CanteenCard: React.FC<CanteenCardProps> = ({ canteen }) => {
  return (
    <Link to={`/canteen/${canteen.id}`}>
      <Card className="overflow-hidden transition-transform duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={canteen.image}
            alt={canteen.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge variant={canteen.isOpen ? "success" : "destructive"}>
              {canteen.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold">{canteen.name}</h3>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-sm font-medium">{canteen.rating}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{canteen.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{canteen.openTime} - {canteen.closeTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CanteenCard;
