export type OpencodeSleep = (
  milliseconds: number,
  signal?: AbortSignal,
) => Promise<void>;

export class OpenCodeRetryExhaustedError extends Error {
  readonly model: string;
  readonly status?: number;

  constructor(
    model: string,
    options: { status?: number; cause?: unknown } = {},
  ) {
    const suffix =
      options.status === undefined ? "" : ` (HTTP ${options.status})`;
    super(`OpenCode Go retry attempts exhausted for ${model}${suffix}`, {
      cause: options.cause,
    });
    this.name = "OpenCodeRetryExhaustedError";
    this.model = model;
    this.status = options.status;
  }
}

function abortReason(signal?: AbortSignal): unknown {
  if (!signal?.aborted) return undefined;
  return signal.reason ?? new DOMException("The operation was aborted", "AbortError");
}

function throwIfAborted(signal?: AbortSignal): void {
  const reason = abortReason(signal);
  if (reason !== undefined) throw reason;
}

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  return (
    signal?.aborted === true ||
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

const abortableSleep: OpencodeSleep = (milliseconds, signal) =>
  new Promise((resolve, reject) => {
    throwIfAborted(signal);
    const timer = setTimeout(done, milliseconds);

    function done() {
      signal?.removeEventListener("abort", aborted);
      resolve();
    }

    function aborted() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", aborted);
      reject(abortReason(signal));
    }

    signal?.addEventListener("abort", aborted, { once: true });
  });

function retryDelay(response: Response, backoffMs: number): number {
  const retryAfter = response.headers.get("retry-after");
  if (!retryAfter) return backoffMs;

  const seconds = Number.parseInt(retryAfter, 10);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 10_000);
  }
  return backoffMs;
}

export const createOpencodeFetch = (
  customFetch: typeof fetch = globalThis.fetch.bind(globalThis),
  customSleep: OpencodeSleep = abortableSleep,
): typeof fetch => async (input, init) => {
  const MAX_ATTEMPTS = 3;
  const INITIAL_BACKOFF = 1000;
  const MAX_BACKOFF = 10_000;
  const callerSignal =
    init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const baseRequest = new Request(input, init);
  const bodyStr = await baseRequest.clone().text();

  let modelName = "unknown";
  try {
    const parsed = JSON.parse(bodyStr);
    if (typeof parsed.model === "string") modelName = parsed.model;
  } catch {
    // Preserve non-JSON bodies; only logging loses the model label.
  }

  let backoffMs = INITIAL_BACKOFF;
  let lastError: unknown;
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    throwIfAborted(callerSignal);
    try {
      const response = await customFetch(
        baseRequest.clone(),
        callerSignal ? { signal: callerSignal } : undefined,
      );
      lastStatus = response.status;
      const requestId =
        response.headers.get("x-request-id") ??
        response.headers.get("request-id") ??
        "none";

      if (response.status >= 200 && response.status < 400) return response;
      if (![429, 500, 502, 503, 504].includes(response.status)) return response;

      console.error(
        `[opencode-fetch] attempt=${attempt} model=${modelName} status=${response.status} reqId=${requestId}`,
      );
      if (attempt === MAX_ATTEMPTS) break;

      const waitMs = retryDelay(response, backoffMs);
      await customSleep(waitMs, callerSignal);
      throwIfAborted(callerSignal);
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF);
    } catch (error) {
      if (isAbortError(error, callerSignal)) throw error;
      lastError = error;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[opencode-fetch] attempt=${attempt} model=${modelName} error=${message.slice(0, 100)}`,
      );
      if (attempt === MAX_ATTEMPTS) break;

      await customSleep(backoffMs, callerSignal);
      throwIfAborted(callerSignal);
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF);
    }
  }

  throwIfAborted(callerSignal);
  throw new OpenCodeRetryExhaustedError(modelName, {
    status: lastStatus,
    cause: lastError,
  });
};

export const opencodeFetch = createOpencodeFetch();
