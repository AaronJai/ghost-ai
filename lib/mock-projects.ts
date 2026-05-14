export type ProjectMembership = "owner" | "collaborator";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  membership: ProjectMembership;
}

export const INITIAL_MOCK_MY_PROJECTS: MockProject[] = [
  {
    id: "p-mock-1",
    name: "Payments API",
    slug: "payments-api",
    membership: "owner",
  },
  {
    id: "p-mock-2",
    name: "Blog Platform",
    slug: "blog-platform",
    membership: "owner",
  },
];

export const INITIAL_MOCK_SHARED_PROJECTS: MockProject[] = [
  {
    id: "p-mock-shared-1",
    name: "Team Dashboard",
    slug: "team-dashboard",
    membership: "collaborator",
  },
];
