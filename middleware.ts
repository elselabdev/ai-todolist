import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const protectedPaths = ["/projects", "/new-project", "/settings"]
  const isPathProtected = protectedPaths.some((path) => pathname.startsWith(path))

  if (isPathProtected) {
    const token = await getToken({ req: request })

    // Redirect to login if not authenticated
    if (!token) {
      const url = new URL(`/auth/signin`, request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/projects/:path*", "/new-project", "/settings"],
}
