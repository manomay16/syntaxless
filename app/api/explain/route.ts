// File: app/api/explain/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON payload
    const { code, language = "python", existingNaturalLanguage } = await request.json();

    if (!code || code.trim() === "") {
      return NextResponse.json(
        { success: false, error: "No code provided" },
        { status: 400 }
      );
    }

    // Strip existing comments from code before converting
    // This handles code that came from the translate endpoint (which adds comments)
    let cleanedCode = code
      .split('\n')
      .map((line: string) => {
        // Remove lines that are only comments
        const trimmed = line.trim()
        if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
          return ''
        }
        // Remove inline comments
        const commentIndex = line.indexOf('#')
        if (commentIndex > 0) {
          return line.substring(0, commentIndex).trimEnd()
        }
        return line
      })
      .filter((line: string) => line.trim()) // Remove empty lines
      .join('\n')

    // Build a prompt to convert code back to natural language instructions
    // This should match the style users would naturally write
    let styleReference = ""
    if (existingNaturalLanguage && existingNaturalLanguage.trim()) {
      styleReference = `

STYLE REFERENCE - Match this writing style:
${existingNaturalLanguage}

IMPORTANT: Your output should match the EXACT style, tone, and phrasing used in the style reference above. If the user writes short instructions, write short. If they write detailed instructions, write detailed. Preserve their personal writing style.
`
    }

    const prompt = `
You are a coding assistant. Your task is to convert the following ${language} code back into natural language instructions that a user would write.
${styleReference}
CRITICAL: The output should be in the SAME STYLE as natural language instructions that users write (like "print hello world", "create a variable x and set it to 5", etc.), NOT technical explanations, comments, or code.

Rules:
1. Convert each meaningful line of code into a natural language instruction
2. ${existingNaturalLanguage ? 'MATCH THE EXACT STYLE of the style reference above - use the same phrasing patterns, level of detail, and tone.' : 'Write instructions in the same style users would naturally write them (simple, direct, conversational)'}
3. Do NOT use technical jargon, code syntax, or programming terms in the instructions
4. Do NOT include code, comments, markdown, or any formatting
5. Each instruction should be on its own line
6. ${existingNaturalLanguage ? 'If the style reference uses short phrases, use short phrases. If it uses detailed descriptions, use detailed descriptions.' : 'Keep instructions concise and clear, like how a beginner would describe what they want'}
7. For loops: describe them naturally (e.g., "for each number in the list", "repeat 10 times")
8. For conditionals: describe them naturally (e.g., "if x is greater than 3", "when the condition is true")
9. For variables: describe them naturally (e.g., "create a variable x and set it to 5", "store the value 10 in y")
10. Preserve the logical flow and sequence of the code
11. Remove any existing comments from the code before converting
12. ${existingNaturalLanguage ? 'CRITICAL: Your output should feel like it was written by the same person who wrote the style reference. Match their voice and style exactly.' : ''}

Output format:
- Pure natural language instructions, one per line
- No code, no comments, no markdown, no "#" symbols
- Just plain instructions like a user would write

Examples:

Code:
print("hello world")
x = 5
if x > 3:
    print("x is greater than 3")

Natural Language Output:
print hello world
create a variable x and set it to 5
if x is greater than 3, print x is greater than 3

Code:
for i in range(10):
    print(i)

Natural Language Output:
for each number from 0 to 9, print that number

Code:
name = input("Enter your name: ")
print(f"Hello, {name}")

Natural Language Output:
ask the user to enter their name and store it in name
print Hello, followed by the value of name

Code to convert (comments have been removed):
${cleanedCode}
`;

    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.0 // Zero temperature for completely deterministic responses
      }
    });

    // Call Gemini to generate the natural language instructions
    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    let naturalLanguage = (await aiResponse.text()).trim();

    // Remove any markdown code fences if present
    if (naturalLanguage.startsWith("```")) {
      naturalLanguage = naturalLanguage.replace(/^```(?:python|javascript|java|cpp|text)?\s*/i, "");
      naturalLanguage = naturalLanguage.replace(/```$/g, "").trim();
    }

    // Remove any code comments that might have been included
    // Remove lines that start with # (comments)
    const lines = naturalLanguage.split('\n');
    const cleanedLines = lines
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && !line.startsWith('//'))
      .map(line => {
        // Remove inline comments if any
        const commentIndex = line.indexOf('#');
        if (commentIndex > 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line;
      })
      .filter(line => line); // Remove empty lines
    
    naturalLanguage = cleanedLines.join('\n');

    return NextResponse.json({
      success: true,
      naturalLanguage: naturalLanguage,
    });
  } catch (e: any) {
    console.error("Error in /api/explain:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Failed to explain code" },
      { status: 500 }
    );
  }
}

