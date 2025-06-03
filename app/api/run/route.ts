import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  let tempFile = '';
  try {
    const body = await request.json();
    
    if (!body.code) {
      return NextResponse.json(
        { success: false, output: 'No code provided' },
        { status: 400 }
      );
    }

    // Create a temporary file with the code
    tempFile = join(tmpdir(), `code_${Date.now()}.py`);
    await writeFile(tempFile, body.code);

    try {
      // Execute the Python code
      const { stdout, stderr } = await execAsync(`python ${tempFile}`);
      
      return NextResponse.json({
        success: true,
        output: stdout || stderr || ''
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        output: error.stderr || error.message || 'Error executing code'
      });
    }
  } catch (error) {
    console.error('Error in run route:', error);
    return NextResponse.json(
      { success: false, output: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Clean up the temporary file
    if (tempFile) {
      try {
        await unlink(tempFile);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  }
} 