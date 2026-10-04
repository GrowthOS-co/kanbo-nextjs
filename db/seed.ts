// Replaces everything in the database with the sample team below. Due dates
// are relative to today and comment times relative to now, so the board
// always has work that is late, due soon and recently discussed.
import { sql } from "drizzle-orm";
import { addDays, toDateTime, today } from "../lib/dates";
import { db } from "./index";
import { comments, members, projects, tasks, type TaskStatus } from "./schema";

const sampleMembers = [
  { name: "Nina Patel", email: "nina.patel@example.com" },
  { name: "Omar Haddad", email: "omar.haddad@example.com" },
  { name: "Lena Fischer", email: "lena.fischer@example.com" },
  { name: "Jamal Carter", email: "jamal.carter@example.com" },
  { name: "Yuki Tanaka", email: "yuki.tanaka@example.com" },
];

const sampleProjects = [
  { name: "Website relaunch", description: "New marketing site with the refreshed brand." },
  { name: "Mobile app", description: "Native iOS and Android app for our customers." },
  { name: "Customer onboarding", description: "Make the first week smoother for new customers." },
];

type SampleTask = [
  project: number, // 1-based, as listed above
  title: string,
  status: TaskStatus,
  assignee: number | null, // 1-based member
  dueInDays: number | null,
  description: string | null,
];

const sampleTasks: SampleTask[] = [
  [1, "Write homepage copy", "done", 3, -10, "Headline, three benefit blocks and a closing call to action."],
  [1, "Design logo variations", "done", 5, -14, null],
  [1, "Build pricing page", "in_progress", 2, 3, "Three plans with a monthly price each."],
  [1, "Migrate blog posts", "todo", 2, 12, "Move the 40 posts from the old site, keeping their URLs."],
  [1, "Choose hosting provider", "done", 4, -20, null],
  [1, "Accessibility review", "todo", null, 15, "Check contrast, headings and keyboard navigation on every page."],
  [1, "Update product screenshots", "in_progress", 5, 5, null],
  [1, "Redirect old URLs", "todo", 4, 18, null],
  [1, "Contact form", "todo", null, null, "Name, email and message, sent to the support inbox."],
  [2, "Login screen design", "done", 5, -7, null],
  [2, "Push notification settings", "in_progress", 2, 6, "Let people choose which notifications they get."],
  [2, "Offline mode for task list", "todo", 2, 25, null],
  [2, "App store screenshots", "todo", 5, 20, null],
  [2, "Crash reporting setup", "done", 4, -3, null],
  [2, "Beta tester sign-up form", "in_progress", 1, 2, "Collect name, email and device type."],
  [2, "Dark mode", "todo", null, null, null],
  [2, "Release checklist", "todo", 1, 30, null],
  [3, "Welcome email sequence", "in_progress", 3, 4, "Three emails over the first week."],
  [3, "Product tour", "todo", 5, 10, null],
  [3, "Help center articles", "in_progress", 3, 8, "Ten short articles for the most common questions."],
  [3, "Kickoff call template", "done", 1, -5, null],
  [3, "Sample data for new accounts", "todo", 4, 14, null],
  [3, "Onboarding survey", "todo", null, null, null],
  [3, "Measure time to first project", "done", 1, -2, null],
];

type SampleComment = [task: number, author: number, hoursAgo: number, body: string];

const sampleComments: SampleComment[] = [
  [1, 1, 300, "Approved, thanks!"],
  [3, 2, 30, "First pass is up on the preview site."],
  [3, 1, 26, "Looks good. Can we add a yearly plan toggle?"],
  [3, 2, 4, "Toggle added."],
  [7, 5, 50, "Waiting on the final dashboard design before I capture these."],
  [11, 2, 20, "iOS is done, Android next."],
  [11, 4, 18, "Remember the quiet-hours setting from the survey."],
  [14, 4, 80, "Errors now show up in the dashboard."],
  [15, 1, 72, "Draft form shared with the team."],
  [15, 3, 70, "Should we ask for device type?"],
  [15, 1, 3, "Added device type."],
  [18, 3, 48, "Three emails: welcome, first project, invite your team."],
  [18, 1, 40, "Let's send the second one on day 2, not day 3."],
  [20, 3, 10, "Eight articles drafted, two to go."],
];

const todayDate = today();
const now = Date.now();

db.transaction((tx) => {
  tx.delete(comments).run();
  tx.delete(tasks).run();
  tx.delete(projects).run();
  tx.delete(members).run();
  tx.run(sql`DELETE FROM sqlite_sequence`);

  const memberIds = sampleMembers.map(
    (member) => tx.insert(members).values(member).returning({ id: members.id }).get().id,
  );
  const projectIds = sampleProjects.map(
    (project) => tx.insert(projects).values(project).returning({ id: projects.id }).get().id,
  );
  const taskIds = sampleTasks.map(
    ([project, title, status, assignee, dueInDays, description]) =>
      tx
        .insert(tasks)
        .values({
          projectId: projectIds[project - 1],
          title,
          status,
          assigneeId: assignee === null ? null : memberIds[assignee - 1],
          dueDate: dueInDays === null ? null : addDays(todayDate, dueInDays),
          description,
        })
        .returning({ id: tasks.id })
        .get().id,
  );
  tx.insert(comments)
    .values(
      sampleComments.map(([task, author, hoursAgo, body]) => ({
        taskId: taskIds[task - 1],
        authorId: memberIds[author - 1],
        body,
        createdAt: toDateTime(new Date(now - hoursAgo * 3_600_000)),
      })),
    )
    .run();
});

console.log(
  `Seeded ${sampleMembers.length} members, ${sampleProjects.length} projects, ` +
    `${sampleTasks.length} tasks and ${sampleComments.length} comments.`,
);
