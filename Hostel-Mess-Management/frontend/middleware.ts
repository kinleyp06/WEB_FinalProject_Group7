import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];
const studentRoutes = ['/dashboard/student'];
const adminRoutes = ['/dashboard/admin'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (!token && isProtectedRoute) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // For role-based redirection, we'll handle it client-side
  // since we can't easily decode JWT in middleware without a secret
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};