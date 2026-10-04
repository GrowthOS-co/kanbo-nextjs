import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { taskStatuses, type Member } from "@/db/schema";
import { formatDate } from "@/lib/dates";
import { listMembers } from "@/lib/members";
import { getProject } from "@/lib/projects";
import { boardColumns, statusLabels, type AssigneeFilter } from "@/lib/tasks";

// "unassigned", a member's id, or anything else for everyone.
function parseAssignee(value: string | string[] | undefined, members: Member[]): AssigneeFilter {
  if (value === "unassigned") return "unassigned";
  return members.find((member) => String(member.id) === value)?.id ?? null;
}

export default async function BoardPage({ params, searchParams }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const project = getProject(db, Number(id));
  if (project === undefined) notFound();

  const members = listMembers(db);
  const assignee = parseAssignee((await searchParams).assignee, members);
  const columns = boardColumns(db, project.id, assignee);

  const boardPath = `/projects/${project.id}`;
  const filters: { label: string; value: AssigneeFilter }[] = [
    { label: "All", value: null },
    ...members.map((member) => ({ label: member.name, value: member.id })),
    { label: "Unassigned", value: "unassigned" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.description && <p className="text-sm text-gray-500">{project.description}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`${boardPath}/edit`} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
            Edit
          </Link>
          <Link href={`${boardPath}/tasks/new`} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
            New task
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2 text-sm">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value === null ? boardPath : `${boardPath}?assignee=${filter.value}`}
            className={`rounded-full px-3 py-1 ${
              filter.value === assignee ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 md:grid-cols-3">
        {taskStatuses.map((status) => (
          <section key={status} className="space-y-3 rounded-lg bg-gray-100 p-3">
            <h2 className="flex items-center justify-between text-sm font-semibold text-gray-700">
              {statusLabels[status]}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">
                {columns[status].length}
              </span>
            </h2>
            {columns[status].map((task) => (
              <div key={task.id} className="space-y-1 rounded-lg border border-gray-200 bg-white p-3 text-sm">
                <Link href={`/tasks/${task.id}`} className="font-medium text-blue-700 hover:underline">
                  {task.title}
                </Link>
                <p className="text-gray-600">{task.assignee?.name ?? "Unassigned"}</p>
                {task.dueDate && <p className="text-gray-500">Due {formatDate(task.dueDate)}</p>}
                {task.comments.length > 0 && (
                  <p className="text-gray-500">
                    {task.comments.length} comment{task.comments.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
