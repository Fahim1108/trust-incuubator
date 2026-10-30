// Temporary automation access only; never disable Preview protection.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { verifyAdminBrowser } from "./verify-browser.mjs";
export async function verifyHostedPreview(context, verify = verifyAdminBrowser) {
  const record = JSON.parse(
    await readFile(
      process.env.ADMIN_VERCEL_DEPLOYMENT_FILE ||
        "artifacts/admin/deployment.json",
      "utf8",
    ),
  );
  const token =
    process.env.VERCEL_DEPLOY_TOKEN ||
    JSON.parse(
      await readFile(
        process.env.VERCEL_AUTH_FILE ||
          "/workspace/.vercel-cli-attires/auth.json",
        "utf8",
      ),
    ).token;
  const team = "team_7KAKEOgqI7HTogjNKjt2yg2h",
    project = "prj_QgA6P7BJr74v5GbojhBXyxkXRZAA";
  assert.equal(record.project, project);
  async function api(path, method = "GET", body) {
    const r = await fetch("https://api.vercel.com" + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
    if (!r.ok) throw new Error("Preview verification API HTTP " + r.status);
    return r.json();
  }
  let deployment = await api(`/v13/deployments/${record.id}?teamId=${team}`);
  const readyDeadline=Date.now()+10*60*1000;
  while(['QUEUED','BUILDING','INITIALIZING'].includes(deployment.readyState)&&Date.now()<readyDeadline){
    console.log('Waiting for the exact Preview build to become READY.');
    await new Promise(resolve=>setTimeout(resolve,15000));
    deployment=await api(`/v13/deployments/${record.id}?teamId=${team}`);
  }
  assert.equal(deployment.projectId, project);
  assert.equal(deployment.target, "staging");
  assert.equal(deployment.readyState, "READY");
  assert.equal(deployment.meta.githubCommitSha, record.sha);
  assert.equal(deployment.gitSource.sha, record.sha);
  const previous = await api(`/v9/projects/${project}?teamId=${team}`);
  // Vercel omits rootDirectory from the deployment settings projection.
  // Verify configured root independently, then prove the correct app in the browser.
  assert.equal(previous.rootDirectory, "frontend/claude");
  // Deployment-only, one-hour share link. Never alter project-wide protection.
  const before = new Set(Object.keys(deployment.protectionBypass || {}));
  let secret;
  try {
    const shared=await api(`/aliases/${record.id}/protection-bypass?teamId=${team}`, 'PATCH', {ttl:3600});
    const updated=await api(`/v13/deployments/${record.id}?teamId=${team}`);
    const added=Object.keys(updated.protectionBypass||shared.protectionBypass||{}).filter(k=>!before.has(k));
    secret=added[0] || shared.secret;
    assert(typeof secret==='string'&&secret.length>10,'Deployment-scoped share link unavailable');
    assert(added.length<=1,'Unexpected share link changes');
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    let proxy;
    if (proxyUrl) {
      const u = new URL(proxyUrl);
      proxy = {
        server: u.protocol + "//" + u.host,
        ...(u.username
          ? {
              username: decodeURIComponent(u.username),
              password: decodeURIComponent(u.password),
            }
          : {}),
      };
    }
    await verify({
      ...context,
      baseURL: record.url,
      accessURL: record.url + "/?_vercel_share=" + encodeURIComponent(secret),
      proxy,
    });
    await writeFile(
      "artifacts/admin/deployed-verification.json",
      JSON.stringify(
        {
          url: record.url,
          sha: record.sha,
          rootDirectory: previous.rootDirectory,
          projectId: project,
          target: deployment.target,
          readyState: deployment.readyState,
          browserVerified: true,
        },
        null,
        2,
      ) + "\n",
    );
  } finally {
    if (secret) {
      await api(`/aliases/${record.id}/protection-bypass?teamId=${team}`, 'PATCH', {revoke:{secret,regenerate:false}});
      const current=await api(`/v13/deployments/${record.id}?teamId=${team}`);
      assert(!Object.keys(current.protectionBypass||{}).includes(secret));
      const projectAfter=await api(`/v9/projects/${project}?teamId=${team}`);
      assert.deepEqual(projectAfter.ssoProtection,previous.ssoProtection);
      assert.deepEqual(projectAfter.protectionBypass||{},previous.protectionBypass||{});
      console.log('Deployment-only browser access revoked; project protection unchanged.');
    }
  }
}
