import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@/lib/db";

const db = client.db("auth");

export const auth = betterAuth({
    database: mongodbAdapter(db)
});