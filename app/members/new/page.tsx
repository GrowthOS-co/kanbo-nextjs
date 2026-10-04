import { createMemberAction } from "../actions";

const input = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm";

export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New member</h1>
      <form action={createMemberAction} className="max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <label className="block text-sm font-medium">
          Name
          <input name="name" required className={input} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required className={input} />
        </label>
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Create member
        </button>
      </form>
    </div>
  );
}
