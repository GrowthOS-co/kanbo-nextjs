import { notFound } from "next/navigation";
import { db } from "@/db";
import { listMembers } from "@/lib/members";
import { getProject } from "@/lib/projects";
import { createTaskAction } from "@/app/tasks/actions";
import { TaskForm } from "@/app/tasks/task-form";

export default async function NewTaskPage({ params }: PageProps<"/projects/[id]/tasks/new">) {
  const { id } = await params;
  const project = getProject(db, Number(id));
  if (project === undefined) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New task in {project.name}</h1>
      <TaskForm
        action={createTaskAction.bind(null, project.id)}
        members={listMembers(db)}
        submitLabel="Create task"
      />
    </div>
  );
}
