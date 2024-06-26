import { t } from "elysia";
import { TABLE_STATUS } from "../constant/constant";

export const tableIdDTO = t.Object({
  id: t.String(),
});

export const tableDTO = t.Object({
  name: t.String(),
});

export const tableEditDTO = t.Object({
  name: t.String(),
  status: t.Enum(TABLE_STATUS),
});

export const tableUpdateStatusDTO = t.Object({
  status: t.Enum(TABLE_STATUS),
});
