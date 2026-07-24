export const createOpencodeFetch = (
  customFetch: typeof fetch = globalThis.fetch.bind(globalThis),
  customSleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
): typeof fetch => async (input, init) => {
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF = 1000;
  const MAX_BACKOFF = 10000;

  // AI SDK sends a string body either in init or in a Request.
  let bodyStr = "";
  if (init?.body && typeof init.body === "string") {
    bodyStr = init.body;
  } else if (input instanceof Request) {
    bodyStr = await input.clone().text();
  }

  let modelName = "unknown";
  try {
    if (bodyStr) {
      const parsed = JSON.parse(bodyStr);
      if (parsed.model) modelName = parsed.model;
    }
  } catch {
    // Preserve the original body when it is not JSON.
  }

  let backoffMs = INITIAL_BACKOFF;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const request = input instanceof Request ? input.clone() : new Request(input, init);
      const response = await customFetch(request);
      const status = response.status;
      const requestId =
        response.headers.get("x-request-id") ??
        response.headers.get("request-id") ??
        "none";

      if (status >= 200 && status < 400) return response;
      if (![429, 500, 502, 503, 504].includes(status)) return response;

      console.error(
        `[opencode-fetch] attempt=${attempt} model=${modelName} status=${status} reqId=${requestId}`,
      );
      if (attempt === MAX_RETRIES) break;

      const retryAfter = response.headers.get("retry-after");
      let waitMs = backoffMs;
      if (retryAfter) {
        const parsed = Number.parseInt(retryAfter, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          waitMs = Math.min(parsed * 1000, MAX_BACKOFF);
        }
      }

      const jitter = Math.floor(Math.random() * 200);
      await customSleep(waitMs + jitter);
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[opencode-fetch] attempt=${attempt} model=${modelName} error=${message.slice(0, 100)}`,
      );
      if (attempt === MAX_RETRIES) break;

      const jitter = Math.floor(Math.random() * 200);
      await customSleep(backoffMs + jitter);
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF);
    }
  }

  console.error("[opencode-fetch] primary retries exhausted; fallback=qwen3.6-plus");

  let fallbackBody = bodyStr;
  try {
    if (bodyStr) {
      const parsed = JSON.parse(bodyStr);
      parsed.model = "qwen3.6-plus";
      fallbackBody = JSON.stringify(parsed);
    }
  } catch {
    // Preserve the original body when it is not JSON.
  }

  const fallbackInit = { ...init, body: fallbackBody };
  const fallbackRequest =
    input instanceof Request
      ? new Request(input.url, {
          method: input.method,
          headers: input.headers,
          body: fallbackBody,
          mode: input.mode,
          credentials: input.credentials,
          cache: input.cache,
          redirect: input.redirect,
          referrer: input.referrer,
          integrity: input.integrity,
        })
      : new Request(input, fallbackInit);

  try {
    const response = await customFetch(fallbackRequest);
    const requestId =
      response.headers.get("x-request-id") ??
      response.headers.get("request-id") ??
      "none";
    console.error(
      `[opencode-fetch] fallback=qwen3.6-plus status=${response.status} reqId=${requestId}`,
    );

    if (response.ok) return response;
    throw new Error(
      `OpenCode Go Availability Error: fallback failed with status ${response.status}`,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("OpenCode Go Availability Error")
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`OpenCode Go Availability Error: ${message}`, {
      cause: error,
    });
  }
};

export const opencodeFetch = createOpencodeFetch();
