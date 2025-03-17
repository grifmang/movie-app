import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Simply allow all requests to pass through
  return NextResponse.next();
}

// Empty matcher means this middleware won't run on any paths
export const config = {
  matcher: [],
};
