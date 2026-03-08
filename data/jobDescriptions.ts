import { JOB_ROLES } from "@/data/roles";
import type { JobRoleKey } from "@/types";

export interface JobDescriptionRecord {
  id: string;
  roleKey: JobRoleKey;
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

const COMPANY_NAMES = [
  "Northstar Labs",
  "Velocity Systems",
  "Nimbus Stack",
  "Orbit Data",
  "Summit Cloud",
  "Atlas Software",
  "Bluecore Tech",
  "Signal Works",
  "Harbor Analytics",
  "Pulse Infrastructure",
  "Vertex Digital",
  "Lighthouse Platforms",
];

const TITLE_MODIFIERS = [
  "Associate",
  "Junior",
  "Platform",
  "Product",
  "Applied",
  "Core",
  "Solutions",
  "Infrastructure",
  "Developer Experience",
  "Systems",
  "Customer",
  "Growth",
];

const CROSS_ROLE_SKILLS: string[] = [
  "git",
  "testing",
  "ci/cd",
  "docker",
  "monitoring",
  "graphql",
  "rest api",
  "networking",
  "bash",
  "postgresql",
  "redis",
  "accessibility",
];

function rotate<T>(items: T[], offset: number) {
  return items.map((_, index) => items[(index + offset) % items.length] as T);
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function buildPostingSkills(roleSkills: string[], index: number) {
  const rotatedRoleSkills = rotate(roleSkills, index % roleSkills.length);
  const requiredCore = rotatedRoleSkills.slice(0, 7);
  const preferredCore = rotatedRoleSkills.slice(7, 10);
  const crossRole = rotate(CROSS_ROLE_SKILLS, index).slice(0, 3);

  return {
    requiredSkills: unique([...requiredCore, ...crossRole]).slice(0, 9),
    preferredSkills: unique([...preferredCore, ...crossRole]).slice(0, 5),
  };
}

export const JOB_DESCRIPTIONS: JobDescriptionRecord[] = JOB_ROLES.flatMap((role, roleIndex) =>
  Array.from({ length: 12 }, (_, index) => {
    const company = COMPANY_NAMES[(roleIndex * 3 + index) % COMPANY_NAMES.length] as string;
    const modifier = TITLE_MODIFIERS[(roleIndex + index) % TITLE_MODIFIERS.length] as string;
    const { requiredSkills, preferredSkills } = buildPostingSkills(role.skills, index);

    return {
      id: `${role.key}-${index + 1}`,
      roleKey: role.key,
      title: `${modifier} ${role.label}`,
      company,
      requiredSkills,
      preferredSkills,
    };
  }),
);
