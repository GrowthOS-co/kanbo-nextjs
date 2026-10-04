"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { createMember } from "@/lib/members";

export async function createMemberAction(form: FormData) {
  createMember(db, {
    name: String(form.get("name")).trim(),
    email: String(form.get("email")).trim(),
  });
  redirect("/members");
}
