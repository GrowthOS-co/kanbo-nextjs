import { notFound } from "next/navigation";
import { db } from "@/db";
import { listMembers } from "@/lib/members";
import { getTask } from "@/lib/tasks";
import { updateTaskAction } from "../../actions";
import { TaskForm } from "../../task-form";

export default async function EditTaskPage({ params }: PageProps<"/tasks/[id]/edit">) {
  const { id } = await params;
  const task = getTask(db, Number(id));
  if (task === undefined) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit {task.title}</h1>
      <TaskForm
        action={updateTaskAction.bind(null, task.id)}
        members={listMembers(db)}
        values={task}
        submitLabel="Save changes"
      />
    </div>
  );
}
