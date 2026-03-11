"use client";

import { redirect } from "next/navigation";

const GuestRedirect = () => {
  return redirect("/dashboard");
};

export default GuestRedirect;
