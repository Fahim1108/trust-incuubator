import type {ReactNode} from 'react';
/** Ready route content is static, including checkout and account navigation. */
export function RouteMotion({children}:{children:ReactNode}){return <div data-route-motion>{children}</div>;}
