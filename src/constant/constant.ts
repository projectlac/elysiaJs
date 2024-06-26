export enum TABLE_STATUS {
  IDLE = "IDLE",
  USING = "USING",
}

export enum ORDER_STATUS {
  PENDING = "PENDING",
  ALREADY = "ALREADY",
  CANCEL = "CANCEL",
  DONE = "DONE",
}

export const PAGING_DEFAULT = {
  PAGE: 0,
  LIMIT: 10,
};
