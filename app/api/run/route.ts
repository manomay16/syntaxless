import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, unlink } from 'fs/promises';

const execAsync = promisify(exec);

// Try different Python paths
const PYTHON_PATHS = [
  '/usr/bin/python3',
  '/usr/local/bin/python3',
  'python3',
  'python'
];

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

    let lastError = null;
    for (const pythonPath of PYTHON_PATHS) {
      try {
        // Execute the Python code with a timeout
        const { stdout, stderr } = await Promise.race([
          execAsync(`${pythonPath} ${tempFile}`),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Execution timed out')), 5000)
          )
        ]) as { stdout: string; stderr: string };
        
        return NextResponse.json({
          success: true,
          output: stdout || stderr || ''
        });
      } catch (error: any) {
        lastError = error;
        continue; // Try next Python path
      }
    }

    // If we get here, all Python paths failed
    return NextResponse.json({
      success: false,
      output: lastError?.stderr || lastError?.message || 'Python not found'
    });
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