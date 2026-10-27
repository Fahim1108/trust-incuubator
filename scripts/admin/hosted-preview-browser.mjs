// Temporary automation access only; never disable Preview protection.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { verifyAdminBrowser } from "./verify-browser.mjs";
export async function verifyHostedPreview(context) {
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
  const deployment = await api(`/v13/deployments/${record.id}?teamId=${team}`);
  assert.equal(deployment.projectId, project);
  assert.equal(deployment.target, "staging");
  assert.equal(deployment.readyState, "READY");
  assert.equal(deployment.meta.githubCommitSha, record.sha);
  assert.equal(deployment.gitSource.sha, record.sha);
  const previous = await api(`/v9/projects/${project}?teamId=${team}`);
  // Vercel omits rootDirectory from the deployment settings projection.
  // Verify configured root independently, then prove the correct app in the browser.
  assert.equal(previous.rootDirectory, "frontend/claude");
  const before = new Set(Object.keys(previous.protectionBypass || {}));
  let secret;
  try {
    await api(
      `/v1/projects/${project}/protection-bypass?teamId=${team}`,
      "PATCH",
      {
        generate: {
          note: "Temporary admin browser verification; automatically revoked",
        },
      },
    );
    const updated = await api(`/v9/projects/${project}?teamId=${team}`);
    const added = Object.keys(updated.protectionBypass || {}).filter(
      (k) => !before.has(k),
    );
    assert.equal(added.length, 1);
    secret = added[0];
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
    await verifyAdminBrowser({
      ...context,
      baseURL: record.url,
      extraHTTPHeaders: {
        "x-vercel-protection-bypass": secret,
        "x-vercel-set-bypass-cookie": "true",
      },
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
      await api(
        `/v1/projects/${project}/protection-bypass?teamId=${team}`,
        "PATCH",
        { revoke: { secret, regenerate: false } },
      );
      const current = await api(`/v9/projects/${project}?teamId=${team}`);
      assert(!Object.keys(current.protectionBypass || {}).includes(secret));
      console.log("Temporary Preview automation access revoked.");
    }
  }
}
