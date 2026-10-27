/** Current showcase options are isolated; main storefront must match its pre-removal baseline. */
import {pathToFileURL} from 'node:url';
import {runMotionIsolation} from './test-motion-isolation.mjs';
export {verifyIsolation as verifyShowcase} from './test-motion-isolation.mjs';
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await runMotionIsolation();
