import { Elysia } from "elysia";
import cookie from "@elysiajs/cookie";
import { db } from "../database/db";
import jwt from "@elysiajs/jwt";

export const isAuthenticated = (app: Elysia) =>
  app
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SECRETS!,
        exp: process.env.JWT_EXPIRED,
      })
    )
    .use(cookie())
    .guard({
      beforeHandle: async ({ jwt, set, cookie: { access_token_cookie } }) => {
        if (!access_token_cookie.value) {
          set.status = 401;
          return {
            success: false,
            message: "Unauthorized",
            data: null,
          };
        }
        const verify = await jwt.verify(access_token_cookie.value);
        if (!verify) {
          set.status = 401;
          return {
            success: false,
            message: "Unauthorized",
            data: null,
          };
        }
      },
    });
