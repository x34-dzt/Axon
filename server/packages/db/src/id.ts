import { ulid } from "ulid";

export const type = {
  user: "usr",
  profile: "usrp",
  workspace_member: "wmem",
  workspace: "wksp",
  pages: "pg",
  pageContents: "pgc",
} as const;

export const createId = (idType: keyof typeof type) =>
  [type[idType], ulid()].join("_");
