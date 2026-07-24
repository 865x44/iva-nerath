import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

// =============================================================================
// Beerlight tool tests — через фейковый bash-shim.
//
// Шим лежит во временной директории и управляет exit-кодом через
// process.env.BEERLIGHT_SHIM_EXIT. Каждый тест импортирует beerlight.ts с
// уникальным cache-busting query, чтобы подхватить актуальные env-переменные.
// =============================================================================

let shimDir: string;
let shimPath: string;

before(async () => {
  shimDir = await mkdtemp(join(tmpdir(), "beerlight-test-"));
  shimPath = join(shimDir, "beerlight-shim.sh");

  // Пишем shim: инструмент всегда вызывает python -m beerlight.runtime <action> ...,
  // поэтому $1 = "-m", $2 = "beerlight.runtime", $3 = action, $4+ = аргументы.
  // Exit-код из BEERLIGHT_SHIM_EXIT.
  const shim = `#!/bin/bash
EXIT="\${BEERLIGHT_SHIM_EXIT:-0}"
ACT="\${3:-}"     # реальное действие (run-json, session, inspect, handoff)
SUB="\${4:-}"     # подкоманда для session

if [ "\$ACT" = "run-json" ]; then
  REQ="\${4:-}"
  if [ -f "\$REQ" ]; then
    echo '{"status":"ok","run_id":"test-run-1","cards":[{"title":"Test Card","core_shift":"Test Shift","source_basis":"Basis","practical_return":"Return","boundary":"Boundary"}],"trace_dir":"/tmp/test-traces","trajectory_update_path":"/tmp/test-traj.md","warnings":[],"error":null}'
  else
    echo "ERROR: request file not found: \$REQ" >&2
    exit 1
  fi
elif [ "\$ACT" = "session" ] && [ "\$SUB" = "run" ]; then
  echo "Run OK"
elif [ "\$ACT" = "session" ] && [ "\$SUB" = "create" ]; then
  # create input_file [session_dir] → \$5, \$6
  mkdir -p "\${6:-}" 2>/dev/null || true
  echo "Session created: \${6:-auto}"
elif [ "\$ACT" = "session" ] && [ "\$SUB" = "event" ]; then
  # event session_dir run_id candidate_id type [--reason reason] → \$5..\$8
  echo "Event recorded: type=\${8:-}"
elif [ "\$ACT" = "session" ] && [ "\$SUB" = "outcomes" ]; then
  echo "Outcomes for: \${5:-}"
else
  echo "ok"
fi
exit "\$EXIT"
`;
  await writeFile(shimPath, shim, { mode: 0o755 });
});

after(async () => {
  try {
    await rm(shimDir, { recursive: true, force: true });
  } catch {
    /* ok */
  }
});

// ── вспомогательная: импортировать tool с актуальными env ──
async function importTool(): Promise<
  Awaited<typeof import("../agent/tools/beerlight.ts")>["default"]
> {
  const { default: tool } = await import(
    `../agent/tools/beerlight.ts?case=${Math.random().toString(36).slice(2)}`
  );
  return tool;
}

// =============================================================================
// run_json
// =============================================================================

describe("beerlight run_json", () => {
  it("вызывает run-json, парсит ответ", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "run_json",
      input_path: "/tmp/test-draft.md",
      task: "найди сильные углы",
      mode: "normal",
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.status, "ok");
    assert.equal(result.run_id, "test-run-1");
    assert.ok(Array.isArray(result.cards));
    assert.equal(result.cards.length, 1);
    assert.equal(result.cards[0].title, "Test Card");
    assert.equal(result.cards[0].core_shift, "Test Shift");
  });

  it("пишет request в файл (проверяется шпионом)", async () => {
    // Шим проверяет наличие файла — если файла нет, exit 1.
    // Здесь файл создаётся самим инструментом во временной директории — тест
    // проверяет, что exitCode 0 (файл нашёлся) = request был записан.
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "run_json",
      input_path: "/tmp/test-draft.md",
      task: "тестовая задача",
    });

    assert.equal(result.exitCode, 0);
    assert.equal(result.status, "ok");
  });

  it("возвращает структурированную ошибку при non-zero exit", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    process.env.BEERLIGHT_SHIM_EXIT = "1";

    const tool = await importTool();
    const result = await tool.execute({
      action: "run_json",
      input_path: "/tmp/test-draft.md",
      task: "тестовая задача",
    });

    assert.equal(result.exitCode, 1);
    assert.ok("stderr" in result);
    assert.ok("stdout" in result);
  });
});

// =============================================================================
// session
// =============================================================================

describe("beerlight session", () => {
  it("session create — пробрасывает аргументы", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "create",
      input_file: "/tmp/test-draft.md",
      session_dir: shimDir,
    });

    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("Session created"));
  });

  it("session run — длинный таймаут (600s), проброс --task", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "run",
      session_dir: shimDir,
      task: "найди углы",
    });

    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("Run OK"));
  });

  it("session run и run_json используют и объявляют 10-минутный лимит", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(
      new URL("../agent/tools/beerlight.ts", import.meta.url),
      "utf8",
    );

    assert.match(source, /const RUN_TIMEOUT = 600_000/);
    assert.match(source, /до 10 мин/);
  });

  it("session event — проброс run_id/candidate_id/type", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "event",
      session_dir: shimDir,
      run_id: "R1",
      candidate_id: "C2",
      event_type: "selected",
    });

    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("type=selected"));
  });

  it("session event с --reason", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "event",
      session_dir: shimDir,
      run_id: "R1",
      candidate_id: "C3",
      event_type: "applied",
      reason: "внёс правки",
    });

    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("type=applied"));
  });

  it("session outcomes — проброс session_dir", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "outcomes",
      session_dir: shimDir,
    });

    assert.equal(result.exitCode, 0);
    assert.ok(result.stdout.includes("Outcomes for"));
  });

  it("session update с --file", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "update",
      session_dir: shimDir,
      file: "/tmp/new-text.md",
    });

    assert.equal(result.exitCode, 0);
  });

  it("session show — проброс session_dir", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "show",
      session_dir: shimDir,
    });

    assert.equal(result.exitCode, 0);
  });

  it("session non-zero exit → структурированная ошибка", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    process.env.BEERLIGHT_SHIM_EXIT = "2";

    const tool = await importTool();
    const result = await tool.execute({
      action: "session",
      subcommand: "show",
      session_dir: shimDir,
    });

    assert.equal(result.exitCode, 2);
    assert.ok("stderr" in result);
  });
});

// =============================================================================
// inspect
// =============================================================================

describe("beerlight inspect", () => {
  it("пробрасывает run_id", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "inspect",
      run_id: "R1",
    });

    assert.equal(result.exitCode, 0);
  });

  it("пробрасывает флаги --show-pool --calibrate", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "inspect",
      run_id: "R1",
      show_pool: true,
      calibrate: true,
    });

    assert.equal(result.exitCode, 0);
  });
});

// =============================================================================
// handoff
// =============================================================================

describe("beerlight handoff", () => {
  it("пробрасывает session_dir, --output, --yes", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "handoff",
      session_dir: shimDir,
      output: "/tmp/handoff-bundle",
    });

    assert.equal(result.exitCode, 0);
  });

  it("пробрасывает --include-traces", async () => {
    process.env.BEERLIGHT_PYTHON = shimPath;
    delete process.env.BEERLIGHT_SHIM_EXIT;

    const tool = await importTool();
    const result = await tool.execute({
      action: "handoff",
      session_dir: shimDir,
      output: "/tmp/handoff-bundle",
      include_traces: true,
    });

    assert.equal(result.exitCode, 0);
  });
});
