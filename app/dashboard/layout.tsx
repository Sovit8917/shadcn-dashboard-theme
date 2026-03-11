import AuthGuard from "@/hocs/AuthGuard";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DesktopSidebar } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const Layout = async ({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) => {
  const session = await auth.api.getSession({ headers: headers() });

  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/30">
        <DesktopSidebar />
        <Navbar userName={session?.user?.name} userEmail={session?.user?.email} />
        <main className="pt-14 lg:ml-60 min-h-screen">
          {children}
        </main>
        {modal}
        <Toaster />
      </div>
    </AuthGuard>
  );
};

export default Layout;
