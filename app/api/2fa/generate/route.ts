import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TOTP } from "otpauth";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function POST() {
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

    // Generate a new TOTP secret
    const totp = new TOTP({
      issuer: "Twibby",
      label: user.email || "User",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(totp.toString());

    // Store the secret (but don't enable yet - user needs to verify first)
    const { data: existing2FA, error: fetchError } = await supabase
      .from("two_factor_auth")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existing2FA) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("two_factor_auth")
        .update({
          secret,
          enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating 2FA:", updateError);
        return NextResponse.json(
          { error: "Failed to generate 2FA secret" },
          { status: 500 }
        );
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("two_factor_auth")
        .insert({
          user_id: user.id,
          secret,
          enabled: false,
        });

      if (insertError) {
        console.error("Error inserting 2FA:", insertError);
        return NextResponse.json(
          { error: "Failed to generate 2FA secret" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      secret,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    console.error("Error generating 2FA:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


