import test from 'node:test';
import assert from 'node:assert/strict';
import { generateText } from 'ai';
import { createIsolatedMockProvider } from '../scripts/lib/isolated-mock-provider.mjs';

test('C2 mock-only provider harness specification', async (t) => {
  await t.test('dynamically loads provider.ts with synthetic MODEL_PROVIDER and executes mock fetch completion', async () => {
    const originalEnv = { ...process.env };
    const originalFetch = globalThis.fetch;
    let mockFetchCount = 0;
    let requestedUrl = null;

    const mockFetch = async (url, opts) => {
      mockFetchCount++;
      requestedUrl = String(url);
      return new Response(
        JSON.stringify({
          id: 'chatcmpl-test',
          object: 'chat.completion',
          created: 1234567890,
          model: 'synthetic-model',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'synthetic completion text' },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );
    };

    const provider = await createIsolatedMockProvider({
      env: {
        MODEL_PROVIDER: 'opencode',
        OPENCODE_BASE_URL: 'http://127.0.0.1:9876/v1',
        IVA_SYNTHETIC_ROOT: '/tmp/iva-mock-root-12345',
        IVA_PORT: '9876',
      },
      fetch: mockFetch,
    });

    try {
      assert.ok(provider, 'Provider harness instance should be created');
      assert.ok(provider.model, 'Provider harness must expose dynamically loaded model or getModel function');

      const result = await generateText({
        model: provider.model,
        prompt: 'hello synthetic test',
      });

      assert.equal(result.text, 'synthetic completion text', 'Must receive fixed synthetic completion text');
      assert.equal(mockFetchCount, 1, 'Mock fetch must be called exactly once');
      assert.equal(requestedUrl, 'http://127.0.0.1:9876/v1/chat/completions', 'Request URL must match expected synthetic endpoint');
    } finally {
      if (provider && typeof provider.cleanup === 'function') {
        await provider.cleanup();
      }
    }

    assert.equal(process.env.MODEL_PROVIDER, originalEnv.MODEL_PROVIDER, 'MODEL_PROVIDER value/presence must be restored');
    assert.equal(globalThis.fetch, originalFetch, 'globalThis.fetch must be restored');
  });

  await t.test('rejects port 8723 before fetch call', async () => {
    await assert.rejects(
      async () => {
        await createIsolatedMockProvider({
          env: {
            MODEL_PROVIDER: 'opencode',
            IVA_PORT: '8723',
            IVA_SYNTHETIC_ROOT: '/tmp/iva-mock-root-12345',
          },
        });
      },
      (err) => err instanceof Error && /port 8723/i.test(err.message),
      'Expected rejection for port 8723'
    );
  });

  await t.test('rejects production paths before fetch call', async () => {
    await assert.rejects(
      async () => {
        await createIsolatedMockProvider({
          env: {
            MODEL_PROVIDER: 'opencode',
            IVA_SYNTHETIC_ROOT: '/home/alx/projects/iva',
            IVA_PORT: '9876',
          },
        });
      },
      (err) => err instanceof Error && /production path/i.test(err.message),
      'Expected rejection for production paths'
    );
  });

  await t.test('rejects invalid synthetic roots before fetch call', async () => {
    await assert.rejects(
      async () => {
        await createIsolatedMockProvider({
          env: {
            MODEL_PROVIDER: 'opencode',
            IVA_SYNTHETIC_ROOT: '/invalid/synthetic/root',
            IVA_PORT: '9876',
          },
        });
      },
      (err) => err instanceof Error && /synthetic root/i.test(err.message),
      'Expected rejection for non /tmp/iva-mock-* synthetic root'
    );
  });

  await t.test('rejects codex provider before fetch call', async () => {
    await assert.rejects(
      async () => {
        await createIsolatedMockProvider({
          env: {
            MODEL_PROVIDER: 'codex',
            IVA_SYNTHETIC_ROOT: '/tmp/iva-mock-root-12345',
            IVA_PORT: '9876',
          },
        });
      },
      (err) => err instanceof Error && /codex/i.test(err.message),
      'Expected rejection for codex provider'
    );
  });

  await t.test('restores environment prior value and presence on cleanup', async () => {
    const prevModelProvider = process.env.MODEL_PROVIDER;
    const modelProviderExisted = Object.prototype.hasOwnProperty.call(process.env, 'MODEL_PROVIDER');

    const provider = await createIsolatedMockProvider({
      env: {
        MODEL_PROVIDER: 'openrouter',
        IVA_SYNTHETIC_ROOT: '/tmp/iva-mock-root-12345',
        IVA_PORT: '9876',
      },
    });

    if (provider && typeof provider.cleanup === 'function') {
      await provider.cleanup();
    }

    assert.equal(
      Object.prototype.hasOwnProperty.call(process.env, 'MODEL_PROVIDER'),
      modelProviderExisted,
      'MODEL_PROVIDER key presence must be restored'
    );
    assert.equal(
      process.env.MODEL_PROVIDER,
      prevModelProvider,
      'MODEL_PROVIDER exact value must be restored'
    );
  });
});
