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
You are a coding assistant.
Translate the following natural-language instructions into ${language} code.
Do not include any markdown fences ('''), language tags, or block delimiters anywhere in your output.

Follow these rules exactly:

1. Language & Commenting  
   • Use the specified language.  
   • For every pseudocode line, emit a comment ('# …') immediately above its translated code line.

2. Translating Valid Instructions  
   • If an instruction would run (even with logic or runtime errors), translate it verbatim—do not alter or “fix” it.

3. Handling Syntax Errors and Invalid Fragments  
   • If an instruction would cause a syntax error, treat it as “pseudocode due to error.”  
     1. Write this comment above the code line:  
        # Line written in pseudocode due to error  
     2. On the next line, **echo the original natural-language instruction exactly as written**, rather than attempting any code translation.  
        For example, if the instruction was “multiply by 3,” you would output:  
        # Line written in pseudocode due to error  
        multiply by 3

4. Ambiguous or Impossible Instructions  
   • Don’t emit inline errors.  
   • Instead, append a human-readable question about that line to an array called 'clarifications'.
   • **Under-specified tasks**:  
    - If an instruction describes behavior you cannot code without extra details (for example “make a program that prints all odd numbers” → you don’t know what range or input source to use), treat it as ambiguous.  
    - Ask exactly which parameters you need.  
     e.g. “What range of numbers should I print (start, end)?”
    2. Ask the user to describe the *logic* or algorithm they intend so they learn to think it through.  
      - “How should I decide whether a number is odd? Explain the logic needed to make this decision.”  

5. Independence & Sequencing  
   • Treat each instruction standalone, unless ordering is explicitly indicated.

6. Strict Output  
   • **Only** output **exactly** this single JSON object (no extra whitespace, no line breaks outside the JSON):  
     {"generatedCode":"<all commented code with '\n' for newlines>","clarifications":["Question1","Question2"]}  
   • **Do not** wrap 'generatedCode' in backticks or add any triple-backtick fences.

Natural language instructions:
${nlCode}


`;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Call Gemini to generate the code
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    // ③ Read its body as text (must await!)
    let raw = (await aiResponse.text()).trim();

    // ④ Remove any triple-backtick fences or leading "```json"
    //     so we end up with just the JSON object
    if (raw.startsWith("```")) {
      // strip opening fence and optional language hint
      raw = raw.replace(/^```(?:json)?\s*/, "");
      // strip closing fence
      raw = raw.replace(/```$/, "").trim();
    }
    const content = raw;

    let parsed: { generatedCode: string; clarifications: string[] };
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // fallback: if parsing fails, treat everything as code
      parsed = { generatedCode: content, clarifications: [] };
    }

    // **Return** only the fields you actually need
    return NextResponse.json({
      success: true,
      generatedCode: parsed.generatedCode,
      clarifications: parsed.clarifications,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
