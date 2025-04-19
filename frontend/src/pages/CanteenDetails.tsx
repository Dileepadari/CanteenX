import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import MenuItemWithCustomization from "@/components/food/MenuItemWithCustomization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApolloClient } from "@apollo/client";
import { GET_CANTEEN_BY_ID } from "@/gql/queries/canteens";
import { GET_MENU_ITEMS_BY_CANTEEN } from "@/gql/queries/menuItems";

const CanteenDetails = () => {
  const { id } = useParams<{ id: string }>();
  const canteenId = parseInt(id || "1");
  const [canteen, setCanteen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const client = useApolloClient();

  useEffect(() => {
    const fetchCanteenDetails = async () => {
      try {
        setLoading(true);
        const { data: canteenData } = await client.query({
          query: GET_CANTEEN_BY_ID,
          variables: { id: canteenId },
        });
        setCanteen(canteenData?.getCanteenById || null);

        const { data: menuData } = await client.query({
          query: GET_MENU_ITEMS_BY_CANTEEN,
          variables: { canteenId },
        });
        setMenuItems(menuData?.getMenuItemsByCanteen || []);
      } catch (err) {
        setError(err);
        toast({
          title: "Error",
          description: "Failed to fetch canteen details or menu items.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCanteenDetails();
  }, [client, canteenId, toast]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading canteen details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !canteen) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Canteen not found</h2>
        </div>
      </MainLayout>
    );
  }

  const getIconForTag = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "vegetarian":
        return <span className="text-green-500">🥗</span>;
      case "non-vegetarian":
        return <span className="text-red-500">🍖</span>;
      case "beverages":
        return <span className="text-brown-500">☕</span>;
      case "fast food":
        return <span className="text-yellow-500">🍔</span>;
      default:
        return <span className="text-gray-500">ℹ️</span>;
    }
  };

  return (
    <MainLayout>
      <div className="container px-4 py-8 mx-auto">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          Back to Canteens
        </Button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-100">
          <div className="aspect-[3/1] overflow-hidden">
            <img
              src={canteen.image}
              alt={canteen.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h1 className="text-3xl font-bold text-orange-600 mb-2 md:mb-0">
                {canteen.name}
              </h1>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="text-lg font-medium">{canteen.rating}</span>
                <span className="text-sm text-gray-500 ml-1">
                  ({canteen.ratingCount} ratings)
                </span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{canteen.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-gray-600">{canteen.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Opening Hours</h4>
                    <p className="text-gray-600">
                      {canteen.openTime} - {canteen.closeTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Contact</h4>
                    <p className="text-gray-600">{canteen.phone}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-gray-600">{canteen.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-medium mb-3">Meal Schedule</h3>
                {canteen?.schedule?.breakfast && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Breakfast</span>
                    <span className="text-gray-600">{canteen?.schedule?.breakfast}</span>
                  </div>
                )}
                {canteen?.schedule?.lunch && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Lunch</span>
                    <span className="text-gray-600">{canteen?.schedule?.lunch}</span>
                  </div>
                )}
                {canteen?.schedule?.dinner && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Dinner</span>
                    <span className="text-gray-600">{canteen?.schedule?.dinner}</span>
                  </div>
                )}
                {canteen?.schedule?.regular && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Regular Hours</span>
                    <span className="text-gray-600">{canteen?.schedule?.regular}</span>
                  </div>
                )}
                {canteen?.schedule?.evening && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Evening</span>
                    <span className="text-gray-600">{canteen?.schedule?.evening}</span>
                  </div>
                )}
                {canteen?.schedule?.night && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Night</span>
                    <span className="text-gray-600">{canteen?.schedule?.night}</span>
                  </div>
                )}
                {canteen?.schedule?.weekday && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Weekdays</span>
                    <span className="text-gray-600">{canteen?.schedule?.weekday}</span>
                  </div>
                )}
                {canteen?.schedule?.weekend && (
                  <div className="flex justify-between py-1">
                    <span>Weekends</span>
                    <span className="text-gray-600">{canteen?.schedule?.weekend}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {canteen.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                >
                  {getIconForTag(tag)}
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Menu Items</h2>
        {menuItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <MenuItemWithCustomization key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No menu items available.</p>
        )}
      </div>
    </MainLayout>
  );
};

export default CanteenDetails;
