import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "@/db";
import {
  comments,
  projects,
  taskStatuses,
  tasks,
  type TaskStatus,
} from "@/db/schema";

export const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export type TaskInput = {
  title: string;
  description: string | null;
  status: TaskStatus;
  assigneeId: number | null;
  dueDate: string | null;
};

// A member's id, tasks nobody is assigned to, or everyone (null).
export type AssigneeFilter = number | "unassigned" | null;

export class TaskStatusError extends Error {
  constructor(status: string) {
    super(`"${status}" is not a task status.`);
    this.name = "TaskStatusError";
  }
}

export function parseTaskStatus(value: string): TaskStatus {
  const status = taskStatuses.find((known) => known === value);
  if (status === undefined) throw new TaskStatusError(value);
  return status;
}

// A project's tasks in the three board columns, oldest first.
export function boardColumns(db: Db, projectId: number, assignee: AssigneeFilter) {
  const rows = db.query.tasks
    .findMany({
      where: and(
        eq(tasks.projectId, projectId),
        assignee === null
          ? undefined
          : assignee === "unassigned"
            ? isNull(tasks.assigneeId)
            : eq(tasks.assigneeId, assignee),
      ),
      with: { assignee: true, comments: { columns: { id: true } } },
      orderBy: asc(tasks.id),
    })
    .sync();

  const columns = { todo: [], in_progress: [], done: [] } as Record<
    TaskStatus,
    typeof rows
  >;
  for (const task of rows) columns[task.status].push(task);
  return columns;
}

export function getTask(db: Db, id: number) {
  return db.query.tasks
    .findFirst({
      where: eq(tasks.id, id),
      with: {
        project: true,
        assignee: true,
        comments: { with: { author: true }, orderBy: asc(comments.id) },
      },
    })
    .sync();
}

// Undefined when there is no such project.
export function createTask(
  db: Db,
  projectId: number,
  input: TaskInput,
): number | undefined {
  return db.transaction((tx) => {
    const project = tx
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .get();
    if (project === undefined) return undefined;
    return tx
      .insert(tasks)
      .values({ ...input, projectId })
      .returning({ id: tasks.id })
      .get().id;
  });
}

// False when there is no such task.
export function updateTask(db: Db, id: number, input: TaskInput): boolean {
  return db.update(tasks).set(input).where(eq(tasks.id, id)).run().changes === 1;
}

// Throws TaskStatusError for anything but the three statuses. False when
// there is no such task.
export function setTaskStatus(db: Db, id: number, status: string): boolean {
  const known = parseTaskStatus(status);
  return (
    db.update(tasks).set({ status: known }).where(eq(tasks.id, id)).run()
      .changes === 1
  );
}

// Its comments go with it. Returns the project it was on, or undefined when
// there is no such task.
export function deleteTask(db: Db, id: number): number | undefined {
  return db
    .delete(tasks)
    .where(eq(tasks.id, id))
    .returning({ projectId: tasks.projectId })
    .get()?.projectId;
}
