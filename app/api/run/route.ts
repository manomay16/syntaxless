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

    // Always use Vercel Python serverless function
    // The vercel.json routes /api/run-python to api/run.py
    // Use the internal Python function path to avoid Next.js route handler interception
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : '';
    
    const pythonUrl = baseUrl ? `${baseUrl}/api/run-python` : '/api/run-python';
    
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
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Python serverless function returned ${response.status}: ${errorText}`);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error('Failed to parse Python function response:', parseError);
        console.error('Response text:', responseText.substring(0, 500));
        throw new Error(`Invalid JSON response from Python function: ${parseError.message}. Response: ${responseText.substring(0, 200)}`);
      }
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Error calling Python function:', fetchError);
      if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
        throw new Error('Code execution timed out after 15 seconds');
      }
      throw new Error(`Failed to execute code: ${fetchError.message}`);
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