import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

function withBasePath(handler: (request: NextRequest) => Promise<Response>) {
  return (request: NextRequest) => {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
    const url = new URL(request.url);
    // Next.js strips the app prefix before invoking route handlers.
    if (!basePath || url.pathname.startsWith(`${basePath}/`)) return handler(request);

    url.pathname = `${basePath}${url.pathname}`;
    return handler(new NextRequest(url, request));
  };
}

export const GET = withBasePath(handlers.GET);
export const POST = withBasePath(handlers.POST);
