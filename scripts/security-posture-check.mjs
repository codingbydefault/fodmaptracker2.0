import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const migrationDirectory = path.join(root, "supabase", "migrations");
const migrationNames = (await readdir(migrationDirectory)).filter(name => name.endsWith(".sql")).sort();
const migrations = await Promise.all(
  migrationNames.map(async name => ({ name, sql: await readFile(path.join(migrationDirectory, name), "utf8") })),
);
const hardeningMigration = migrations.find(({ name }) => name.endsWith("_harden_patient_data_access.sql"));
const nextConfig = await readFile(path.join(root, "next.config.ts"), "utf8");
const workflow = await readFile(path.join(root, ".github", "workflows", "security.yml"), "utf8");

const failures = [];
const requireMatch = (condition, message) => { if (!condition) failures.push(message); };

requireMatch(hardeningMigration?.sql.includes("count(*) from auth.users) >= 100"), "The registration cap must reject registration number 101.");
requireMatch(hardeningMigration?.sql.includes("pg_advisory_xact_lock"), "The registration cap must serialize concurrent sign-ups.");
requireMatch(hardeningMigration?.sql.includes("alter default privileges for role postgres in schema public"), "Future public functions must not inherit PUBLIC execute.");
requireMatch(hardeningMigration?.sql.includes("revoke all on function public.handle_new_user() from public, anon, authenticated"), "The signup trigger must not be directly callable.");
requireMatch(nextConfig.includes("Content-Security-Policy-Report-Only"), "A report-only CSP must be configured before enforcement.");
requireMatch(workflow.includes("npm audit --audit-level=high"), "CI must block high-severity dependency vulnerabilities.");
requireMatch(workflow.includes("npm run security:posture"), "CI must run this security posture check.");

const unsafeDefiners = migrations.flatMap(({ name, sql }) => {
  const lines = sql.split(/\r?\n/);
  return lines.flatMap((line, index) => {
    if (!/security definer/i.test(line)) return [];
    return /set search_path\s*=\s*''/i.test(line) || /set search_path\s*=\s*''/i.test(lines[index + 1] ?? "")
      ? []
      : [`${name}:${index + 1} SECURITY DEFINER has no immediately pinned empty search_path.`];
  });
});
failures.push(...unsafeDefiners);

if (failures.length) {
  console.error("Security posture check failed:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Security posture check passed: account cap, privileged functions, CSP and CI invariants are present.");
