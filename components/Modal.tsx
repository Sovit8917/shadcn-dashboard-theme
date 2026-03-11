"use client";

import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface ModalProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ title, description, children, size = "md" }: ModalProps) {
  const router = useRouter();

  const sizeClass = {
    sm: "sm:max-w-[420px]",
    md: "sm:max-w-[520px]",
    lg: "sm:max-w-[680px]",
  }[size];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) router.back(); }}>
      <DialogContent className={sizeClass}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
