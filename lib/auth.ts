import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import prisma from "@/lib/prisma";
import { polarClient } from "@/lib/polar/client";
import { POLAR_CHECKOUT_SUCCESS_PATH } from "@/lib/polar/checkout-success-url";
import {
  persistPolarCustomerIdForNewUser,
  syncLocalUserByPolarCustomerId,
  syncLocalUserFromPolarCustomerState,
  syncLocalUserFromSubscription,
} from "@/lib/polar/user-db-sync";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await persistPolarCustomerIdForNewUser({
            id: user.id,
            email: user.email,
          });
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.POLAR_PRODUCT_ID_MONTHLY!,
              slug: "monthly",
            },
            {
              productId: process.env.POLAR_PRODUCT_ID_YEARLY!,
              slug: "yearly",
            },
          ],
          successUrl: POLAR_CHECKOUT_SUCCESS_PATH,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onCustomerStateChanged: async (payload) => {
            await syncLocalUserFromPolarCustomerState(payload.data);
          },
          onSubscriptionCreated: async (payload) => {
            await syncLocalUserFromSubscription(payload.data);
          },
          onSubscriptionActive: async (payload) => {
            await syncLocalUserFromSubscription(payload.data);
          },
          onSubscriptionUpdated: async (payload) => {
            await syncLocalUserFromSubscription(payload.data);
          },
          onSubscriptionCanceled: async (payload) => {
            await syncLocalUserFromSubscription(payload.data);
          },
          onSubscriptionRevoked: async (payload) => {
            await syncLocalUserFromSubscription(payload.data);
          },
          onBenefitGrantCreated: async (payload) => {
            await syncLocalUserByPolarCustomerId(payload.data.customerId);
          },
          onBenefitGrantUpdated: async (payload) => {
            await syncLocalUserByPolarCustomerId(payload.data.customerId);
          },
          onBenefitGrantRevoked: async (payload) => {
            await syncLocalUserByPolarCustomerId(payload.data.customerId);
          },
        }),
      ],
    }),
    admin({
      defaultRole: "subscriber",
      adminRoles: ["admin"],
      roles: {
        admin: adminAc,
        subscriber: userAc,
      },
    }),
    nextCookies(),
  ],
});
