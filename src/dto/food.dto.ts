import { t } from "elysia";
import { PAGING_DEFAULT } from "../constant/constant";

export const foodIdDTO = t.Object({
  id: t.String(),
});

export const foodPagingDTO = t.Object({
  page: t.Optional(
    t.Numeric({ minimum: PAGING_DEFAULT.PAGE, default: PAGING_DEFAULT.PAGE })
  ),
  limit: t.Optional(
    t.Number({ minimum: PAGING_DEFAULT.LIMIT, default: PAGING_DEFAULT.LIMIT })
  ),
});

export const foodCreateDTO = t.Object({
  name: t.String(),
  price: t.String(),
});

export const foodDTO = t.Object({
  id: t.String(),
  name: t.String(),
  price: t.String(),
});

export const foodEditDTO = t.Object({
  name: t.String(),
  price: t.String(),
});
