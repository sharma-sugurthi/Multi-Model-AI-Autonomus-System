import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:7860/api/v1/runs?limit=50');
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch runs' },
      { status: 500 }
    );
  }
} 