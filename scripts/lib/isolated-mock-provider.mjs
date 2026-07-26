import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export async function createIsolatedMockProvider(options = {}) {
  const env = options.env || {};

  if (env.IVA_PORT !== undefined && String(env.IVA_PORT) === '8723') {
    throw new Error('Port 8723 is forbidden for isolated mock provider');
  }

  const syntheticRoot = String(env.IVA_SYNTHETIC_ROOT || '');
  if (syntheticRoot.includes('/home/') || syntheticRoot.includes('projects/iva')) {
    throw new Error('Production path is forbidden for synthetic root');
  }

  if (!syntheticRoot.startsWith('/tmp/iva-mock-')) {
    throw new Error('Invalid synthetic root: must start with /tmp/iva-mock-');
  }

  const modelProvider = (env.MODEL_PROVIDER || env.IVA_PROVIDER || '').toLowerCase();
  if (!['ollama', 'opencode', 'openrouter'].includes(modelProvider)) {
    throw new Error(`Provider ${modelProvider || '(missing)'} is forbidden in isolated mock provider harness`);
  }

  const originalEnvValues = new Map();
  const originalEnvExisted = new Map();

  for (const [key, value] of Object.entries(env)) {
    originalEnvExisted.set(key, Object.prototype.hasOwnProperty.call(process.env, key));
    originalEnvValues.set(key, process.env[key]);
    process.env[key] = String(value);
  }

  const failClosedFetch = async (url) => {
    throw new Error(`Unexpected fetch to ${url}: mock transport fails closed`);
  };

  const effectiveFetch = options.fetch || failClosedFetch;

  const cleanup = async () => {
    for (const [key, existed] of originalEnvExisted.entries()) {
      if (existed) {
        process.env[key] = originalEnvValues.get(key);
      } else {
        delete process.env[key];
      }
    }
  };

  try {
    const importUrl = `../../agent/provider.ts?v=${Date.now()}_${Math.random()}`;
    const providerModule = await import(importUrl);

    const sdkProvider = createOpenAICompatible({
      name: `iva-${providerModule.providerName}`,
      baseURL: providerModule.providerConfig.baseURL,
      apiKey: providerModule.providerConfig.apiKey || 'synthetic-key',
      fetch: effectiveFetch,
    });

    const model = sdkProvider(providerModule.providerConfig.textModel);

    return {
      env,
      fetch: effectiveFetch,
      model,
      providerName: providerModule.providerName,
      providerConfig: providerModule.providerConfig,
      cleanup,
    };
  } catch (err) {
    await cleanup();
    throw err;
  }
}
