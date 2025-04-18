
import React, { useState } from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Tag, 
  Edit, 
  Trash,
  AlarmClock,
  ShoppingBag
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import PromotionForm from '@/components/vendor/PromotionForm';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNotification } from '@/contexts/NotificationContext';

const VendorPromotions = () => {
  const { toast } = useToast();
  const { addNotification } = useNotification();
  
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      title: "Lunch Hour Special",
      description: "10% off on all main course items",
      type: "time-based",
      discount: 10,
      startTime: "12:00",
      endTime: "15:00",
      startDate: "2025-04-01",
      endDate: "2025-05-31",
      active: true,
    },
    {
      id: 2,
      title: "Weekend Bundle",
      description: "Buy any 2 items and get 1 free",
      type: "bundle",
      discount: 100,
      startDate: "2025-04-20",
      endDate: "2025-04-21",
      active: false,
    },
    {
      id: 3,
      title: "Early Bird Breakfast",
      description: "20% off on all breakfast items before 9 AM",
      type: "percentage",
      discount: 20,
      startTime: "07:00",
      endTime: "09:00",
      startDate: "2025-04-01",
      endDate: "2025-12-31",
      active: true,
    },
  ]);
  
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [promotionToEdit, setPromotionToEdit] = useState(null);
  const [promotionToDelete, setPromotionToDelete] = useState(null);

  const handleSavePromotion = (formData) => {
    if (formData.id === -1) {
      // Add new promotion
      const newPromotion = {
        ...formData,
        id: Math.max(...promotions.map(promo => promo.id), 0) + 1,
      };
      
      setPromotions(prev => [...prev, newPromotion]);
      
      addNotification({
        title: "New Promotion Created",
        description: `${formData.title} has been added to your promotions.`,
        type: "success"
      });
    } else {
      // Update existing promotion
      setPromotions(prevPromotions =>
        prevPromotions.map(promo =>
          promo.id === formData.id ? { ...promo, ...formData } : promo
        )
      );
      
      addNotification({
        title: "Promotion Updated",
        description: `${formData.title} has been updated.`,
        type: "info"
      });
    }
  };
  
  const handleToggleActive = (id) => {
    setPromotions(prevPromotions =>
      prevPromotions.map(promo =>
        promo.id === id ? { ...promo, active: !promo.active } : promo
      )
    );
    
    const promotion = promotions.find(p => p.id === id);
    const newStatus = !promotion.active;
    
    toast({
      title: `Promotion ${newStatus ? 'Activated' : 'Deactivated'}`,
      description: `${promotion.title} is now ${newStatus ? 'active' : 'inactive'}.`,
    });
  };
  
  const confirmDeletePromotion = () => {
    setPromotions(prevPromotions => 
      prevPromotions.filter(promo => promo.id !== promotionToDelete.id)
    );
    
    toast({
      title: "Promotion Deleted",
      description: `${promotionToDelete.title} has been removed.`,
    });
    
    addNotification({
      title: "Promotion Deleted",
      description: `${promotionToDelete.title} has been deleted.`,
      type: "warning"
    });
    
    setPromotionToDelete(null);
  };
  
  const getPromotionIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Tag className="h-10 w-10 text-blue-500" />;
      case 'fixed':
        return <Tag className="h-10 w-10 text-green-500" />;
      case 'bundle':
        return <ShoppingBag className="h-10 w-10 text-purple-500" />;
      case 'time-based':
        return <AlarmClock className="h-10 w-10 text-orange-500" />;
      default:
        return <Tag className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Promotions & Discounts</h2>
          <Button onClick={() => setShowPromotionForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>

        {promotions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No promotions created yet.</p>
              <Button className="mt-4" onClick={() => setShowPromotionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Promotion
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map(promo => (
              <Card key={promo.id} className={promo.active ? 'border-green-300' : ''}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-gray-100 p-2">
                      {getPromotionIcon(promo.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {promo.title}
                      </CardTitle>
                      <div className="flex mt-1 gap-2 flex-wrap">
                        <Badge variant={promo.active ? "default" : "secondary"}>
                          {promo.active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {promo.type === 'percentage' ? 'Percentage Discount' : 
                           promo.type === 'fixed' ? 'Fixed Amount' : 
                           promo.type === 'bundle' ? 'Bundle Offer' : 'Time-Based'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    {promo.description}
                  </p>
                  
                  <div className="space-y-2">
                    {(promo.type === 'time-based' || promo.type === 'percentage') && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {promo.startTime} - {promo.endTime}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(promo.startDate).toLocaleDateString()} to {new Date(promo.endDate).toLocaleDateString()}
                    </div>
                    
                    {promo.discount && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Tag className="h-4 w-4 mr-2" />
                        {promo.type === 'percentage' 
                          ? `${promo.discount}% off` 
                          : `₹${promo.discount} off`}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={promo.active} 
                        onCheckedChange={() => handleToggleActive(promo.id)} 
                      />
                      <span className="text-sm">
                        {promo.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPromotionToEdit(promo)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPromotionToDelete(promo)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Promotion Form */}
      <PromotionForm 
        open={showPromotionForm} 
        onOpenChange={setShowPromotionForm}
        onSave={handleSavePromotion}
      />
      
      {promotionToEdit && (
        <PromotionForm 
          open={!!promotionToEdit} 
          onOpenChange={(open) => !open && setPromotionToEdit(null)}
          promotion={promotionToEdit}
          onSave={handleSavePromotion}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!promotionToDelete} onOpenChange={(open) => !open && setPromotionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promotion "{promotionToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePromotion}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VendorLayout>
  );
};

export default VendorPromotions;
