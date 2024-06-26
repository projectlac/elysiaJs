import { Elysia } from "elysia";
import { db } from "../database/db";
import { userIdDTO, userEditDTO } from "../dto/user.dto";
import { isAuthenticated } from "../utils/isAuthenticated";
import { tableDTO, tableEditDTO, tableIdDTO } from "../dto/table.dto";
import {
  foodCreateDTO,
  foodDTO,
  foodEditDTO,
  foodIdDTO,
  foodPagingDTO,
} from "../dto/food.dto";
import { PAGING_DEFAULT } from "../constant/constant";
import {
  IGetFoodData,
  IResponseDetail,
  IResponsePaging,
} from "../types/inteface";

export const FoodController = new Elysia()
  .use(isAuthenticated)

  .get(
    "/",
    async ({ query, set }): Promise<IResponsePaging<IGetFoodData>> => {
      const limit = query.limit ?? PAGING_DEFAULT.LIMIT;
      const page = query.page ?? PAGING_DEFAULT.PAGE;
      const total = await db.order.count();
      const food = await db.food.findMany({
        select: {
          id: true,
          name: true,
          price: true,
        },
        skip: limit * page,
        take: limit,
      });

      set.status = 200;
      return {
        success: true,
        message: "List of food",
        data: {
          data: food,
          total,
        },
      };
    },
    {
      query: foodPagingDTO,
      detail: {
        tags: ["Food"],
      },
    }
  )

  //get user by id
  .get(
    "/:id",
    async ({ params: { id }, set }): Promise<IResponseDetail<IGetFoodData>> => {
      const food = await db.food.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
      });
      if (food) {
        set.status = 200;
        return {
          success: true,
          message: "food exist",
          data: food,
        };
      } else {
        set.status = 400;
        return {
          success: false,
          message: "food not exist",
          data: null,
        };
      }
    },
    {
      params: foodIdDTO,
      afterHandle: ({ set }) => {
        set.status = 200;
      },
      detail: {
        tags: ["Food"],
      },
    }
  )

  //create food
  .post(
    "/",
    async ({ body, cookie: { access_token_cookie }, set, jwt }) => {
      const verify = await jwt.verify(access_token_cookie.value);
      if (!verify) {
        return {
          success: true,
          message: "User not found",
          data: null,
        };
      } else {
        try {
          const { name, price } = body;
          const updateFood = await db.food.create({
            data: {
              name: name,
              price: price,
              creatorId: verify.id as string,
            },
            select: {
              name: true,
              price: true,
            },
          });

          set.status = 200;
          return {
            success: true,
            message: "food created",
            data: {
              name: updateFood.name,
              price: updateFood.price,
            },
          };
        } catch (error) {
          set.status = 400;
          return {
            success: true,
            message: "Create food fail",
            data: null,
          };
        }
      }
    },
    {
      body: foodCreateDTO,
      detail: {
        tags: ["Food"],
      },
    }
  )

  //update user
  .put(
    "/update/:id",
    async ({ params: { id }, body, set }) => {
      if (!body.name) {
        set.status = 400;
        throw new Error("Food name is required");
      }
      const food = await db.food.findUnique({
        where: {
          id: id,
        },
      });

      if (food) {
        const updateFood = await db.food.update({
          where: {
            id: id,
          },
          data: {
            name: body.name,
            price: body.price,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "food updated",
          data: {
            id: updateFood.id,
            name: updateFood.name,
            price: updateFood.price,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "food not found",
          data: null,
        };
      }
    },
    {
      body: foodEditDTO,
      detail: {
        tags: ["Food"],
      },
    }
  )

  //delete user
  .delete(
    "/delete/:id",
    async ({ params: { id }, set }) => {
      const findFood = await db.food.findUnique({
        where: {
          id: id,
        },
      });

      if (findFood) {
        const deleteFood = await db.food.delete({
          where: {
            id: id,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "food deleted",
          data: {
            id: deleteFood.id,
            name: deleteFood.name,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "food not exist",
          data: null,
        };
      }
    },
    {
      params: foodIdDTO,
      detail: {
        tags: ["Food"],
      },
    }
  );
