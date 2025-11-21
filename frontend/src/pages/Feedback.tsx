import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useQuery } from '@apollo/client';
import { GET_MENU_ITEMS } from '@/gql/queries/menuItems';
import { GET_CANTEEN_BY_ID } from '@/gql/queries/canteens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNotification } from '@/contexts/NotificationContext';
import ReviewForm from '@/components/feedback/ReviewForm';
import ComplaintForm from '@/components/feedback/ComplaintForm';
import { ChevronLeft } from 'lucide-react';

const Feedback = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  // Convert string ID to number for comparison
  const numericItemId = itemId ? parseInt(itemId, 10) : undefined;
  
  // Find menu item by id if provided (fetch menu items via GraphQL)
  const { data: menuData } = useQuery(GET_MENU_ITEMS);
  const fetchedMenuItems = menuData?.getMenuItems || [];
  const menuItem = numericItemId ? fetchedMenuItems.find((item: any) => item.id === numericItemId) : undefined;

  // Find canteen by id via GraphQL if menu item is found
  const { data: canteenData } = useQuery(GET_CANTEEN_BY_ID, {
    variables: { id: menuItem?.canteenId },
    skip: !menuItem?.canteenId,
  });
  const canteen = canteenData?.getCanteenById;
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {menuItem ? (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Feedback for {menuItem.name} at {canteen?.name || 'Unknown Canteen'}
                </h2>
                <Tabs defaultValue="review" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="review">Write a Review</TabsTrigger>
                    <TabsTrigger value="complaint">File a Complaint</TabsTrigger>
                  </TabsList>
                  <TabsContent value="review">
                    <ReviewForm itemId={menuItem?.id} canteenId={menuItem?.canteenId} onSubmitSuccess={() => {
                      addNotification({
                        title: "Review Submitted",
                        description: `Thank you for your review of ${menuItem?.name || 'the item'}!`,
                        type: "success",
                      });
                    }} />
                  </TabsContent>
                  <TabsContent value="complaint">
                    <ComplaintForm canteenId={menuItem?.canteenId} onSubmitSuccess={() => {
                      addNotification({
                        title: "Complaint Submitted",
                        description: `Your complaint about ${menuItem?.name || 'the item'} has been submitted.`,
                        type: "info",
                      });
                    }} />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="text-center py-8">
                <h2 className="text-lg font-semibold mb-2">Item Not Found</h2>
                <p className="text-gray-500">
                  Please select a valid menu item to provide feedback.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Feedback;
