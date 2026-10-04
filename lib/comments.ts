import { eq } from "drizzle-orm";
import type { Db } from "@/db";
import { comments, tasks } from "@/db/schema";

export type CommentInput = {
  authorId: number;
  body: string;
};

// Undefined when there is no such task.
export function addComment(
  db: Db,
  taskId: number,
  input: CommentInput,
): number | undefined {
  if (input.body.trim() === "") throw new Error("A comment needs a body.");
  return db.transaction((tx) => {
    const task = tx
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .get();
    if (task === undefined) return undefined;
    return tx
      .insert(comments)
      .values({ ...input, taskId })
      .returning({ id: comments.id })
      .get().id;
  });
}
