import { ok } from "neverthrow";
import type { TableNames } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export function normalizeId<T extends TableNames>(
  ctx: QueryCtx,
  table: T,
  id: string
) {
  return ok(ctx.db.normalizeId(table, id));
}
