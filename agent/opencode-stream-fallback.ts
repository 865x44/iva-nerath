type StreamModel = {
  doStream: (...args: any[]) => PromiseLike<any>;
};

function isOpenCodeUpstreamError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Console Go.*Upstream request failed/i.test(message);
}

/**
 * HTTP retries cover failures before OpenCode starts a response. Console Go can
 * also emit an error after a 200 SSE response begins; AI SDK surfaces that as a
 * rejected doStream call. Retry only that case once on a second Go model.
 */
export function withOpenCodeStreamFallback<T extends StreamModel>(
  primary: T,
  fallback: T,
): T {
  const primaryDoStream = primary.doStream.bind(primary);
  const fallbackDoStream = fallback.doStream.bind(fallback);

  return new Proxy(primary, {
    get(target, property, receiver) {
      if (property !== "doStream") return Reflect.get(target, property, receiver);

      return async (...args: Parameters<T["doStream"]>) => {
        try {
          return await primaryDoStream(...args);
        } catch (error) {
          if (!isOpenCodeUpstreamError(error)) throw error;

          console.error(
            "[opencode-fallback] primary stream failed; fallback=qwen3.6-plus",
          );
          try {
            return await fallbackDoStream(...args);
          } catch (fallbackError) {
            throw new Error(
              "OpenCode Go Availability Error: primary and qwen3.6-plus failed",
              { cause: fallbackError },
            );
          }
        }
      };
    },
  }) as T;
}
