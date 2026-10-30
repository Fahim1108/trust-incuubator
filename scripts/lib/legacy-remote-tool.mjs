// Historical tools retain their source for review, but cannot use old live bindings.
export function rejectLegacyRemoteTool(){
 throw new Error('Safety block: this legacy remote tool is retired. Use npm run verify:staging, npm run migrate:staging, or scripts/admin/test-hosted.mjs. No network request was made.');
}
