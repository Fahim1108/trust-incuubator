/** Reviewable migration plan only; no network or database side effects. */
export function buildStagingMigrationPlan(files,appliedVersions){
 const applied=new Set(appliedVersions);
 const versions=new Set();
 const ordered=[...files].sort((a,b)=>a.name.localeCompare(b.name));
 for(const file of ordered){
  if(!/^\d{14}_[a-z0-9_]+\.sql$/.test(file.name))throw new Error('Invalid migration filename');
  const version=file.name.slice(0,14);
  if(versions.has(version))throw new Error('Duplicate migration version');
  versions.add(version);
 }
 if([...applied].some(v=>!versions.has(v)))throw new Error('Staging has unknown migrations; review history before proceeding');
 return ordered.filter(f=>!applied.has(f.name.slice(0,14))).map(f=>({
  version:f.name.slice(0,14),name:f.name.slice(15,-4),
  original:f.sql,
  // Strip transaction wrappers even when preceded by a source comment. Keep
  // PL/pgSQL BEGIN/END blocks (which do not use BEGIN;) untouched.
  sql:f.sql.replace(/^\s*(?:begin|commit);\s*$/gmi,''),
 }));
}
