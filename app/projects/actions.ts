"use server";

import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { createProject, updateProject, type ProjectInput } from "@/lib/projects";

function projectFromForm(form: FormData): ProjectInput {
  const description = String(form.get("description")).trim();
  return {
    name: String(form.get("name")).trim(),
    description: description === "" ? null : description,
  };
}

export async function createProjectAction(form: FormData) {
  const id = createProject(db, projectFromForm(form));
  redirect(`/projects/${id}`);
}

export async function updateProjectAction(id: number, form: FormData) {
  if (!updateProject(db, id, projectFromForm(form))) notFound();
  redirect(`/projects/${id}`);
}
