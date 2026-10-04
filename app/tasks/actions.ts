"use server";

import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { addComment } from "@/lib/comments";
import {
  createTask,
  deleteTask,
  parseTaskStatus,
  setTaskStatus,
  updateTask,
  type TaskInput,
} from "@/lib/tasks";

function optional(form: FormData, field: string): string | null {
  const value = String(form.get(field)).trim();
  return value === "" ? null : value;
}

function taskFromForm(form: FormData): TaskInput {
  const assigneeId = optional(form, "assigneeId");
  return {
    title: String(form.get("title")).trim(),
    description: optional(form, "description"),
    status: parseTaskStatus(String(form.get("status"))),
    assigneeId: assigneeId === null ? null : Number(assigneeId),
    dueDate: optional(form, "dueDate"),
  };
}

export async function createTaskAction(projectId: number, form: FormData) {
  const id = createTask(db, projectId, taskFromForm(form));
  if (id === undefined) notFound();
  redirect(`/tasks/${id}`);
}

export async function updateTaskAction(id: number, form: FormData) {
  if (!updateTask(db, id, taskFromForm(form))) notFound();
  redirect(`/tasks/${id}`);
}

export async function setTaskStatusAction(id: number, status: string) {
  if (!setTaskStatus(db, id, status)) notFound();
  redirect(`/tasks/${id}`);
}

export async function deleteTaskAction(id: number) {
  const projectId = deleteTask(db, id);
  if (projectId === undefined) notFound();
  redirect(`/projects/${projectId}`);
}

export async function addCommentAction(taskId: number, form: FormData) {
  const id = addComment(db, taskId, {
    authorId: Number(form.get("authorId")),
    body: String(form.get("body")).trim(),
  });
  if (id === undefined) notFound();
  redirect(`/tasks/${taskId}`);
}
