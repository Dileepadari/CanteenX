
import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  PackageCheck, 
  X,
  CheckCheck
} from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className }) => {
  const getBadgeContent = () => {
    switch (status) {
      case "pending":
        return {
          variant: "warning" as const,
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          text: "Pending",
        };
      case "confirmed":
        return {
          variant: "secondary" as const,
          icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
          text: "Confirmed",
        };
      case "preparing":
        return {
          variant: "default" as const,
          icon: <ChefHat className="h-3.5 w-3.5 mr-1" />,
          text: "Preparing",
        };
      case "ready":
        return {
          variant: "success" as const,
          icon: <PackageCheck className="h-3.5 w-3.5 mr-1" />,
          text: "Ready",
        };
      case "delivered":
        return {
          variant: "success" as const,
          icon: <CheckCheck className="h-3.5 w-3.5 mr-1" />,
          text: "Delivered",
        };
      case "cancelled":
        return {
          variant: "destructive" as const,
          icon: <X className="h-3.5 w-3.5 mr-1" />,
          text: "Cancelled",
        };
      default:
        return {
          variant: "default" as const,
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
          text: status,
        };
    }
  };

  const { variant, icon, text } = getBadgeContent();

  return (
    <Badge variant={variant} className={`flex items-center px-3 py-1 rounded-md text-xs ${className}`}>
      {icon}
      {text}
    </Badge>
  );
};

export default OrderStatusBadge;
