
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
import { Calendar, Clock, Percent, Tag } from 'lucide-react';

interface PromotionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: {
    id: number;
    title: string;
    description: string;
    type: string;
    discount?: number;
    startTime?: string;
    endTime?: string;
    startDate?: string;
    endDate?: string;
    active: boolean;
  };
  onSave: (promotion: any) => void;
}

const PromotionForm = ({ open, onOpenChange, promotion, onSave }: PromotionFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: promotion?.id || -1,
    title: promotion?.title || '',
    description: promotion?.description || '',
    type: promotion?.type || 'percentage',
    discount: promotion?.discount || 10,
    startTime: promotion?.startTime || '08:00',
    endTime: promotion?.endTime || '20:00',
    startDate: promotion?.startDate || new Date().toISOString().split('T')[0],
    endDate: promotion?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: promotion?.active !== undefined ? promotion.active : true,
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
    
    if (!formData.title || formData.discount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields with valid values.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(formData);
    toast({
      title: promotion ? "Promotion Updated" : "Promotion Added",
      description: `${formData.title} has been ${promotion ? 'updated' : 'added'} successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{promotion ? 'Edit' : 'Create'} Promotion</DialogTitle>
          <DialogDescription>
            {promotion ? 'Update your promotion details.' : 'Create a new promotion for your customers.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Promotion Title *</Label>
            <Input 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g., Weekend Special" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Describe the promotion..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Promotion Type</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('type', value)} 
                defaultValue={formData.type}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Discount</SelectItem>
                  <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                  <SelectItem value="bundle">Buy X Get Y</SelectItem>
                  <SelectItem value="time-based">Time-Based Special</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount">
                {formData.type === 'percentage' ? 'Discount (%)' : 
                 formData.type === 'fixed' ? 'Amount Off (₹)' : 
                 'Discount Value'}
              </Label>
              <div className="relative">
                <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  id="discount" 
                  name="discount" 
                  type="number"
                  value={formData.discount} 
                  onChange={handleChange} 
                  className="pl-8"
                  min="1"
                  max={formData.type === 'percentage' ? "100" : undefined}
                />
              </div>
            </div>
          </div>

          {(formData.type === 'time-based' || formData.type === 'percentage') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    id="startTime" 
                    name="startTime" 
                    type="time"
                    value={formData.startTime} 
                    onChange={handleChange} 
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    id="endTime" 
                    name="endTime" 
                    type="time"
                    value={formData.endTime} 
                    onChange={handleChange} 
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  id="startDate" 
                  name="startDate" 
                  type="date"
                  value={formData.startDate} 
                  onChange={handleChange} 
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input 
                  id="endDate" 
                  name="endDate" 
                  type="date"
                  value={formData.endDate} 
                  onChange={handleChange} 
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="active" 
              checked={formData.active}
              onCheckedChange={(checked) => handleSwitchChange('active', checked)}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {promotion ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionForm;
