import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:7860/api/v1/flows/');
    
    if (!response.ok) {
        // If LangFlow returns an error, propagate it
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    // LangFlow v1 API returns a list of flows directly
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching flows from LangFlow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows from LangFlow' },
      { status: 500 }
    );
  }
} 