import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.code) {
      return NextResponse.json(
        { success: false, output: 'No code provided' },
        { status: 400 }
      );
    }

    // Forward the request to the Python serverless function
    const response = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in run route:', error);
    return NextResponse.json(
      { success: false, output: 'Internal server error' },
      { status: 500 }
    );
  }
} 