
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    preparationTime: number;
  };
  onSave: (item: any) => void;
}

const MenuItemForm = ({ open, onOpenChange, item, onSave }: MenuItemFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: item?.id || -1,
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    category: item?.category || 'main',
    image: item?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    isVegetarian: item?.isVegetarian || false,
    isAvailable: item?.isAvailable !== undefined ? item.isAvailable : true,
    preparationTime: item?.preparationTime || 15,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields with valid values.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(formData);
    toast({
      title: item ? "Item Updated" : "Item Added",
      description: `${formData.name} has been ${item ? 'updated' : 'added'} successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit' : 'Add'} Menu Item</DialogTitle>
          <DialogDescription>
            {item ? 'Update the details of your menu item.' : 'Add a new item to your menu.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g., Butter Chicken" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input 
                id="price" 
                name="price" 
                type="number"
                value={formData.price} 
                onChange={handleChange} 
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Describe the dish..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('category', value)} 
                defaultValue={formData.category}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="main">Main Course</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Preparation Time (mins)</Label>
              <Input 
                id="preparationTime" 
                name="preparationTime" 
                type="number"
                value={formData.preparationTime} 
                onChange={handleChange} 
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input 
              id="image" 
              name="image" 
              value={formData.image} 
              onChange={handleChange} 
              placeholder="https://example.com/image.jpg" 
            />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="h-24 w-auto object-cover rounded-md" 
                />
              </div>
            )}
          </div>

          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="isVegetarian" 
                checked={formData.isVegetarian}
                onCheckedChange={(checked) => handleSwitchChange('isVegetarian', checked)}
              />
              <Label htmlFor="isVegetarian">Vegetarian</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isAvailable" 
                checked={formData.isAvailable}
                onCheckedChange={(checked) => handleSwitchChange('isAvailable', checked)}
              />
              <Label htmlFor="isAvailable">Available</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuItemForm;
