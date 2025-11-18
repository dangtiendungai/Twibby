import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TOTP } from "otpauth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user (they should be signed in from password login)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in first." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get the stored secret
    const { data: twoFactorAuth, error: fetchError } = await supabase
      .from("two_factor_auth")
      .select("*")
      .eq("user_id", userId)
      .eq("enabled", true)
      .single();

    if (fetchError || !twoFactorAuth) {
      return NextResponse.json(
        { error: "2FA is not enabled for this account" },
        { status: 400 }
      );
    }

    // Verify the code
    const totp = new TOTP({
      secret: twoFactorAuth.secret,
    });

    const isValid = totp.validate({ token: code, window: 1 }) !== null;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

