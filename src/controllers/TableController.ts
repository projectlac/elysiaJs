import { Elysia } from "elysia";
import { db } from "../database/db";
import { userIdDTO, userEditDTO } from "../dto/user.dto";
import { isAuthenticated } from "../utils/isAuthenticated";
import {
  tableDTO,
  tableEditDTO,
  tableIdDTO,
  tableUpdateStatusDTO,
} from "../dto/table.dto";
import { TABLE_STATUS } from "../constant/constant";

export const TableController = new Elysia()
  .use(isAuthenticated)

  .get(
    "/",
    async ({ set, cookie }) => {
      const tableList = await db.tableList.findMany({
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      set.status = 200;
      return {
        success: true,
        message: "List of table",
        data: tableList,
      };
    },
    {
      detail: {
        tags: ["Table"],
      },
    }
  )

  //get user by id
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const table = await db.tableList.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });
      if (table) {
        set.status = 200;
        return {
          success: true,
          message: "table exist",
          data: table,
        };
      } else {
        set.status = 400;
        return {
          success: false,
          message: "table not exist",
          data: null,
        };
      }
    },
    {
      params: tableIdDTO,
      afterHandle: ({ set }) => {
        set.status = 200;
        console.log("after handle");
      },
      detail: {
        tags: ["Table"],
      },
    }
  )

  //create user
  .post(
    "/",
    async ({ body, set }) => {
      if (!body.name) {
        set.status = 400;
        throw new Error("Table name is required!");
      }
      try {
        const updateTable = await db.tableList.create({
          data: {
            name: body.name,
            status: TABLE_STATUS.IDLE,
          },
          select: {
            id: true,
            name: true,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "table created",
          data: {
            id: updateTable.id,
            name: updateTable.name,
          },
        };
      } catch (error) {
        set.status = 400;
        return {
          success: true,
          message: "Create table fail",
          data: null,
        };
      }
    },
    {
      body: tableDTO,
      detail: {
        tags: ["Table"],
      },
    }
  )

  //update table
  .put(
    "/update/:id",
    async ({ params: { id }, body, set }) => {
      if (!body.name) {
        set.status = 400;
        throw new Error("Table name is required!");
      }
      if (!Object.values(TABLE_STATUS).includes(body.status)) {
        set.status = 400;
        throw new Error("Status not valid!");
      }
      const find_table = await db.tableList.findUnique({
        where: {
          id: id,
        },
      });

      if (find_table) {
        const updateTable = await db.tableList.update({
          where: {
            id: id,
          },
          data: {
            name: body.name,
            status: body.status,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "table updated",
          data: {
            id: updateTable.id,
            name: updateTable.name,
            status: updateTable.status,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "table not found",
          data: null,
        };
      }
    },
    {
      params: tableIdDTO,
      body: tableEditDTO,
      detail: {
        tags: ["Table"],
      },
    }
  )

  //update status
  .put(
    "/update/:id",
    async ({ params: { id }, body, set }) => {
      if (!id) {
        throw new Error("Table ID is required!");
      }
      if (!Object.values(TABLE_STATUS).includes(body.status)) {
        set.status = 400;
        throw new Error("Status not valid!");
      }
      const find_table = await db.tableList.findUnique({
        where: {
          id: id,
        },
      });

      if (find_table) {
        const updateTable = await db.tableList.update({
          where: {
            id: id,
          },
          data: {
            status: body.status,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "Update Status Successful",
          data: {
            id: updateTable.id,
            name: updateTable.name,
            status: updateTable.status,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "table not found",
          data: null,
        };
      }
    },
    {
      params: tableIdDTO,
      body: tableUpdateStatusDTO,
      detail: {
        tags: ["Table"],
      },
    }
  )

  //delete user
  .delete(
    "/delete/:id",
    async ({ params: { id }, set }) => {
      const findTable = await db.tableList.findUnique({
        where: {
          id: id,
        },
      });

      if (findTable) {
        const deleteTable = await db.tableList.delete({
          where: {
            id: id,
          },
        });

        set.status = 200;
        return {
          success: true,
          message: "table deleted",
          data: {
            id: deleteTable.id,
            name: deleteTable.name,
          },
        };
      } else {
        set.status = 400;
        return {
          success: true,
          message: "table not exist",
          data: null,
        };
      }
    },
    {
      params: userIdDTO,
      detail: {
        tags: ["Table"],
      },
    }
  );
