import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cdkLibDir = dirname(fileURLToPath(import.meta.url));

export const cdkRoot = resolve(cdkLibDir, "..");
export const repoRoot = resolve(cdkRoot, "../..");

export function fromRepoRoot(...segments: string[]): string {
  return resolve(repoRoot, ...segments);
}
