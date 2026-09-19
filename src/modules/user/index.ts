import { Elysia, t } from "elysia";
import { UserService } from "./service";
import { userResponseDto, userListResponseDto } from "./dto";
import { isAuthenticated } from "@/utils/auth";

export const userController = new Elysia({ prefix: "/users" })
  .use(isAuthenticated)

  .get(
    "/",
    async ({ query }) => {
      const search = query.search;
      const limit = query.limit ? parseInt(query.limit) : 10;
      const offset = query.offset ? parseInt(query.offset) : 0;

      return await UserService.list(search, limit, offset);
    },
    {
      query: t.Optional(
        t.Object({
          search: t.Optional(t.String()),
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String()),
        }),
      ),
      response: userListResponseDto,
      detail: {
        tags: ["Master Data: User"],
        summary: "List all Users",
        description:
          "Fetch a paginated list of registered users. Useful for finding User IDs for transactions.",
      },
    },
  )

  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await UserService.getById(id);
    },
    {
      params: t.Object({ id: t.String() }),
      response: userResponseDto,
      detail: {
        tags: ["Master Data: User"],
        summary: "Get User by ID",
      },
    },
  );
