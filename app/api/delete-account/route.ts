import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createServerClient();
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

    const userId = user.id;

    // Get service role client for admin operations
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Delete storage files (avatar and banner)
    try {
      const filePaths: string[] = [];

      // List files in user's root folder (avatars)
      const { data: rootFiles } = await supabaseAdmin.storage
        .from("avatars")
        .list(userId, {
          limit: 100,
          offset: 0,
        });

      if (rootFiles) {
        rootFiles.forEach((file) => {
          if (!file.name.includes("/")) {
            // Direct file in user folder
            filePaths.push(`${userId}/${file.name}`);
          }
        });
      }

      // List files in banner subfolder
      const { data: bannerFiles } = await supabaseAdmin.storage
        .from("avatars")
        .list(`${userId}/banner`, {
          limit: 100,
          offset: 0,
        });

      if (bannerFiles) {
        bannerFiles.forEach((file) => {
          filePaths.push(`${userId}/banner/${file.name}`);
        });
      }

      // Delete all collected file paths
      if (filePaths.length > 0) {
        await supabaseAdmin.storage.from("avatars").remove(filePaths);
      }
    } catch (storageError) {
      // Log but don't fail - storage cleanup is not critical
      // The CASCADE delete will handle database cleanup
      console.warn("Error cleaning up storage files:", storageError);
    }

    // 2. Delete the user account (this will cascade delete all related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in delete account API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

