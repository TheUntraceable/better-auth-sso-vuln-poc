import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { organization } from "better-auth/plugins";
import { sso } from "better-auth/plugins/sso";
import { client } from "./lib/db";

const db = client.db("auth");

export const auth = betterAuth({
    database: mongodbAdapter(db),
    baseURL: process.env.BETTER_AUTH_URL || "https://dev.untraceable.dev",
    emailAndPassword: {
        enabled: true
    },
    trustedOrigins: ["https://dev.untraceable.dev"],
    plugins: [
        organization(),
        sso()
    ]
});