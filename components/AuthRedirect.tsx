"use client";

import { redirect, usePathname } from "next/navigation";

const AuthRedirect = () => {
  const pathname = usePathname();

  const login = "/login";
  const homePage = "/";
  const redirectUrl = `/login?redirectTo=${pathname}`;

  return redirect(
    pathname === login
      ? login
      : pathname === homePage
        ? login
        : redirectUrl,
  );
};

export default AuthRedirect;
