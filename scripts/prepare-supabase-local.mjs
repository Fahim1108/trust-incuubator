// Create only a fresh disposable local project. Never reset an existing database.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, cpSync, existsSync, statfsSync } from 'node:fs';
const cli = process.env.SUPABASE_CLI;
if (!cli) { console.error('Set SUPABASE_CLI to the installed Supabase CLI 2.122.0 executable.'); process.exit(2); }
// VFS copies full parent filesystems per image layer and needs far more than image download size.
const driver = execFileSync('docker', ['info', '--format', '{{.Driver}}'], { encoding: 'utf8' }).trim();
const disk = statfsSync('/tmp');
if (driver === 'vfs' && disk.bavail * disk.bsize < 64 * 1024 ** 3) {
  console.error('Real local Supabase blocked: VFS storage requires at least 64 GiB free for this verification stack. Use a larger/overlay-backed machine or configured development Supabase. No tests ran.');
  process.exit(2);
}
const directory = '/tmp/attire-supabase-verification';
if (existsSync(directory)) { console.error('Disposable project already exists. Inspect and stop it explicitly; this script never overwrites or resets existing data.'); process.exit(2); }
mkdirSync(directory, { mode: 0o700 });
const run = (args, env = process.env) => execFileSync(cli, args, { encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
try {
  run(['init', '--workdir', directory, '--yes']);
  const config = `${directory}/supabase/config.toml`;
  const contents = readFileSync(config, 'utf8').replace('[db.seed]\nenabled = true', '[db.seed]\nenabled = false').replace('enable_confirmations = false', 'enable_confirmations = true');
  writeFileSync(config, contents);
  cpSync(new URL('../supabase/migrations', import.meta.url), `${directory}/supabase/migrations`, { recursive: true, force: false });
  console.log('Starting real local Supabase. First run downloads service images; keys and service output are withheld.');
  run(['start', '--workdir', directory, '--exclude', 'realtime,storage-api,imgproxy,studio,edge-runtime,logflare,vector,supavisor,postgres-meta'], { ...process.env, SUPABASE_INTERNAL_IMAGE_REGISTRY: 'docker.io' });
  console.log('Local Supabase started and migrations applied. Run npm run test:supabase:local.');
} catch {
  console.error('Local Supabase setup failed. Inspect the disposable project and CLI connectivity; no credentials or raw service logs are printed.');
  process.exitCode = 1;
}
