import Elysia from "elysia";
import { authRoutes } from "./services/user/routes";
import swagger from "@elysiajs/swagger";

const elysia = new Elysia()
  .use(
    swagger({
      path: "/docs",
    }),
  )
  .onError(({ error, set }) => {
    set.headers["Content-Type"] = "application/json";
    return { message: (error as Error).message };
  })
  .use(authRoutes);

elysia.get("/health", { message: "healthy" });

elysia.listen(3001, () => {
  console.log("server started");
});
