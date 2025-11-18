import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user ID from profiles table by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ requires2FA: false });
    }

    // Check if 2FA is enabled for this user
    const { data: twoFactorAuth, error: fetchError } = await supabase
      .from("two_factor_auth")
      .select("enabled")
      .eq("user_id", profile.id)
      .single();

    if (fetchError || !twoFactorAuth) {
      return NextResponse.json({ requires2FA: false });
    }

    return NextResponse.json({ requires2FA: twoFactorAuth.enabled });
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


