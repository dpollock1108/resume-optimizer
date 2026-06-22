import type { Application } from "./types";

async function applicationRequest<T>(path = "", options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/applications${path}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function getApplications(): Promise<Application[]> {
  const applications = await applicationRequest<Application[]>();
  return applications.sort(
    (first, second) =>
      new Date(second.date_applied).getTime() - new Date(first.date_applied).getTime()
  );
}

export function addApplication(app: Application): Promise<Application> {
  return applicationRequest<Application>("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(app),
  });
}

export function updateApplication(
  id: string,
  updates: Pick<Partial<Application>, "status" | "notes" | "prep">
): Promise<Application> {
  return applicationRequest<Application>(`/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export function deleteApplication(id: string): Promise<void> {
  return applicationRequest<void>(`/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
