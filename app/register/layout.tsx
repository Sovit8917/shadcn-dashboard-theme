import GuestGuard from "@/hocs/GuestGuard";
import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  );
};

export default Layout;
