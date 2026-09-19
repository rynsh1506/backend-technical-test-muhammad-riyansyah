import { t, type TSchema } from "elysia";

export const paginationMetaDto = t.Object({
  page: t.Number(),
  limit: t.Number(),
  totalPages: t.Number(),
  totalRecords: t.Number(),
});

export const createPaginatedDto = <T extends TSchema>(schema: T) =>
  t.Object({
    data: t.Array(schema),
    meta: paginationMetaDto,
  });
