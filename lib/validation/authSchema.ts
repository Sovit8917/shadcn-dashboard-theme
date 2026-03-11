import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name:            z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email:           z.string().min(1, "Email is required").email("Invalid email address"),
  password:        z.string()
                     .min(8, "Password must be at least 8 characters")
                     .regex(/[A-Z]/, "Must contain at least one uppercase letter")
                     .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ─── Customer Schemas ─────────────────────────────────────────────────────────

export const customerSchema = z.object({
  name:        z.string().min(1, "Name is required").min(2, "At least 2 characters").max(100, "Max 100 characters"),
  email:       z.string().min(1, "Email is required").email("Invalid email address"),
  country:     z.string().min(1, "Please select a country"),
  phone:       z.string().max(20, "Phone too long").regex(/^[+\d\s\-(). ]*$/, "Invalid phone format").or(z.literal("")),
  orders:      z.number({ invalid_type_error: "Must be a number" }).int("Must be a whole number").min(0, "Cannot be negative"),
  total_spent: z.number({ invalid_type_error: "Must be a number" }).min(0, "Cannot be negative"),
  status:      z.enum(["active", "inactive", "pending"], { errorMap: () => ({ message: "Invalid status" }) }),
});

export const customerIdSchema = z.coerce.number().int().positive("Invalid customer ID");

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
