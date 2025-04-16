// GraphQL API route handler
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Correct backend URL with proper endpoint path
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8000/api/graphql';
    
    // Read the request body
    const body = await request.json();
    
    console.log('Proxying GraphQL request to:', backendUrl);
    console.log('Request body:', body);
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error('Error response from backend:', response.status, response.statusText);
      return NextResponse.json(
        { errors: [{ message: `Backend error: ${response.status} ${response.statusText}` }] },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    
    console.log('GraphQL response received:', data);
    
    // Return the response from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GraphQL API route:', error);
    return NextResponse.json(
      { errors: [{ message: 'Internal server error' }] },
      { status: 500 }
    );
  }
} 