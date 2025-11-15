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

    // Determine execution environment
    // Can be forced via environment variable, otherwise auto-detect
    const forceMode = process.env.PYTHON_EXECUTION_MODE; // 'local' | 'vercel' | undefined (auto)
    const isVercel = forceMode === 'vercel' || (forceMode !== 'local' && process.env.VERCEL === '1');
    
    if (isVercel) {
      // Production/Vercel: Use Python serverless function
      // The vercel.json routes /api/run to api/run.py
      // We can call it directly since we're already in the Next.js route handler
      // Vercel will handle the routing to the Python function
      
      // Try to call the Python function via internal routing
      // In Vercel, this will be routed to the serverless function
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : '';
      
      const pythonUrl = baseUrl ? `${baseUrl}/api/run` : '/api/run';
      
      try {
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
      } catch (fetchError: any) {
        // If fetch fails, it might be a routing issue
        console.error('Error calling Python function on Vercel:', fetchError);
        throw new Error(`Failed to execute code: ${fetchError.message}`);
      }
    } else {
      // Local development: Use local Python server
      const localUrl = process.env.PYTHON_SERVER_URL || 'http://localhost:3001/api/run';
      
      try {
        const response = await fetch(localUrl, {
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
      } catch (fetchError: any) {
        // Provide helpful error message if local server isn't running
        if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('ECONNREFUSED')) {
          return NextResponse.json(
            { 
              success: false, 
              output: 'Local Python server is not running. Please start it with: cd api && python run.py' 
            },
            { status: 503 }
          );
        }
        throw fetchError;
      }
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