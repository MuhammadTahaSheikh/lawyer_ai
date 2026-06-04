/** Curated reference: `/tasksCaseInformation` — backend/routes/tasks.js */

export const tasksCaseInformationCategory = {
  id: "tasks-case-information",
  title: "Tasks case information",
  description:
    "Case-level task rollup endpoint used for detail views (all tasks + computed completed/overdue/upcoming info).",
};

export const tasksCaseInformationEndpoints = [
  {
    id: "get-tasks-case-information-case-id",
    title: "Task details and stats for case",
    method: "GET",
    path: "/tasksCaseInformation/:caseId",
    description:
      "Returns full case task list plus computed totals and grouped sets: `totalTasks`, `completedTasks`, `overdueTasks`, `upcomingTasks`.",
    pathParams: [{ name: "caseId", type: "number", description: "Case id." }],
    headers: [{ name: "x-api-key", required: true, description: "API key." }],
    responses: [{ status: 200, example: `{ "tasks": [], "totalTasks": 0, "completedTasks": 0, "overdueTasks": [], "upcomingTasks": [] }` }, { status: 404, description: "No tasks found." }],
  },
];
