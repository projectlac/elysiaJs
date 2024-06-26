import { Elysia } from "elysia";
import cookie from "@elysiajs/cookie";
import { db } from "../database/db";
import jwt from "@elysiajs/jwt";

export const isAuthenticated = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRETS!,
      exp: process.env.JWT_EXPIRED,
    })
  )
  .use(cookie())
  .onRequest(() => {
    console.log("On request");
  });
