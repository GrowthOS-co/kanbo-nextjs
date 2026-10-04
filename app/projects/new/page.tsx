import { createProjectAction } from "../actions";
import { ProjectForm } from "../project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New project</h1>
      <ProjectForm action={createProjectAction} submitLabel="Create project" />
    </div>
  );
}
