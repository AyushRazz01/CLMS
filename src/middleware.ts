import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl

  // Protected routes (require authentication)
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/books') || 
    pathname.startsWith('/issues') || 
    pathname.startsWith('/users') || 
    pathname.startsWith('/fines') || 
    pathname.startsWith('/overdue')

  // Auth routes (only for unauthenticated users)
  const isAuthRoute = pathname === '/'

  if (isProtectedRoute && !user) {
    // Redirect unauthenticated users to landing page
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // Redirect authenticated users to dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api routes (handled individually)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api).*)',
  ],
}
