import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isPublicPath = request.nextUrl.pathname === '/';

  // Belum login, akses halaman protected → redirect ke /auth
  if (!user && !isAuthPage && !isPublicPath) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Sudah login, akses /auth → redirect ke /feed
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|default-avatar.png).*)'],
};