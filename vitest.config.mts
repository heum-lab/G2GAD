import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // 'server-only'는 Next 번들러 밖에서 예외를 던지므로 테스트에서는 빈 모듈로 대체한다.
      'server-only': fileURLToPath(
        new URL('./tests/unit/stubs/empty.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
