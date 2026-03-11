import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { sendEmail } from "./email";
import { autoMigrate, migrateCustomers } from "./postgres";

// Auto-create tables on startup
autoMigrate().catch(console.error);
migrateCustomers().catch(console.error);

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#1d4ed8">Verify your email</h2>
            <p>Hi ${user.name ?? user.email},</p>
            <p>Click the button below to verify your email address.</p>
            <a href="${url}"
               style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
              Verify Email
            </a>
            <p style="color:#6b7280;font-size:13px">
              Or paste this link: <a href="${url}">${url}</a>
            </p>
          </div>
        `,
      });
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});

export type Session = typeof auth.$Infer.Session;
