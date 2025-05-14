import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { projectId, code, generatedCode } = await request.json()

    // Validate input
    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 })
    }

    // Get the current user
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Update the project
    const { error } = await supabase
      .from("projects")
      .update({
        code,
        generated_code: generatedCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error saving project:", error)
      return NextResponse.json({ success: false, error: "Failed to save project" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Project saved successfully",
    })
  } catch (error) {
    console.error("Error in save API:", error)
    return NextResponse.json({ success: false, error: "Failed to save project" }, { status: 500 })
  }
}
