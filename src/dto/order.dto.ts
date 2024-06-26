import { t } from "elysia";
import { ORDER_STATUS, PAGING_DEFAULT } from "../constant/constant";

const foodOrderDTO = t.Object({
  foodId: t.String(),
  quantity: t.Integer(),
});

export const foodOrderIdDTO = t.Object({
  id: t.String(),
});

export const orderPagingDTO = t.Object({
  page: t.Optional(
    t.Numeric({ minimum: PAGING_DEFAULT.PAGE, default: PAGING_DEFAULT.PAGE })
  ),
  limit: t.Optional(
    t.Number({ minimum: PAGING_DEFAULT.LIMIT, default: PAGING_DEFAULT.LIMIT })
  ),
});

export const foodOrderCreateDTO = t.Object({
  foodList: t.Array(foodOrderDTO),
  tableId: t.String(),
});

export const foodOrderStatusDTO = t.Object({
  status: t.Enum(ORDER_STATUS),
});

export const foodOrderUpdateDTO = t.Object({
  foodList: t.Array(foodOrderDTO),
});
