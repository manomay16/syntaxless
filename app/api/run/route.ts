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

    // On Vercel, the vercel.json routes /api/run to the Python serverless function
    // We need to call it using the Vercel URL or use the internal routing
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      // On Vercel, the Python function is available at the same path
      // The vercel.json routing handles this
      // Use the Vercel URL if available, otherwise use relative path
      const pythonUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/api/run`
        : '/api/run';
      
      const response = await fetch(pythonUrl, {
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

      if (!response.ok) {
        throw new Error(`Python serverless function returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Local development - use local Python server
      const response = await fetch('http://localhost:3001/api/run', {
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

      if (!response.ok) {
        throw new Error(`Local Python server returned ${response.status}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error in run route:', error);
    return NextResponse.json(
      { 
        success: false, 
        output: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

