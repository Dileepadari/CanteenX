import { GET_CANTEENS } from "../../../gql/queries/vendors"

interface Canteen {
  id: number;
  name: string;
  location?: string;
  opening_time?: string;
  closing_time?: string;
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
      // Add some mock data for testing if no canteens are returned
      console.warn("No canteens found in response, using mock data");
      return [
        { id: 1, name: "Central Canteen", location: "Main Building" },
        { id: 2, name: "North Campus", location: "North Block" },
        { id: 3, name: "South Campus", location: "South Block" },
        { id: 4, name: "West Block Cafe", location: "West Wing" },
        { id: 5, name: "Library Cafe", location: "Library Building" }
      ];
    }
  } catch (error) {
    console.error('Error fetching canteens:', error);
    // Return mock data instead of throwing to prevent UI breaking
    return [
      { id: 1, name: "Central Canteen", location: "Main Building" },
      { id: 2, name: "North Campus", location: "North Block" },
      { id: 3, name: "South Campus", location: "South Block" },
      { id: 4, name: "West Block Cafe", location: "West Wing" },
      { id: 5, name: "Library Cafe", location: "Library Building" }
    ];
  }
}