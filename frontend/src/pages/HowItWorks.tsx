import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">How CanteenX Works</h1>
          <p className="text-lg text-gray-600 mb-8">
            CanteenX makes ordering from campus canteens fast and easy. Follow these simple steps to place
            an order and skip the queue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary mb-2">1</div>
              <h3 className="font-semibold mb-2">Browse & Customize</h3>
              <p className="text-sm text-gray-600">Explore menus from multiple canteens, choose addons and customize quantities.</p>
            </div>

            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary mb-2">2</div>
              <h3 className="font-semibold mb-2">Place Order & Pay</h3>
              <p className="text-sm text-gray-600">Checkout securely using available payment methods and choose pickup time.</p>
            </div>

            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary mb-2">3</div>
              <h3 className="font-semibold mb-2">Track & Pickup</h3>
              <p className="text-sm text-gray-600">Get status updates while your food is prepared and pick it up at the dedicated counter.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tips</h2>
            <ul className="list-disc list-inside text-left text-gray-700">
              <li>Preselect popular customizations to speed up repeat orders.</li>
              <li>Check low-stock warnings in menu pages to avoid unavailable items.</li>
              <li>Use scheduled pickup to avoid peak-time lines.</li>
            </ul>
          </div>

          <div className="mt-10">
            <Button onClick={() => navigate('/canteens')} className="mr-4">Browse Canteens</Button>
            <Button variant="outline" onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HowItWorks;
