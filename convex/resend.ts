import { Resend } from "@convex-dev/resend";
import { Resend as ResendBase } from "resend";
import { components } from "./_generated/api";

export const resend = new Resend(components.resend, {
  testMode: process.env.ENV !== "production",
});

export const resendBase = new ResendBase(process.env.RESEND_API_KEY || "re_placeholder_key_for_development");

export const TEST_EMAILS = {
  delivered: "delivered@resend.dev",
  bounced: "bounced@resend.dev",
  spam: "complained@resend.dev",
};
