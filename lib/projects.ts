import { asc, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { projects, type Task, type TaskStatus } from "@/db/schema";

export type ProjectInput = {
  name: string;
  description: string | null;
};

export type Progress = Record<TaskStatus, number> & { percentDone: number };

// Worked out from the tasks every time, never stored.
export function progress(tasks: Pick<Task, "status">[]): Progress {
  const counts = { todo: 0, in_progress: 0, done: 0 };
  for (const task of tasks) counts[task.status] += 1;
  return {
    ...counts,
    percentDone:
      tasks.length === 0 ? 0 : Math.floor((counts.done * 100) / tasks.length),
  };
}

export function listProjects(db: Db) {
  return db.query.projects
    .findMany({
      with: { tasks: { columns: { status: true } } },
      orderBy: asc(projects.id),
    })
    .sync()
    .map(({ tasks, ...project }) => ({ ...project, progress: progress(tasks) }));
}

export function getProject(db: Db, id: number) {
  return db.select().from(projects).where(eq(projects.id, id)).get();
}

export function createProject(db: Db, input: ProjectInput): number {
  const row = db
    .insert(projects)
    .values(input)
    .returning({ id: projects.id })
    .get();
  return row.id;
}

// False when there is no such project.
export function updateProject(db: Db, id: number, input: ProjectInput): boolean {
  const result = db.update(projects).set(input).where(eq(projects.id, id)).run();
  return result.changes === 1;
}
