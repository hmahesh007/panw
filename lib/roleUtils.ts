import { ROLE_DATA } from "@/data/roles";
import type { JobRoleDefinition } from "@/types";

function slugifyRole(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function normalizeRole(value: string) {
  return slugifyRole(value);
}

export function getRoleDefinition(value: string): JobRoleDefinition | null {
  const normalized = normalizeRole(value);

  return ROLE_DATA[normalized as keyof typeof ROLE_DATA] ?? null;
}
