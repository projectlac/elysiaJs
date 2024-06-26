import { Elysia } from "elysia";
import { db } from "../database/db";
import { userIdDTO, userEditDTO } from "../dto/user.dto";
import { isAuthenticated } from "../utils/isAuthenticated";

export const UserController = new Elysia()
  .use(isAuthenticated)
  .guard({
    beforeHandle: async ({ jwt, set, cookie: { access_token_cookie } }) => {
      const verify = await jwt.verify(access_token_cookie.value);
      if (!verify || !access_token_cookie.value) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          data: null,
        };
      }

      const user = await db.user.findUnique({
        where: {
          id: verify.id as string,
        },
      });

      if (!user) {
        set.status = 401;
        return {
          success: false,
          message: "Unauthorized",
          data: null,
        };
      }
    },
  })
  .get(
    "/",
    async ({ set, cookie }) => {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      set.status = 200;
      return {
        success: true,
        message: "users",
        data: users,
      };
    },
    {
      detail: {
        tags: ["User"],
      },
    }
  )

  //get user by id
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      console.log(id);

      const user = await db.user.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
        },
      });
      if (user) {
        set.status = 200;
        return {
          success: true,
          message: "user exist",
          data: user,
        };
      } else {
        set.status = 400;
        return {
          success: false,
          message: "user not exist",
          data: null,
        };
      }
    },
    {
      params: userIdDTO,
      afterHandle: ({ set }) => {
        set.status = 200;
        console.log("after handle");
      },
      detail: {
        tags: ["User"],
      },
    }
  )

  //update user
  .put(
    "/update/:id",
    async ({ params: { id }, body, set }) => {
      const find_user = await db.user.findUnique({
        where: {
          id: id,
        },
      });

      if (find_user) {
        const updateUser = await db.user.update({
          where: {
            id: id,
          },
          data: {
            name: body.name,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "user updated",
          data: {
            id: updateUser.id,
            name: updateUser.name,
            email: updateUser.email,
            password: updateUser.password,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "user not found",
          data: null,
        };
      }
    },
    {
      params: userIdDTO,
      body: userEditDTO,
      detail: {
        tags: ["User"],
      },
    }
  )

  //delete user
  .delete(
    "/delete/:id",
    async ({ params: { id }, set }) => {
      const find_user = await db.user.findUnique({
        where: {
          id: id,
        },
      });

      if (find_user) {
        const deleteUser = await db.user.delete({
          where: {
            id: id,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "user deleted",
          data: {
            id: deleteUser.id,
            name: deleteUser.name,
            email: deleteUser.email,
            password: deleteUser.password,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "user not exist",
          data: null,
        };
      }
    },
    {
      params: userIdDTO,
      detail: {
        tags: ["User"],
      },
    }
  );
