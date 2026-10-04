import { and, asc, count, eq, getTableColumns, ne } from "drizzle-orm";
import type { Db } from "@/db";
import { members, tasks } from "@/db/schema";

export type MemberInput = {
  name: string;
  email: string;
};

export function listMembers(db: Db) {
  return db.select().from(members).orderBy(asc(members.name)).all();
}

// Each member with the number of their tasks that are not done.
export function listMembersWithOpenTasks(db: Db) {
  return db
    .select({ ...getTableColumns(members), openTasks: count(tasks.id) })
    .from(members)
    .leftJoin(
      tasks,
      and(eq(tasks.assigneeId, members.id), ne(tasks.status, "done")),
    )
    .groupBy(members.id)
    .orderBy(asc(members.name))
    .all();
}

export function createMember(db: Db, input: MemberInput): number {
  const row = db
    .insert(members)
    .values(input)
    .returning({ id: members.id })
    .get();
  return row.id;
}
