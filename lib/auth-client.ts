import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { polarClient } from "@polar-sh/better-auth/client";

const baseURL = process.env.NEXT_PUBLIC_APP_URL;

const sharedPlugins = [
  polarClient(),
  adminClient({
    roles: {
      admin: adminAc,
      subscriber: userAc,
    },
  }),
];

export const authClient = createAuthClient(
  baseURL ? { baseURL, plugins: sharedPlugins } : { plugins: sharedPlugins },
);
