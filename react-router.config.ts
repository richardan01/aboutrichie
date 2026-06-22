import { type Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: [
    "/",
    "/login",
    "/logout",
    "/kaolin-signup",
    "/kaolin-signup/thank-you",
    "/telemetry-test",
  ],
} satisfies Config;
