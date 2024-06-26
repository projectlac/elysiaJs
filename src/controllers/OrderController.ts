import { Elysia } from "elysia";
import {
  ORDER_STATUS,
  PAGING_DEFAULT,
  TABLE_STATUS,
} from "../constant/constant";
import { db } from "../database/db";
import {
  foodOrderCreateDTO,
  foodOrderIdDTO,
  foodOrderStatusDTO,
  foodOrderUpdateDTO,
  orderPagingDTO,
} from "../dto/order.dto";
import { isAuthenticated } from "../utils/isAuthenticated";

export const OrderController = new Elysia()
  .use(isAuthenticated)

  //get current order list
  .get(
    "/",
    async ({ query, set, cookie }) => {
      const limit = query.limit ?? PAGING_DEFAULT.LIMIT;
      const page = query.page ?? PAGING_DEFAULT.PAGE;
      const total = await db.order.count();
      const order = await db.order.findMany({
        select: {
          id: true,
          price: true,
          isCompleted: true,
          status: true,
        },
        skip: limit * page,
        take: limit,
      });

      try {
        const orderRaw = [];
        for (let index = 0; index < order.length; index++) {
          const orderFoodDetail = await db.orderFoodDetail.findMany({
            where: {
              orderId: order[index].id,
            },
            include: {
              food: true,
            },
          });

          const foodArray = orderFoodDetail.map((item) => ({
            name: item.food.name,
            quantity: item.quantity,
            price: item.food.price,
          }));

          orderRaw.push({
            orderId: order[index].id,
            detail: foodArray,
            totalPriceOrder: order[index].price,
            status: order[index].status,
            isCompleted: order[index].isCompleted,
          });
        }

        set.status = 200;
        return {
          success: true,
          message: "order",
          data: {
            data: orderRaw,
            total,
          },
        };
      } catch (error) {
        return {
          success: true,
          message: "Error",
          data: {},
        };
      }
    },
    {
      query: orderPagingDTO,
      detail: {
        tags: ["Order"],
      },
    }
  )

  // create Order
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { foodList, tableId } = body;
        let totalPrice = 0;
        for (let index = 0; index < foodList.length; index++) {
          const foodDetail = await db.food.findUnique({
            where: {
              id: foodList[index].foodId,
            },
            select: {
              price: true,
            },
          });
          if (foodDetail)
            totalPrice += +foodDetail?.price * foodList[index].quantity;
        }

        const order = await db.order.create({
          data: {
            tableId: tableId,
            status: ORDER_STATUS.PENDING,
            price: totalPrice.toString(),
          },
          select: {
            id: true,
          },
        });

        foodList.forEach(async (item) => {
          await db.orderFoodDetail.create({
            data: {
              foodId: item.foodId,
              quantity: item.quantity,
              orderId: order.id,
            },
            select: {
              foodId: true,
              quantity: true,
            },
          });
        });

        // const updateFood =
        set.status = 200;
        return {
          success: true,
          message: "order created",
          data: {},
        };
      } catch (error) {
        console.log(error);

        set.status = 400;
        return {
          success: false,
          message: "Create order fail",
          data: null,
        };
      }
    },
    {
      body: foodOrderCreateDTO,
      detail: {
        tags: ["Order"],
      },
    }
  )

  // update Status
  .put(
    "/update-status/:id",
    async ({ params: { id }, body, set }) => {
      if (!id) {
        throw new Error("Table ID is required!");
      }
      if (!Object.values(ORDER_STATUS).includes(body.status)) {
        set.status = 400;
        throw new Error("Status not valid!");
      }
      const find_order = await db.order.findUnique({
        where: {
          id: id,
        },
        select: {
          price: true,
          tableId: true,
        },
      });

      if (find_order) {
        const updateOrder = await db.order.update({
          where: {
            id: id,
          },
          data: {
            status: body.status,
            isDeleted: [ORDER_STATUS.CANCEL, ORDER_STATUS.DONE].includes(
              body.status
            )
              ? true
              : false,
            isCompleted: body.status === ORDER_STATUS.DONE ? true : false,
          },
        });

        //Tạo doanh thu khi trạng thái của order là done
        if (body.status === ORDER_STATUS.DONE) {
          await db.revenue.create({
            data: {
              orderId: id,
              price: find_order.price,
            },
          });
          await db.tableList.update({
            where: {
              id: find_order.tableId,
            },
            data: {
              status: TABLE_STATUS.IDLE,
            },
          });
        }

        set.status = 200;
        return {
          success: true,
          message: "Update Status Successful",
          data: {
            id: updateOrder.id,
            status: updateOrder.status,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "Order not found",
          data: null,
        };
      }
    },
    {
      params: foodOrderIdDTO,
      body: foodOrderStatusDTO,
      detail: {
        tags: ["Order"],
      },
    }
  )

  .put(
    "/update-food/:id",
    async ({ params: { id }, body, set }) => {
      if (!id) {
        throw new Error("Order ID is required!");
      }

      const { foodList } = body;
      const findOrder = await db.order.findUnique({
        where: {
          id: id,
        },
      });

      if (
        [ORDER_STATUS.CANCEL, ORDER_STATUS.DONE].includes(
          findOrder?.status as ORDER_STATUS
        )
      ) {
        set.status = 400;
        return {
          success: false,
          message: "Đơn này đã kết thúc",
          data: null,
        };
      }
      // Đã tìm đơn => Truy vấn list food của đơn
      if (findOrder) {
        const listOrderFoodDetail = await db.orderFoodDetail.findMany({
          where: {
            orderId: findOrder.id,
          },
          select: {
            foodId: true,
            quantity: true,
            id: true,
          },
        });

        const mergedArray = foodList.map((item) => {
          const matchingItem = listOrderFoodDetail.find(
            (bItem) => bItem.foodId === item.foodId
          );
          if (matchingItem) {
            return { ...matchingItem, quantity: item.quantity };
          }
          return { ...item, id: "" };
        });

        //THay đổi food của đơn

        for (let index = 0; index < mergedArray.length; index++) {
          const element = mergedArray[index];
          if (element.quantity > 0) {
            await db.orderFoodDetail.upsert({
              where: {
                id: element.id,
                foodId: element.foodId,
              },
              update: {
                quantity: element.quantity,
              },
              create: {
                foodId: element.foodId,
                quantity: element.quantity ?? 1,
                orderId: id,
              },
            });
          } else {
            await db.orderFoodDetail.delete({
              where: {
                id: element.id,
              },
            });
          }
        }

        //Cập nhật lại giá

        const listOrderFoodDetailAfterUpdate =
          await db.orderFoodDetail.findMany({
            where: {
              orderId: findOrder.id,
            },
            include: {
              food: true,
            },
          });

        const totalPrice = listOrderFoodDetailAfterUpdate.reduce((a, v) => {
          a += v.quantity * +v.food.price;
          return a;
        }, 0);

        console.log(listOrderFoodDetailAfterUpdate);
        console.log(totalPrice);

        await db.order.update({
          where: { id: id },
          data: {
            price: String(totalPrice),
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "Update Food Order Successful",
          data: {},
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "Order not found",
          data: null,
        };
      }
    },
    {
      params: foodOrderIdDTO,
      body: foodOrderUpdateDTO,
      detail: {
        tags: ["Order"],
      },
    }
  );
