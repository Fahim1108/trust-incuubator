import projects from '../../frontend/claude/src/config/supabase-projects.json' with {type:'json'};
import { assertRemoteDatabaseIsolation } from '../lib/deployment-isolation.mjs';
import {getStagingPublishableKey} from '../lib/supabase-development.mjs';
// Deploy an exact pushed commit to the existing separate Preview project only.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
const project = "prj_QgA6P7BJr74v5GbojhBXyxkXRZAA",
  team = "team_7KAKEOgqI7HTogjNKjt2yg2h";
const branch = "feature/claude-frontend-integration";
const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
if (
  execFileSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
  }).trim() !== branch
)
  throw new Error("Refusing another branch");
const remote = execFileSync(
  "git",
  ["ls-remote", "origin", "refs/heads/" + branch],
  { encoding: "utf8" },
).split(/\s/)[0];
if (remote !== sha)
  throw new Error("Push the verified exact commit before deployment");
const token =
  process.env.VERCEL_DEPLOY_TOKEN ||
  JSON.parse(
    await readFile(
      process.env.VERCEL_AUTH_FILE ||
        "/workspace/.vercel-cli-attires/auth.json",
      "utf8",
    ),
  ).token;
// Explicitly authorized code-only boundary releases can be tested on Preview
// while the database is shared. This NEVER enables hosted mutation tests or migrations.
const codeOnly = process.argv.find(arg => arg.startsWith('--code-only-from='))?.split('=')[1];
if (codeOnly) {
  if (!/^[a-f0-9]{7,40}$/.test(codeOnly)) throw new Error('Expected a reviewed baseline commit SHA');
  execFileSync('git',['merge-base','--is-ancestor',codeOnly,sha]);
  const files=execFileSync('git',['diff','--name-only',codeOnly,sha],{encoding:'utf8'}).trim().split('\n');
  if(files.some(path=>/^(supabase\/|scripts\/inventory\/|scripts\/admin\/migrate|scripts\/lib\/supabase-development)/.test(path)))
    throw new Error('Code-only release contains database changes; refusing shared-database deployment');
  console.log('Code-only Preview release: no database migrations or hosted mutation tests authorized.');
} else {
  await assertRemoteDatabaseIsolation(`https://${projects.staging}.supabase.co`);
}
// Pin this deployment to the already verified staging public configuration.
// No project-wide variables or Production configuration are changed.
const stagingUrl=`https://${projects.staging}.supabase.co`;
const stagingKey=await getStagingPublishableKey();
const settings=await fetch(stagingUrl+'/auth/v1/settings',{headers:{apikey:stagingKey},signal:AbortSignal.timeout(20000)});
if(!settings.ok)throw new Error('Staging public key failed gateway verification: HTTP '+settings.status);
const response = await fetch(
  `https://api.vercel.com/v13/deployments?teamId=${team}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "attires-arena-frontend-preview",
      project,
      target: "staging",
      env:{SUPABASE_URL:stagingUrl,SUPABASE_PUBLISHABLE_KEY:stagingKey,CLAUDE_DESIGN_PREVIEW:"1"},
      gitSource: { type: "github", repoId: 1233834845, ref: sha },
      projectSettings: {
        rootDirectory: "frontend/claude",
        framework: "nextjs",
        nodeVersion: "24.x",
        buildCommand: "npm run build",
        installCommand: "npm ci --include=dev",
      },
      meta: {
        githubCommitSha: sha,
        githubCommitRef: branch,
        githubCommitOrg: "Fahim1108",
        githubCommitRepo: "trust-incuubator",
      },
    }),
    signal: AbortSignal.timeout(60000),
  },
);
if (!response.ok)
  throw new Error("Preview deployment request failed HTTP " + response.status);
const deployment = await response.json();
if (deployment.target === "production" || deployment.projectId !== project)
  throw new Error("Deployment scope did not match Preview project");
const record = {
  id: deployment.id,
  url: "https://" + deployment.url,
  sha,
  project,
  team,
  target: deployment.target,
};
await mkdir("artifacts/admin", { recursive: true });
await writeFile(
  "artifacts/admin/deployment.json",
  JSON.stringify(record, null, 2) + "\n",
);
console.log(JSON.stringify(record));
