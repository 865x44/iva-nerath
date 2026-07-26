import { OpenCodeRetryExhaustedError } from "./opencode-fetch.js";

type StreamModel = {
  doStream: (...args: any[]) => PromiseLike<any>;
};

function signalFromArgs(args: any[]): AbortSignal | undefined {
  const options = args[0];
  if (!options || typeof options !== "object") return undefined;
  return (options as { abortSignal?: AbortSignal }).abortSignal;
}

function abortReason(signal?: AbortSignal): unknown {
  if (!signal?.aborted) return undefined;
  return signal.reason ?? new DOMException("The operation was aborted", "AbortError");
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function statusFromCauseChain(error: unknown): number | undefined {
  const seen = new Set<unknown>();
  let current = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const status = (current as { statusCode?: unknown }).statusCode;
    if (typeof status === "number") return status;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

export function isOpenCodeRetryableError(error: unknown): boolean {
  if (error instanceof OpenCodeRetryExhaustedError) return true;
  const message = error instanceof Error ? error.message : String(error);
  if (/Console Go.*Upstream request failed/i.test(message)) return true;
  const status = statusFromCauseChain(error);
  return status === 408 || status === 409 || status === 429 ||
    (status !== undefined && status >= 500);
}

/**
 * HTTP failures are retried by each model's fetch wrapper. If the primary still
 * fails with a transient transport/stream error, retry the same call once on a
 * protocol-compatible Go model. Cancellation is terminal and never starts the
 * fallback.
 */
export function withOpenCodeStreamFallback<T extends StreamModel>(
  primary: T,
  fallback: T,
  fallbackName = "glm-5.2",
): T {
  const primaryDoStream = primary.doStream.bind(primary) as (
    ...args: any[]
  ) => PromiseLike<any>;
  const fallbackDoStream = fallback.doStream.bind(fallback) as (
    ...args: any[]
  ) => PromiseLike<any>;

  return new Proxy(primary, {
    get(target, property, receiver) {
      if (property !== "doStream") return Reflect.get(target, property, receiver);

      return async (...args: any[]) => {
        const signal = signalFromArgs(args);
        const alreadyAborted = abortReason(signal);
        if (alreadyAborted !== undefined) throw alreadyAborted;

        try {
          return await primaryDoStream(...args);
        } catch (error) {
          const primaryAbort = abortReason(signal);
          if (primaryAbort !== undefined) throw primaryAbort;
          if (isAbortError(error)) throw error;
          if (!isOpenCodeRetryableError(error)) throw error;

          console.error(
            `[opencode-fallback] primary stream failed; fallback=${fallbackName}`,
          );
          try {
            return await fallbackDoStream(...args);
          } catch (fallbackError) {
            const fallbackAbort = abortReason(signal);
            if (fallbackAbort !== undefined) throw fallbackAbort;
            if (isAbortError(fallbackError)) throw fallbackError;
            throw new Error(
              `OpenCode Go Availability Error: primary and ${fallbackName} failed`,
              { cause: fallbackError },
            );
          }
        }
      };
    },
  }) as T;
}
