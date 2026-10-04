import { taskStatuses, type Member } from "@/db/schema";
import { statusLabels, type TaskInput } from "@/lib/tasks";

const input = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

export function TaskForm({
  action,
  members,
  values,
  submitLabel,
}: {
  action: (form: FormData) => Promise<void>;
  members: Member[];
  values?: TaskInput;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <label className="block text-sm font-medium">
        Title
        <input name="title" required defaultValue={values?.title} className={input} />
      </label>
      <label className="block text-sm font-medium">
        Description <span className="font-normal text-gray-500">(optional)</span>
        <textarea name="description" rows={4} defaultValue={values?.description ?? ""} className={input} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Status
          <select name="status" defaultValue={values?.status ?? "todo"} className={input}>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Assignee
          <select name="assigneeId" defaultValue={values?.assigneeId ?? ""} className={input}>
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Due date <span className="font-normal text-gray-500">(optional)</span>
          <input name="dueDate" type="date" defaultValue={values?.dueDate ?? ""} className={input} />
        </label>
      </div>
      <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
        {submitLabel}
      </button>
    </form>
  );
}
