import Elysia from "elysia";
import { authRoutes } from "./services/user/routes";
import { profileRoutes } from "./services/profile/routes";
import { workspaceRoutes } from "./services/workspace/routes";
import { workspaceMemberRoutes } from "./services/workspace/members/routes";
import swagger from "@elysiajs/swagger";
import { errorHandler } from "./error-handler";

const elysia = new Elysia()
  .use(
    swagger({
      path: "/docs",
      swaggerOptions: {
        withCredentials: true,
      },
    }),
  )
  .onError(errorHandler)
  .use(authRoutes)
  .use(profileRoutes)
  .use(workspaceRoutes)
  .use(workspaceMemberRoutes);

elysia.get("/health", { message: "healthy" });

elysia.listen(3001, () => {
  console.log("server started");
});
