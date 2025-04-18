
import React, { useState } from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { menuItems } from '@/data/mockData';
import { Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VendorMenu = () => {
  const { toast } = useToast();
  const [items, setItems] = useState(menuItems);

  const handleAvailabilityToggle = (itemId: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    );
    
    toast({
      title: "Availability updated",
      description: "Item availability has been updated successfully.",
    });
  };

  const handleEditItem = (itemId: number) => {
    // In a real app, this would open an edit modal
    toast({
      title: "Edit item",
      description: "Item editing functionality coming soon.",
    });
  };

  const handleDeleteItem = (itemId: number) => {
    // In a real app, this would show a confirmation dialog
    toast({
      title: "Delete item",
      description: "Item deletion functionality coming soon.",
    });
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Menu Management</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-24 rounded-md overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditItem(item.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="mb-2">
                        <Label htmlFor={`price-${item.id}`}>Price</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          value={item.price}
                          className="w-24"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => handleAvailabilityToggle(item.id)}
                        />
                        <Label>Available</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorMenu;
