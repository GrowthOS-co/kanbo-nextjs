import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/db";
import { listMembersWithOpenTasks } from "@/lib/members";

export default async function MembersPage() {
  await connection();
  const members = listMembersWithOpenTasks(db);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Members</h1>
        <Link href="/members/new" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          New member
        </Link>
      </div>
      <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 text-right font-medium">Open tasks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-2 font-medium">{member.name}</td>
              <td className="px-4 py-2">{member.email}</td>
              <td className="px-4 py-2 text-right">{member.openTasks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
