import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { AuthController } from "./controllers/AuthController";
import { isAuthenticated } from "./utils/isAuthenticated";
import { UserController } from "./controllers/UserController";
import { TableController } from "./controllers/TableController";
import { FoodController } from "./controllers/FoodController";
import { OrderController } from "./controllers/OrderController";

const app = new Elysia();

app.use(swagger());
app.use(AuthController);
app.group("/user", (route) => route.use(isAuthenticated).use(UserController));
app.group("/table", (route) => route.use(isAuthenticated).use(TableController));
app.group("/food", (route) => route.use(isAuthenticated).use(FoodController));
app.group("/order", (route) => route.use(isAuthenticated).use(OrderController));

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
