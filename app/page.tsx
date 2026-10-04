import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/db";
import { listProjects } from "@/lib/projects";

export default async function ProjectsPage() {
  await connection();
  const projects = listProjects(db);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/projects/new" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">No projects yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id} className="space-y-3 rounded-lg border border-gray-200 bg-white p-5">
              <div>
                <Link href={`/projects/${project.id}`} className="text-lg font-semibold text-blue-700 hover:underline">
                  {project.name}
                </Link>
                {project.description && <p className="mt-1 text-sm text-gray-600">{project.description}</p>}
              </div>
              <p className="text-sm text-gray-500">
                {project.progress.todo} to do · {project.progress.in_progress} in progress ·{" "}
                {project.progress.done} done
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full bg-green-600" style={{ width: `${project.progress.percentDone}%` }} />
              </div>
              <p className="text-sm font-medium">{project.progress.percentDone}% done</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
