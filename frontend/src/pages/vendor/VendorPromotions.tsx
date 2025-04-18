
import React from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, Tag } from 'lucide-react';

const VendorPromotions = () => {
  const promotions = [
    {
      id: 1,
      title: "Lunch Hour Special",
      description: "10% off on all main course items",
      type: "time-based",
      discount: 10,
      startTime: "12:00",
      endTime: "15:00",
      active: true,
    },
    {
      id: 2,
      title: "Weekend Bundle",
      description: "Buy any 2 items and get 1 free",
      type: "bundle",
      active: false,
      startDate: "2024-04-20",
      endDate: "2024-04-21",
    },
  ];

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Promotions & Discounts</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map(promo => (
            <Card key={promo.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {promo.title}
                </CardTitle>
                <Badge variant={promo.active ? "default" : "secondary"}>
                  {promo.active ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  {promo.description}
                </p>
                
                <div className="space-y-2">
                  {promo.type === "time-based" && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {promo.startTime} - {promo.endTime}
                    </div>
                  )}
                  
                  {promo.startDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {promo.startDate} to {promo.endDate}
                    </div>
                  )}
                  
                  {promo.discount && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="h-4 w-4 mr-2" />
                      {promo.discount}% off
                    </div>
                  )}
                </div>
                
                <div className="mt-4 space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    {promo.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorPromotions;
