import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id

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

    // Delete the project
    const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting project:", error)
      return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    })
  } catch (error) {
    console.error("Error in delete API:", error)
    return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 })
  }
}
