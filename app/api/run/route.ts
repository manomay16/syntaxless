// File: app/api/run/route.ts

import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

export async function POST(request: Request) {
  try {
    const { code, language = "python" } = await request.json();

    if (language !== "python") {
      return NextResponse.json(
        { success: false, error: `Language ${language} not supported` },
        { status: 400 }
      );
    }

    // 1. Create a temporary directory
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "syntaxless-"));
    const filePath = path.join(tmpDir, "script.py");

    // 2. Write the code to a file
    await fs.writeFile(filePath, code);

    // 3. Execute the file with a timeout
    return new Promise<NextResponse>((resolve) => {
      exec(
        `python "${filePath}"`,
        { timeout: 5000, cwd: tmpDir },
        (err, stdout, stderr) => {
          // Clean up (optional):
          // fs.rm(tmpDir, { recursive: true, force: true });

          if (err) {
            // If the script errors out, return stderr or the error message
            resolve(
              NextResponse.json({
                success: false,
                output: stderr || err.message,
              })
            );
          } else {
            // On success, return stdout
            resolve(
              NextResponse.json({
                success: true,
                output: stdout,
              })
            );
          }
        }
      );
    });
  } catch (error: any) {
    console.error("Error in /api/run:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? String(error) },
      { status: 500 }
    );
  }
}
