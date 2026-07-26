# C5b: isolated mock-agent runtime launch card

Status: **ACCEPTED — C5d mock-provider probe completed; no further runtime approved**

## Preconditions accepted for this card

- C5a passed: the separate flat agent root has a deterministic in-process mock
  model transport; no IVA authored tools are discovered; `bash`, `write_file`,
  `web_fetch`, and `web_search` are disabled in the compiled Eve manifest.
- The only permitted application root is
  `/home/alx/projects/iva/dogfood/isolated-mock-agent/agent`.
- A non-application OS preflight passed on 2026-07-27:

  ```bash
  unshare --user --map-root-user --net /bin/sh -ceu '
    ip link set lo up
    test "$(ip -o link show | awk -F": " "{print \$2}" | paste -sd, -)" = "lo"
    test -z "$(ip route show)"
  '
  ```

  It produced `C5B_NETNS_PREFLIGHT_OK interfaces=lo routes=`. This is a
  network namespace with loopback only and no route; it did not start Iva/Eve,
  Docker, a provider, or Telegram.

## C5c command — do not execute until explicitly approved

The following creates one fresh narrow temporary root, starts only the isolated
agent with a minimal environment inside the no-route network namespace, sends
one loopback-only mock prompt, records its stream, and stops the process. It
does not use `bin/iva.mjs`, `iva.service`, `npm run start`, `eve start`, or any
project `.env` file.

```bash
set -euo pipefail
RUN_ROOT=$(mktemp -d /tmp/iva-c5c-mock-XXXXXXXX)
trap 'printf "C5c artifacts retained at %s\n" "$RUN_ROOT"' EXIT
mkdir -p "$RUN_ROOT"/{vault,data,logs,tmp,home}

env -i \
  RUN_ROOT="$RUN_ROOT" \
  HOME="$RUN_ROOT/home" \
  TMPDIR="$RUN_ROOT/tmp" \
  PATH=/usr/bin:/bin \
  NODE_ENV=development \
  PORT=18763 \
  ASSISTANT_VAULT_DIR="$RUN_ROOT/vault" \
  ASSISTANT_DATA_DIR="$RUN_ROOT/data" \
  /usr/bin/unshare --user --map-root-user --net /bin/sh -ceu '
  ip link set lo up
  test "$(ip -o link show | awk -F": " "{print \$2}" | paste -sd, -)" = "lo"
  test -z "$(ip route show)"

  unset MODEL_PROVIDER IVA_PROVIDER OPENCODE_BASE_URL OPENCODE_API_KEY \
    OLLAMA_BASE_URL OLLAMA_HOST OPENROUTER_API_KEY OPENAI_API_KEY \
    ANTHROPIC_API_KEY CODEX_API_KEY TELEGRAM_BOT_TOKEN TELEGRAM_TOKEN \
    BOT_TOKEN BRAVE_API_KEY TAVILY_API_KEY SERPAPI_API_KEY \
    AI_GATEWAY_API_KEY VERCEL_OIDC_TOKEN GITHUB_TOKEN AWS_ACCESS_KEY_ID \
    AWS_SECRET_ACCESS_KEY

  cd /home/alx/projects/iva/dogfood/isolated-mock-agent/agent
  /usr/bin/node-24 /home/alx/projects/iva/node_modules/eve/bin/eve.js \
    dev --no-ui --host 127.0.0.1 --port 18763 \
    >"$RUN_ROOT/logs/eve.log" 2>&1 &
  EVE_PID=$!
  cleanup() {
    kill "$EVE_PID" 2>/dev/null || true
    wait "$EVE_PID" 2>/dev/null || true
  }
  trap cleanup EXIT

  for n in $(seq 1 40); do
    if /usr/bin/curl --fail --silent --show-error --max-time 1 \
      http://127.0.0.1:18763/eve/v1/health >"$RUN_ROOT/logs/health.json"; then
      break
    fi
    [ "$n" -eq 40 ] && { tail -n 80 "$RUN_ROOT/logs/eve.log"; exit 1; }
    sleep 0.25
  done

  SESSION_JSON=$(/usr/bin/curl --fail --silent --show-error --max-time 5 \
    -X POST http://127.0.0.1:18763/eve/v1/session \
    -H "content-type: application/json" \
    --data "{\"message\":\"Return exactly IVA mock-only response. Do not call tools.\",\"mode\":\"task\"}")
  printf "%s\\n" "$SESSION_JSON" >"$RUN_ROOT/logs/session.json"
  SESSION_ID=$(printf "%s" "$SESSION_JSON" | /usr/bin/node-24 -e \
    "let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const x=JSON.parse(s);if(!x.ok||!x.sessionId)process.exit(2);process.stdout.write(x.sessionId)})")

  set +e
  timeout 20s /usr/bin/curl --fail --silent --show-error --no-buffer \
    "http://127.0.0.1:18763/eve/v1/session/$SESSION_ID/stream" \
    >"$RUN_ROOT/logs/stream.ndjson"
  STREAM_RC=$?
  set -e
  [ "$STREAM_RC" -eq 0 ] || [ "$STREAM_RC" -eq 124 ] || exit "$STREAM_RC"
  test "$(rg -o -F "\"message\":\"IVA mock-only response\"" "$RUN_ROOT/logs/stream.ndjson" | wc -l)" -eq 1
  test -z "$(find "$RUN_ROOT/vault" "$RUN_ROOT/data" -mindepth 1 -print -quit)"
'
```

