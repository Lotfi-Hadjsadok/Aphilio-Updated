import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

const baseURL = process.env.NEXT_PUBLIC_APP_URL;

export const authClient = createAuthClient(
  baseURL ? { baseURL, plugins: [polarClient()] } : { plugins: [polarClient()] },
);
