// Unit tests are pure: no database, no network.
// `server-only` throws outside a React Server environment, so stub it for tests.
import { vi } from 'vitest'

vi.mock('server-only', () => ({}))
