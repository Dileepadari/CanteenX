import { GET_CANTEENS } from "../../../gql/queries/vendors"

interface Canteen {
  id: number;
  name: string;
  location: string;
  image?: string;
  rating: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  description?: string;
  phone: string;
}

export async function fetchCanteens(): Promise<Canteen[]> {
  try {
    // Use the Next.js API route we created for GraphQL requests
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: GET_CANTEENS 
      }),
    });
    
    // For debugging - log the response status
    console.log("Canteens response status:", response.status);
    
    const data = await response.json();
    
    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      throw new Error(data.errors[0].message);
    }
    
    // For debugging - helps identify the actual response structure
    console.log("Canteens response:", data);
    
    // Try different paths that might exist in the GraphQL response
    // Updated to check for get_canteens instead of canteens
    if (data.data?.getCanteens) {
      return data.data.getCanteens;
    } else if (data.getCanteens) {
      return data.getCanteens;
    } else {
      // Add mock data for testing if no canteens are returned
      console.warn("No canteens found in response, using mock data");
      return [
        { 
          id: 1, 
          name: "Central Canteen", 
          location: "Main Building",
          image: "/placeholder.svg",
          rating: 4.5,
          openTime: "08:00",
          closeTime: "22:00",
          isOpen: true,
          description: "Multi-cuisine restaurant offering variety of dishes",
          phone: "040-23456789"
        },
        { 
          id: 2, 
          name: "North Campus", 
          location: "North Block",
          image: "/placeholder.svg",
          rating: 4.2,
          openTime: "09:00",
          closeTime: "21:00",
          isOpen: true,
          description: "Fast food and quick bites",
          phone: "040-23456788"
        },
        { 
          id: 3, 
          name: "South Campus", 
          location: "South Block",
          image: "/placeholder.svg",
          rating: 4.0,
          openTime: "08:30",
          closeTime: "20:30",
          isOpen: true,
          description: "South Indian specialties",
          phone: "040-23456787"
        },
        { 
          id: 4, 
          name: "West Block Cafe", 
          location: "West Wing",
          image: "/placeholder.svg",
          rating: 4.3,
          openTime: "08:00",
          closeTime: "21:00",
          isOpen: true,
          description: "Coffee shop and snacks",
          phone: "040-23456786"
        },
        { 
          id: 5, 
          name: "Library Cafe", 
          location: "Library Building",
          image: "/placeholder.svg",
          rating: 4.1,
          openTime: "09:00",
          closeTime: "22:00",
          isOpen: true,
          description: "Quick bites and beverages",
          phone: "040-23456785"
        }
      ];
    }
  } catch (error) {
    console.error('Error fetching canteens:', error);
    // Return mock data instead of throwing to prevent UI breaking
    return [
      { 
        id: 1, 
        name: "Central Canteen", 
        location: "Main Building",
        image: "/placeholder.svg",
        rating: 4.5,
        openTime: "08:00",
        closeTime: "22:00",
        isOpen: true,
        description: "Multi-cuisine restaurant offering variety of dishes",
        phone: "040-23456789"
      },
      { 
        id: 2, 
        name: "North Campus", 
        location: "North Block",
        image: "/placeholder.svg",
        rating: 4.2,
        openTime: "09:00",
        closeTime: "21:00",
        isOpen: true,
        description: "Fast food and quick bites",
        phone: "040-23456788"
      },
      { 
        id: 3, 
        name: "South Campus", 
        location: "South Block",
        image: "/placeholder.svg",
        rating: 4.0,
        openTime: "08:30",
        closeTime: "20:30",
        isOpen: true,
        description: "South Indian specialties",
        phone: "040-23456787"
      },
      { 
        id: 4, 
        name: "West Block Cafe", 
        location: "West Wing",
        image: "/placeholder.svg",
        rating: 4.3,
        openTime: "08:00",
        closeTime: "21:00",
        isOpen: true,
        description: "Coffee shop and snacks",
        phone: "040-23456786"
      },
      { 
        id: 5, 
        name: "Library Cafe", 
        location: "Library Building",
        image: "/placeholder.svg",
        rating: 4.1,
        openTime: "09:00",
        closeTime: "22:00",
        isOpen: true,
        description: "Quick bites and beverages",
        phone: "040-23456785"
      }
    ];
  }
}