import { createProfile } from "./api";
import { addApplication, getApplications } from "./store";
import type { Application, UserProfile } from "./types";

type LegacyApplication = Omit<Application, "profile_id">;

let migrationPromise: Promise<UserProfile[]> | null = null;

function readLegacyValue<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function runMigration(remoteProfiles: UserProfile[]): Promise<UserProfile[]> {
  const legacyProfiles = readLegacyValue<Omit<UserProfile, "id">>("ro_profiles");
  const legacyApplications = readLegacyValue<LegacyApplication>("ro_applications");
  if (legacyProfiles.length === 0 && legacyApplications.length === 0) {
    return remoteProfiles;
  }

  const profiles = [...remoteProfiles];
  for (const legacyProfile of legacyProfiles) {
    let profile = profiles.find(
      (candidate) =>
        candidate.name === legacyProfile.name && candidate.resume === legacyProfile.resume
    );
    if (!profile) {
      profile = await createProfile(legacyProfile);
      profiles.push(profile);
    }
  }

  const remoteApplications = await getApplications();
  const existingIds = new Set(remoteApplications.map((application) => application.id));
  for (const legacyApplication of legacyApplications) {
    if (existingIds.has(legacyApplication.id)) continue;
    const profile = profiles.find(
      (candidate) => candidate.name === legacyApplication.profile_name
    );
    if (!profile) continue;
    await addApplication({ ...legacyApplication, profile_id: profile.id });
    existingIds.add(legacyApplication.id);
  }

  localStorage.removeItem("ro_profiles");
  localStorage.removeItem("ro_applications");
  return profiles;
}

export function migrateLocalData(remoteProfiles: UserProfile[]): Promise<UserProfile[]> {
  if (!migrationPromise) migrationPromise = runMigration(remoteProfiles);
  return migrationPromise;
}
