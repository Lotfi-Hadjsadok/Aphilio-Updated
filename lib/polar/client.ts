import { Polar } from "@polar-sh/sdk";

const polarServer =
  process.env.POLAR_SERVER === "production" ? "production" : "sandbox";

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: polarServer,
});
