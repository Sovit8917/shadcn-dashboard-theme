"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingCart, BookOpen, Truck, Mail,
  MessageSquare, Calendar, Columns, Globe,
  ChevronDown, ChevronRight, Menu,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string }[];
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboards", icon: <LayoutDashboard className="h-4 w-4" />, href: "/dashboard", badge: 5 },
  { label: "Front Pages", icon: <Globe className="h-4 w-4" />, href: "#" },
];

const appNavItems: NavItem[] = [
  {
    label: "eCommerce",
    icon: <ShoppingCart className="h-4 w-4" />,
    children: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Products", href: "#" },
      { label: "Orders", href: "#" },
      { label: "Customers", href: "/dashboard/customers" },
      { label: "Manage Reviews", href: "#" },
      { label: "Referrals", href: "#" },
      { label: "Settings", href: "#" },
    ],
  },
  { label: "Academy", icon: <BookOpen className="h-4 w-4" />, href: "#" },
  { label: "Logistics", icon: <Truck className="h-4 w-4" />, href: "#" },
  { label: "Email", icon: <Mail className="h-4 w-4" />, href: "#" },
  { label: "Chat", icon: <MessageSquare className="h-4 w-4" />, href: "#" },
  { label: "Calendar", icon: <Calendar className="h-4 w-4" />, href: "#" },
  { label: "Kanban", icon: <Columns className="h-4 w-4" />, href: "#" },
];

function NavItemComponent({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(
    item.children?.some((c) => c.href !== "#" && pathname.startsWith(c.href)) ?? false
  );
  const isActive = item.href && item.href !== "#"
    ? pathname === item.href || pathname.startsWith(item.href + "/")
    : false;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
            open
              ? "text-primary bg-primary/10 font-medium"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-3">{item.icon}<span>{item.label}</span></div>
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-border pl-3">
            {item.children.map((child) => {
              const childActive = child.href !== "#" && (pathname === child.href || pathname.startsWith(child.href + "/"));
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "block px-2 py-1.5 rounded-md text-sm transition-colors",
                    childActive
                      ? "text-primary font-medium bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", childActive ? "bg-primary" : "bg-muted-foreground/40")} />
                    {child.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className="flex items-center gap-3">{item.icon}<span>{item.label}</span></div>
      {item.badge && (
        <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <span className="text-primary-foreground text-xs font-bold">V</span>
      </div>
      <span className="font-bold text-lg tracking-tight text-foreground">Vuexy</span>
    </div>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
      {navItems.map((item) => (
        <NavItemComponent key={item.label} item={item} onNavigate={onNavigate} />
      ))}
      <div className="pt-4 pb-1 px-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Apps &amp; Pages
        </p>
      </div>
      {appNavItems.map((item) => (
        <NavItemComponent key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

// Desktop: always-visible fixed sidebar
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 bg-card border-r border-border flex-col z-40">
      <Logo />
      <Separator />
      <NavContent />
    </aside>
  );
}

// Mobile: hamburger button + Sheet drawer
export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-60 flex flex-col bg-card">
        <Logo />
        <Separator />
        <NavContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export default function Sidebar() {
  return <DesktopSidebar />;
}
