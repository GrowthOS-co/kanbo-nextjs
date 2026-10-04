import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { taskStatuses } from "@/db/schema";
import { formatDate, formatDateTime } from "@/lib/dates";
import { listMembers } from "@/lib/members";
import { getTask, statusLabels } from "@/lib/tasks";
import { StatusBadge } from "@/app/status-badge";
import { addCommentAction, deleteTaskAction, setTaskStatusAction } from "../actions";

const input = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

export default async function TaskPage({ params }: PageProps<"/tasks/[id]">) {
  const { id } = await params;
  const task = getTask(db, Number(id));
  if (task === undefined) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>
          <p className="text-sm text-gray-500">
            in{" "}
            <Link href={`/projects/${task.project.id}`} className="text-blue-700 hover:underline">
              {task.project.name}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link href={`/tasks/${task.id}/edit`} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Edit
          </Link>
          <form action={deleteTaskAction.bind(null, task.id)}>
            <button type="submit" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
              Delete
            </button>
          </form>
          {taskStatuses
            .filter((status) => status !== task.status)
            .map((status) => (
              <form key={status} action={setTaskStatusAction.bind(null, task.id, status)}>
                <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                  Move to {statusLabels[status]}
                </button>
              </form>
            ))}
        </div>
      </div>

      <dl className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">Assignee</dt>
          <dd className="font-medium">{task.assignee?.name ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Due</dt>
          <dd className="font-medium">{task.dueDate ? formatDate(task.dueDate) : "—"}</dd>
        </div>
      </dl>

      {task.description && <p className="whitespace-pre-line text-sm">{task.description}</p>}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        {task.comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {task.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
                <p>
                  <span className="font-medium">{comment.author.name}</span>{" "}
                  <span className="text-gray-500">{formatDateTime(comment.createdAt)}</span>
                </p>
                <p className="mt-1 whitespace-pre-line">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        <form action={addCommentAction.bind(null, task.id)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium">
            Who is writing?
            <select name="authorId" required defaultValue="" className={input}>
              <option value="" disabled>
                Choose a member
              </option>
              {listMembers(db).map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Comment
            <textarea name="body" rows={3} required className={input} />
          </label>
          <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
            Add comment
          </button>
        </form>
      </section>
    </div>
  );
}
