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

    // Use local Python server for development, Vercel URL for production
    const pythonServerUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : (process.env.VERCEL_URL || 'http://localhost:3000');

    const response = await fetch(`${pythonServerUrl}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: body.code,
        input: body.input || '',
        inputs: body.inputs || []
      }),
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