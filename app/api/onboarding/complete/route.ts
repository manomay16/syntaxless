import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update user profile to mark onboarding as completed
    const { error } = await supabase
      .from("user_profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);

    if (error) {
      // If profile doesn't exist, create it
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            onboarding_completed: true,
          });

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return NextResponse.json(
            { success: false, error: "Failed to complete onboarding" },
            { status: 500 }
          );
        }
      } else {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
          { success: false, error: "Failed to complete onboarding" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (e: any) {
    console.error("Onboarding completion error:", e);
    return NextResponse.json(
      {
        success: false,
        error: e.message || "Failed to complete onboarding",
      },
      { status: 500 }
    );
  }
}

