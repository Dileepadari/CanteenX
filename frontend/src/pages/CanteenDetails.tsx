import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import MenuItemWithCustomization from "@/components/food/MenuItemWithCustomization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Phone, Mail, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApolloClient } from "@apollo/client";
import { GET_CANTEEN_BY_ID } from "@/gql/queries/canteens";
import { GET_MENU_ITEMS_BY_CANTEEN } from "@/gql/queries/menuItems";
import { GET_USER_BY_ID } from '@/gql/queries/user';
import { getPlaceholderImage, ensureImageSrc } from '@/lib/image';

const CanteenDetails = () => {
  const { id } = useParams<{ id: string }>();
  const canteenId = parseInt(id || "1");
  const [canteen, setCanteen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [ownerName, setOwnerName] = useState<string | null>(null);
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

  // Fetch owner/user name when canteen is loaded
  useEffect(() => {
    if (!canteen?.userId) return;

    // try to parse userId as int if possible
    const maybeInt = parseInt(String(canteen.userId), 10);
    if (!isNaN(maybeInt)) {
      client
        .query({ query: GET_USER_BY_ID, variables: { id: maybeInt } })
        .then((res: any) => {
          const user = res?.data?.getUserById;
          if (user && user.name) setOwnerName(user.name);
          else setOwnerName(String(canteen.userId));
        })
        .catch(() => setOwnerName(String(canteen.userId)));
    } else {
      // userId is not an integer; display raw id
      setOwnerName(String(canteen.userId));
    }
  }, [canteen, client]);

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

  // removed emoji-based tag icons; we'll use a neutral Tag icon for clarity

  return (
    <MainLayout>
      <div className="container px-4 py-8 mx-auto">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="mb-4 text-primary hover:text-primary/90 hover:bg-muted"
        >
          Back to Canteens
        </Button>

  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
          <div className="aspect-[3/1] overflow-hidden">
            <img
              src={canteen.image ? ensureImageSrc(canteen.image, canteen?.id ?? 'canteen', 1200, 400) : getPlaceholderImage(canteen?.id ?? 'canteen', 1200, 400)}
              alt={canteen.name || 'Canteen image'}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage(canteen?.id ?? 'canteen', 1200, 400); }}
            />
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2 md:mb-0">
                  {canteen.name || 'Unnamed Canteen'}
                </h1>
                <div className="mt-2">
                  {canteen.isOpen ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">Open</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800">Closed</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <Star className="w-5 h-5 text-primary mr-1" />
                <span className="text-lg font-medium">{canteen.rating ?? 'N/A'}</span>
                <span className="text-sm text-gray-500 ml-1">({canteen.ratingCount ?? 0} ratings)</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">{canteen.description || 'No description available'}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-gray-600">{canteen.location || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-primary mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Opening Hours</h4>
                    <p className="text-gray-600">
                      {canteen.openTime && canteen.closeTime ? `${canteen.openTime} - ${canteen.closeTime}` : 'Not available'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-primary mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Contact</h4>
                        <p className="text-gray-600">{canteen.phone || 'Not available'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-primary mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                        <p className="text-gray-600">{canteen.email || 'Not available'}</p>
                  </div>
                </div>
                    <div className="flex items-start">
                      <div>
              <h4 className="font-medium">Owner</h4>
                <p className="text-gray-600 font-medium text-sm">{ownerName ?? (canteen.userId || 'Not available')}</p>
                      </div>
                    </div>
              </div>

                <div className="bg-muted p-4 rounded-lg border border-border">
                  <h3 className="font-medium mb-3">Meal Schedule</h3>
                  {canteen?.schedule && Object.keys(canteen.schedule).length > 0 ? (
                    // render any schedule keys available (flexible for different schemas)
                    Object.entries(canteen.schedule).map(([key, value]) => (
                      <div key={key} className={`flex justify-between py-1 ${key !== Object.keys(canteen.schedule).slice(-1)[0] ? 'border-b border-border' : ''}`}>
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-gray-600">{String(value ?? 'Not available')}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600">Schedule not available</div>
                  )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(canteen.tags || []).map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="flex items-center gap-1 bg-muted text-primary hover:bg-muted border-border"
                >
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {tag}
                </Badge>
              ))}
              {/* If no tags available show placeholder */}
              {!(canteen.tags && canteen.tags.length) && (
                <div className="text-sm text-gray-500">No tags available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Menu Items</h2>
        {menuItems.length > 0 ? (
          // group menu items by category
          (() => {
            const grouped: Record<string, any[]> = {};
            menuItems.forEach((it: any) => {
              const cat = it.category || 'Uncategorized';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(it);
            });

            const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

            return (
              <div className="space-y-6">
                {categories.map((cat) => (
                  <section key={cat}>
                    <h3 className="text-xl font-semibold mb-3">{cat}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {grouped[cat].map((item) => (
                        <MenuItemWithCustomization key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            );
          })()
        ) : (
          <p className="text-gray-600">No menu items available.</p>
        )}
      </div>
    </MainLayout>
  );
};

export default CanteenDetails;
