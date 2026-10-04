import { notFound } from "next/navigation";
import { db } from "@/db";
import { getProject } from "@/lib/projects";
import { updateProjectAction } from "../../actions";
import { ProjectForm } from "../../project-form";

export default async function EditProjectPage({ params }: PageProps<"/projects/[id]/edit">) {
  const { id } = await params;
  const project = getProject(db, Number(id));
  if (project === undefined) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit {project.name}</h1>
      <ProjectForm
        action={updateProjectAction.bind(null, project.id)}
        project={project}
        submitLabel="Save changes"
      />
    </div>
  );
}
