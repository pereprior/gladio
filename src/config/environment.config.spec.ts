import { afterEach, describe, expect, it, vi } from 'vitest';

import { getEnvironmentFilePath } from '#src/config/environment.config.js';

describe('Environment configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses .env when NODE_ENV is not set', () => {
    vi.stubEnv('NODE_ENV', undefined);

    expect(getEnvironmentFilePath()).toBe('.env');
  });

  it('uses .env in development', () => {
    vi.stubEnv('NODE_ENV', 'development');

    expect(getEnvironmentFilePath()).toBe('.env');
  });

  it.each(['test', 'production', 'staging'])(
    'selects the environment file for %s',
    (environment) => {
      vi.stubEnv('NODE_ENV', environment);

      expect(getEnvironmentFilePath()).toBe(`.env.${environment}`);
    },
  );
});
