/** The old stagger/zoom demonstration was superseded by quiet heading-only motion. */
import {pathToFileURL} from 'node:url';
import {runQuietMotion} from './test-quiet-motion.mjs';
export {verifyQuietMotion as verifyShowcase} from './test-quiet-motion.mjs';
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await runQuietMotion();
