import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TOTP } from "otpauth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

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

    // Get the stored secret
    const { data: twoFactorAuth, error: fetchError } = await supabase
      .from("two_factor_auth")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !twoFactorAuth) {
      return NextResponse.json(
        { error: "2FA not set up. Please generate a secret first." },
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

    // Enable 2FA
    const { error: updateError } = await supabase
      .from("two_factor_auth")
      .update({
        enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error enabling 2FA:", updateError);
      return NextResponse.json(
        { error: "Failed to enable 2FA" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


