import { NextResponse } from "next/server"
import { exec } from "child_process"
import fs from "fs/promises"
import os from "os"
import path from "path"

export async function POST(request: Request) {
  const { code, language } = await request.json()

  // for now support only Python
  if (language !== "python") {
    return NextResponse.json({ success: false, error: "Language not supported" }, { status: 400 })
  }

  // write to a temp file
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "syntaxless-"))
  const filePath = path.join(tmpDir, "script.py")
  await fs.writeFile(filePath, code)

  // run it
  return new Promise((resolve) => {
    exec(`python ${filePath}`, { timeout: 5000 }, (err, stdout, stderr) => {
      if (err) {
        resolve(
          NextResponse.json({ success: false, output: stderr || err.message })
        )
      } else {
        resolve(
          NextResponse.json({ success: true, output: stdout })
        )
      }
    })
  })
}
