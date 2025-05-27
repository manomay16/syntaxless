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
