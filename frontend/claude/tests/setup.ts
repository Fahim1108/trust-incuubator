import { vi } from 'vitest';
// Next.js enforces server-only module boundaries in the production build.
vi.mock('server-only', () => ({}));
