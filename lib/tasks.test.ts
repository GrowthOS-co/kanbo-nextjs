import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "@/db";
import { comments } from "@/db/schema";
import { addComment } from "./comments";
import { createMember } from "./members";
import { createProject, listProjects } from "./projects";
import {
  boardColumns,
  createTask,
  deleteTask,
  getTask,
  setTaskStatus,
  TaskStatusError,
  type TaskInput,
} from "./tasks";
import { testDatabase } from "./test-database";

let db: Db;
let projectId: number;

beforeEach(() => {
  db = testDatabase();
  projectId = createProject(db, { name: "Website relaunch", description: null });
});

function task(overrides: Partial<TaskInput> = {}): TaskInput {
  return {
    title: "A task",
    description: null,
    status: "todo",
    assigneeId: null,
    dueDate: null,
    ...overrides,
  };
}

function addTask(project: number, overrides: Partial<TaskInput> = {}): number {
  const id = createTask(db, project, task(overrides));
  if (id === undefined) throw new Error(`Project ${project} does not exist.`);
  return id;
}

function titles(columns: ReturnType<typeof boardColumns>) {
  return {
    todo: columns.todo.map((t) => t.title),
    in_progress: columns.in_progress.map((t) => t.title),
    done: columns.done.map((t) => t.title),
  };
}

describe("listProjects", () => {
  it("counts tasks per status and the percent done, 0% with no tasks", () => {
    const statuses = ["todo", "todo", "in_progress", "done", "done", "done"] as const;
    for (const status of statuses) addTask(projectId, { status });
    createProject(db, { name: "Empty", description: null });

    expect(listProjects(db).map((p) => p.progress)).toEqual([
      { todo: 2, in_progress: 1, done: 3, percentDone: 50 },
      { todo: 0, in_progress: 0, done: 0, percentDone: 0 },
    ]);
  });
});

describe("boardColumns", () => {
  it("filters by assignee or unassigned and groups by status", () => {
    const omar = createMember(db, { name: "Omar Haddad", email: "omar@example.com" });
    const nina = createMember(db, { name: "Nina Patel", email: "nina@example.com" });
    const otherProject = createProject(db, { name: "Mobile app", description: null });

    addTask(projectId, { title: "Migrate blog posts", assigneeId: omar });
    addTask(projectId, { title: "Build pricing page", status: "in_progress", assigneeId: omar });
    addTask(projectId, { title: "Ship launch post", status: "done", assigneeId: omar });
    addTask(projectId, { title: "Write homepage copy", status: "done", assigneeId: nina });
    addTask(projectId, { title: "Accessibility review" });
    addTask(projectId, { title: "Contact form" });
    addTask(projectId, { title: "Final check", status: "done" });
    addTask(otherProject, { title: "Offline mode", assigneeId: omar });
    addTask(otherProject, { title: "Dark mode" });

    expect(titles(boardColumns(db, projectId, omar))).toEqual({
      todo: ["Migrate blog posts"],
      in_progress: ["Build pricing page"],
      done: ["Ship launch post"],
    });
    expect(titles(boardColumns(db, projectId, "unassigned"))).toEqual({
      todo: ["Accessibility review", "Contact form"],
      in_progress: [],
      done: ["Final check"],
    });
  });
});

describe("setTaskStatus", () => {
  it("refuses an unknown status and leaves the task as it was", () => {
    const id = addTask(projectId, { status: "in_progress" });

    expect(() => setTaskStatus(db, id, "archived")).toThrow(TaskStatusError);
    expect(getTask(db, id)?.status).toBe("in_progress");
  });
});

describe("deleteTask", () => {
  it("deletes the task's comments", () => {
    const author = createMember(db, { name: "Nina Patel", email: "nina@example.com" });
    const id = addTask(projectId);
    const kept = addTask(projectId);
    addComment(db, id, { authorId: author, body: "First pass is up." });
    addComment(db, id, { authorId: author, body: "Looks good." });
    addComment(db, kept, { authorId: author, body: "Still open." });

    deleteTask(db, id);

    expect(db.select().from(comments).where(eq(comments.taskId, id)).all()).toEqual([]);
    expect(db.select().from(comments).all().map((c) => c.body)).toEqual(["Still open."]);
  });
});
