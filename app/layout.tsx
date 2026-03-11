import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Next.js Auth — BetterAuth",
  description: "Authentication with BetterAuth, Email Verification, and Zod",
};
const META_THEME_COLOR = {
  light: "#ffffff",
  dark: "#09090b",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeTheme = cookieStore.get("active-theme")?.value;
  const isScaled = activeTheme?.endsWith("-scaled");
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "bg-background overscroll-none font-sans antialiased",
          activeTheme ? `theme-${activeTheme}` : "",
          isScaled ? "theme-scaled" : "",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          <ActiveThemeProvider initialTheme={activeTheme}>
            {children}
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
