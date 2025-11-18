import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get 2FA status
    const { data: twoFactorAuth, error: fetchError } = await supabase
      .from("two_factor_auth")
      .select("enabled")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !twoFactorAuth) {
      return NextResponse.json({ enabled: false });
    }

    return NextResponse.json({ enabled: twoFactorAuth.enabled });
  } catch (error) {
    console.error("Error fetching 2FA status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


