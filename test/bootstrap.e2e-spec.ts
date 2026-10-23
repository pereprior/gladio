import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { AppModule } from '#src/app.module.js';

describe('Application bootstrap', () => {
  it('provides environment configuration through the root module', async () => {
    const app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    try {
      await app.init();

      expect(app.get(ConfigService).get<string>('NODE_ENV')).toBe('test');
    } finally {
      await app.close();
    }
  });

  it('starts and exits successfully without provider credentials', () => {
    const output = execFileSync(process.execPath, ['dist/main.js'], {
      cwd: fileURLToPath(new URL('../', import.meta.url)),
      env: { NODE_ENV: 'test' },
      encoding: 'utf8',
      timeout: 10_000,
    });

    expect(output).toContain('Gladio initialized.');
  });
});
