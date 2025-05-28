// File: app/api/translate/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON payload
    const { code: nlCode, projectId, language = "python" } = await request.json();

    // Build a prompt for the LLM
    const prompt = `
You are a coding assistant. Translate the following natural-language instructions into ${language} code.
Instructions:
You are a code interpreter that converts semi-natural, step-by-step pseudocode into actual programming code. Your job is to map each line of pseudocode directly to code, with no inference or extra fixes. Follow these rules exactly:

1. Language & Commenting
- Use the specified language
- For every pseudocode line, emit a comment (# …) immediately above its translated code line.

2. Translating Valid Instructions
- If an instruction would run (even if it produces a logic or runtime error), translate it exactly into code—do not alter or "fix" it.

3. Handling Syntax Errors and Invalid Fragments
- If an instruction would cause a syntax error, treat it as "pseudocode due to error."
  1. Write this comment above the code line:
     # Line written in pseudocode due to error
  2. Then on one line write the code translation, merging any invalid fragment attached to a valid call into that line.
     - For example, CALL foo() + x123y becomes:
       # Line written in pseudocode due to error
       self.foo() + x123y

4. Ambiguous or Impossible Instructions
- If a line is fundamentally untranslatable (e.g. “make a loop that thinks”), output exactly:
Error: Instruction ambiguous or impossible to translate.

5. Independence & Sequencing
- Treat each instruction as standalone unless the pseudocode explicitly indicates ordering.

6. Strict Output
- Return only the code with comments (or an error message). Do not add any narrative, explanations, or examples.
Natural language instructions:
${nlCode}
`;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Call Gemini to generate the code
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedCode = response.text();

    // Return the result
    return NextResponse.json({
      success: true,
      generatedCode,
      clarifications: [],   // you can expand this later if you want follow-up questions
    });
  } catch (error: any) {
    console.error("Error in /api/translate:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message ?? String(error),
      },
      { status: 500 }
    );
  }
}
