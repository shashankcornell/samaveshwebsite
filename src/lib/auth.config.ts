import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config — no database imports
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";
      if (isAdminRoute && !isLoginPage) {
        return isLoggedIn;
      }
      return true;
    },
  },
  providers: [],
};