## Environment and boundary contract

- Allowlist: `HOME`, `TMPDIR`, `PATH`, `NODE_ENV`, `PORT`,
  `ASSISTANT_VAULT_DIR`, and `ASSISTANT_DATA_DIR` only. All derive from the
  fresh `RUN_ROOT`; no inherited environment is allowed.
- Explicitly unset: model/provider, Telegram, search, bearer/OIDC, GitHub and
  AWS credential names listed in the command. The isolated `agent.ts` does not
  read them and has no provider fallback.
- Port is exactly `127.0.0.1:18763`, not `8723`, selected in the card without
  consulting `.env`. It exists only inside the network namespace.
- The model request uses Eve's built-in local HTTP session route. It reaches
  the in-process mock fetch only; no real provider, Telegram, search, or web
  request is permitted. The namespace contains no route beyond loopback.
- Logs remain in the fresh `/tmp/iva-c5c-mock-*` root for human inspection.
  The command intentionally does not delete that root.

## C5c pass/fail and stop conditions

Pass only if all are true: the wrapper exits `0`; health route is reachable from inside the namespace;
the session is accepted; its stream contains exactly `IVA mock-only response`;
the server is stopped by the trap; and no command reports a route/interface
other than `lo` or touches a non-`RUN_ROOT` vault/data path.

Stop immediately (do not substitute a normal Iva launcher) if `unshare`, Eve
dev startup, the health route, model stream, or mock assertion fails; if Docker
is invoked; if a credential/provider/Telegram variable is present; or if any
unexpected tool/network/sensitive path appears. Preserve all logs and report;
do not retry automatically.

## C5c attempt 1 — 2026-07-27 (reported, not accepted)

- The exact first card command started `eve dev --no-ui` only inside the
  loopback-only namespace. Its health route returned `{"ok":true,"status":"ready"}`
  and the one session POST returned `202` with a session id.
- The local session-id parser then failed before stream collection because its
  JavaScript contained literal `\x27` outside a string. The replacement above
  uses ordinary double-quoted JavaScript string literals and is static-checked
  separately; it has not been run as a retry.
- The EXIT trap stopped the Eve process. Primary process check found none left;
  `/tmp/iva-c5c-mock-rP7mg9XQ/{vault,data}` remained empty. The partial server
  log contains a local workflow `socket hang up` after the wrapper aborted, so
  it is not evidence of a mock-model response.
- No real provider, Telegram, service, normal Iva launcher, credential, vault,
  data, stash, tag, archive, or external network action was observed. This
attempt is a failed runtime probe, not C5c acceptance.

## C5c attempt 2 — 2026-07-27 (reported, not accepted)

- The parser correction allowed stream collection. The process again ran only
  inside the no-route namespace, exited via its trap, left no process, and left
  its temporary vault/data roots empty. Preservation checks and both archive
  checksum manifests passed.
- Primary inspection rejected the apparent green result: the old assertion
  merely found `IVA mock-only response` inside the input prompt. The completed
  model message was instead `Bootstrap reply [Instructions (instructions)]: …`.
- Local Eve source proves the cause: `NODE_ENV=test` activates
  `shouldMockAuthoredRuntimeModels()`, which replaces the authored injected
  model with Eve's internal bootstrap adapter. No call to `mockFetch` was
  established, so this is not mock-provider acceptance.

## C5d correction and gate

The command above is revised but **must not be run automatically**:

1. `NODE_ENV=development` prevents Eve's internal test adapter; with the
   otherwise empty environment it lets the isolated agent's own fail-closed
   `mockFetch` serve the model request.
2. The stream assertion now matches exactly one completed-message JSON field,
   not a phrase appearing in the submitted prompt.
3. The command remains single-run, loopback-only, no-route, no-service, and
   mock-only.

## C5d accepted evidence — 2026-07-27

- After the explicit C5d authorization, the corrected card completed from
  `/tmp/iva-c5d-mock-28Juvkvk/`. Its stream's `message.completed` event was
  exactly `IVA mock-only response`; it was not the prompt echo or Eve bootstrap
  adapter response.
- The process was stopped by the card's EXIT trap. Primary process inspection
  found no surviving Eve process. Synthetic vault/data roots were empty.
- Primary re-ran `/usr/bin/node-24 --test tests/isolated-mock-agent.test.mjs`
  (3/3), `npm run typecheck`, and `git diff --check`; all passed. Safety/archive
  tag count stayed 10, stash count stayed 3, and both external SHA-256 manifests
  verified successfully.
- The later local-workflow `socket hang up` log line occurred during process
  shutdown after `session.completed`; it does not negate the completed output
  event and was not a provider or external-network call.

No retry, normal IVA runtime, commit, push, deploy, restart, or promotion is
authorized after this accepted mock-only probe.

## Explicit user gates

1. **C5c required:** the user must explicitly authorize this one exact command
   before it is run. `C5b` preparation does not grant runtime authority.
2. **After C5c:** primary review of `RUN_ROOT/logs/` and preservation state is
   required. A green probe is `reported`, not accepted, until that review.
3. No follow-up runtime, commit, push, deploy, service restart, archive/stash
   change, or Track B reconciliation is authorized by this card.
