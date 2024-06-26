import Elysia from "elysia";
import jwt from "@elysiajs/jwt";
import { z, ZodError } from "zod";
import cookie from "@elysiajs/cookie";
import { db } from "../database/db";
import { comparePassword, createHashPassword } from "../utils/auth";
import { userDTO, userLoginDTO } from "../dto/user.dto";

const registerValidation = z.object({
  name: z.string().min(5),
  email: z.string().email().min(5),
  password: z.string().min(5),
});

export const AuthController = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRETS!,
      exp: process.env.JWT_EXPIRED,
    })
  )
  .use(cookie())

  //user create
  .post(
    "/register",
    async ({ body, set }) => {
      const { name, email, password } = body;

      try {
        registerValidation.parse({
          name,
          email,
          password,
        });
      } catch (error) {
        if (error instanceof ZodError) {
          const validation = error.issues.map((v, i) => {
            return {
              [v.path[0]]: v.message,
            };
          });

          return {
            success: false,
            message: validation,
            data: null,
          };
        }
      }

      const emailExists = await db.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });
      if (emailExists) {
        set.status = 400;
        return {
          success: false,
          message: "email address already in use",
          data: null,
        };
      }

      const createPassword = await createHashPassword(password);
      //return hash_and_salt;
      const newUser = await db.user.create({
        data: {
          name: name,
          email: email,
          password: password,
          hash: createPassword.hash,
          salt: createPassword.salt,
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
        },
      });

      set.status = 200;
      return {
        success: true,
        message: "user created",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
        },
      };
    },
    {
      body: userDTO,
      // body: User,
      detail: {
        tags: ["Auth"],
      },
    }
  )
  .post(
    "login",
    async ({ body, cookie: { access_token_cookie }, set, jwt }) => {
      const { email, password } = body;
      const user = await db.user.findFirst({
        where: {
          email: email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          hash: true,
          salt: true,
        },
      });

      if (!user) {
        set.status = 400;
        return {
          success: false,
          message: "invalid credentials",
          data: null,
        };
      }

      // compare password
      const match = await comparePassword(password, user.salt, user.hash);
      if (!match) {
        set.status = 400;
        return {
          success: false,
          message: "invalid credentials",
          data: null,
        };
      }

      // generate access
      const accessToken = await jwt.sign({
        id: user.id,
      });

      access_token_cookie.set({
        httpOnly: true,
        maxAge: 2 * 7200, //2 hours,
        value: accessToken,
      });
      // return setCookieAccessToken.value;

      set.status = 200;
      return {
        success: true,
        message: "login success",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken: accessToken,
      };
    },
    {
      body: userLoginDTO,
      detail: {
        tags: ["Auth"],
      },
    }
  )
  .post(
    "logout",
    async ({ cookie, cookie: { access_token_cookie }, set }) => {
      console.log(cookie);

      access_token_cookie.remove();
      delete cookie.access_token_cookie;
      set.status = 200;
      return {
        success: true,
        message: "logout success",
        data: null,
      };
    },
    {
      detail: {
        tags: ["Auth"],
      },
    }
  );
