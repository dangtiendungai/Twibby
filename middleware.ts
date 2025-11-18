import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Check if "Remember me" is enabled (stored in a cookie)
          const rememberMe = request.cookies.get("rememberMe")?.value === "true";
          
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            // Extend cookie expiration for Supabase auth cookies if "Remember me" is enabled
            // Supabase SSR uses cookies like: sb-<project-ref>-auth-token, etc.
            if (rememberMe && (name.includes("sb-") || name.includes("auth"))) {
              supabaseResponse.cookies.set(name, value, {
                ...options,
                maxAge: 60 * 60 * 24 * 30, // 30 days
                expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000), // 30 days from now
                httpOnly: options?.httpOnly ?? false,
                secure: options?.secure ?? process.env.NODE_ENV === "production",
                sameSite: options?.sameSite ?? "lax",
              });
            } else if (!rememberMe && (name.includes("sb-") || name.includes("auth"))) {
              // For session cookies (no remember me), use shorter expiration or session cookie
              supabaseResponse.cookies.set(name, value, {
                ...options,
                // If no maxAge is set, it becomes a session cookie (expires when browser closes)
                // Otherwise keep the original expiration
                maxAge: options?.maxAge,
                expires: options?.expires,
                httpOnly: options?.httpOnly ?? false,
                secure: options?.secure ?? process.env.NODE_ENV === "production",
                sameSite: options?.sameSite ?? "lax",
              });
            } else {
              supabaseResponse.cookies.set(name, value, options);
            }
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login") || 
                     pathname.startsWith("/signup") || 
                     pathname.startsWith("/forgot-password") || 
                     pathname.startsWith("/reset-password") ||
                     pathname.startsWith("/auth");
  const isPublicPath = pathname.startsWith("/_next") || 
                       pathname.startsWith("/api") ||
                       pathname.startsWith("/favicon");

  // Redirect authenticated users away from auth pages
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Protect app routes - redirect to login if not authenticated
  // Note: Route groups like (app) don't appear in the pathname
  // So we check if it's NOT an auth page and NOT a public path
  if (!isAuthPage && !isPublicPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

