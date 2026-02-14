import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const appPaths = ["/dashboard-proprietario", "/dashboard-inquilino", "/imoveis", "/buscar-imoveis", "/contratos", "/perfil", "/pagamentos", "/mensagens", "/solicitacoes", "/documentos", "/notificacoes", "/configuracoes", "/onboarding-proprietario", "/onboarding-inquilino"];
function isAdmin(path: string) {
  return path === "/dashboard" || path.startsWith("/dashboard/") || path === "/inadimplencia" || path.startsWith("/inadimplencia/");
}

function isApp(path: string) {
  return appPaths.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const inApp = pathname.startsWith("/(app)") || isApp(pathname);
  const inAdmin = pathname.startsWith("/(admin)") || isAdmin(pathname);

  if (inApp || inAdmin) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signIn = new URL("/login", req.url);
      signIn.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard-proprietario",
    "/dashboard-inquilino",
    "/imoveis",
    "/imoveis/:path*",
    "/buscar-imoveis",
    "/buscar-imoveis/:path*",
    "/contratos",
    "/contratos/:path*",
    "/pagamentos",
    "/pagamentos/:path*",
    "/mensagens",
    "/mensagens/:path*",
    "/solicitacoes",
    "/solicitacoes/:path*",
    "/documentos",
    "/notificacoes",
    "/configuracoes",
    "/configuracoes/:path*",
    "/onboarding-proprietario",
    "/onboarding-inquilino",
    "/dashboard",
    "/dashboard/:path*",
    "/inadimplencia",
  ],
};
