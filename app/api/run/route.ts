// File: app/api/run/route.ts

import { NextResponse } from "next/server";
import { spawnSync } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const runtime = "nodejs";


export async function POST(request: Request) {
  try {
    // ① Pull code, language, and the user’s collected stdin
    const body = await request.json();
const { code, language = "python", input: stdin = "" } = body;


    // ② Only Python is supported here
    if (language !== "python") {
      return NextResponse.json(
        { success: false, error: `Language ${language} not supported` },
        { status: 400 }
      );
    }

    // ③ Write the code to a temp Python script
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "syntaxless-"));
    const filePath = path.join(tmpDir, "script.py");
    await fs.writeFile(filePath, code);

    // ④ Spawn Python with the user’s input piped into stdin
    const result = spawnSync("python", [filePath], {
      cwd: tmpDir,
      input: stdin,
      encoding: "utf-8",
      timeout: 5000,
    });

    // ⑤ If Python errored, return stderr; otherwise return stdout
    if (result.error || result.status !== 0) {
      return NextResponse.json({
        success: false,
        output: result.stderr || result.error?.message || "Unknown error",
      });
    }

    return NextResponse.json({
      success: true,
      output: result.stdout,
    });

  } catch (e: any) {
    console.error("Error in /api/run:", e);
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
