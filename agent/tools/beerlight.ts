import { defineTool } from "eve/tools";
import { z } from "zod";
import { exec } from "node:child_process";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

// CLI-адаптер к Beerlight Runtime v1. Вызывает питоний Runtime через node:child_process
// (паттерн bash.ts). Никакой judge/generator-логики — только проброс CLI-контракта.
// САМОДОСТАТОЧНО: eve/tools, zod, node-builtins.

const BEERLIGHT_REPO = process.env.BEERLIGHT_REPO || "/home/alx/projects/beerlight-terminal";
const BEERLIGHT_PYTHON =
  process.env.BEERLIGHT_PYTHON || join(BEERLIGHT_REPO, ".venv/bin/python");

// run-операции — 2 LLM-вызова по 2–5 минут; timeout с запасом
const RUN_TIMEOUT = 420_000; // 7 минут
const FAST_TIMEOUT = 60_000; // 1 минута
const MAX_ERROR_CHARS = 2000;

function truncate(s: string): string {
  if (s.length <= MAX_ERROR_CHARS) return s;
  return s.slice(0, MAX_ERROR_CHARS) + "…";
}

function cli(...args: string[]): string {
  const tokens = [BEERLIGHT_PYTHON, "-m", "beerlight.runtime", ...args];
  // экранируем пробельные аргументы (для shell)
  return tokens.map((t) => (/\s/.test(t) ? `"${t}"` : t)).join(" ");
}

function runCommand(
  command: string,
  timeoutMs: number,
  parseJson: boolean = false,
): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  parsed?: unknown;
  timedOut?: boolean;
}> {
  return new Promise((resolve) => {
    exec(
      command,
      { timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024, encoding: "utf8" },
      (error, stdout, stderr) => {
        const e = error as (Error & { code?: number; killed?: boolean }) | null;
        const exitCode = e?.code ?? (error ? 1 : 0);
        const out = stdout ?? "";
        const err = stderr ?? "";
        const result: {
          stdout: string;
          stderr: string;
          exitCode: number;
          parsed?: unknown;
          timedOut?: boolean;
        } = {
          stdout: exitCode !== 0 ? truncate(out) : out,
          stderr: exitCode !== 0 ? truncate(err) : err,
          exitCode,
          timedOut: e?.killed || undefined,
        };
        if (parseJson && exitCode === 0) {
          try {
            result.parsed = JSON.parse(out);
          } catch {
            result.parsed = null;
          }
        }
        resolve(result);
      },
    );
  });
}

// ── Input schema: discriminated union по action ──

const BeerlightInput = z.discriminatedUnion("action", [
  // ── run_json ──
  z.object({
    action: z.literal("run_json"),
    input_path: z.string().describe("Путь к входному текстовому файлу"),
    task: z.string().describe("Описание задачи для генератора углов"),
    mode: z.enum(["normal", "360"]).optional().default("normal"),
    trajectory_path: z.string().nullable().optional(),
    context_mode: z.enum(["trajectory", "full"]).optional().default("trajectory"),
    trace_level: z.enum(["compact", "full"]).optional().default("compact"),
    output_dir: z.string().nullable().optional(),
  }),

  // ── session ──
  z.object({
    action: z.literal("session"),
    subcommand: z.enum([
      "create",
      "run",
      "update",
      "show",
      "event",
      "outcomes",
    ]),
    session_dir: z.string().optional().describe("Директория сессии"),
    // create
    input_file: z.string().optional().describe("create: путь к исходному документу"),
    // run
    task: z.string().optional().describe("run: описание задачи"),
    mode: z.enum(["normal", "360"]).optional().describe("run: режим"),
    // update
    file: z.string().optional().describe("update: путь к файлу с новым текстом"),
    text: z.string().optional().describe("update: новый текст (инлайн)"),
    // event
    run_id: z.string().optional().describe("event: идентификатор прогона"),
    candidate_id: z
      .string()
      .optional()
      .describe("event: идентификатор кандидата"),
    event_type: z
      .enum([
        "shown",
        "selected",
        "expanded",
        "saved",
        "rejected",
        "applied",
        "revised",
        "retained",
        "reverted",
        "unrated",
      ])
      .optional()
      .describe("event: тип события"),
    reason: z.string().optional().describe("event: причина (--reason)"),
  }),

  // ── inspect ──
  z.object({
    action: z.literal("inspect"),
    run_id: z.string().describe("Run ID или путь к директории трассировки"),
    show_pool: z.boolean().optional().describe("Показать полный пул кандидатов"),
    show_judge: z.boolean().optional().describe("Показать решения judge"),
    show_errors: z.boolean().optional().describe("Показать сырые ошибки"),
    calibrate: z
      .boolean()
      .optional()
      .describe("Показать strong-dropped кандидатов"),
    session_dir: z
      .string()
      .optional()
      .describe("Директория сессии для разрешения трасс"),
  }),

  // ── handoff ──
  z.object({
    action: z.literal("handoff"),
    session_dir: z.string().describe("Директория сессии"),
    output: z.string().describe("Выходная директория для бандла"),
    include_traces: z
      .boolean()
      .optional()
      .describe("Включить сырые трассы в бандл"),
  }),
]);

type BeerlightInput = z.infer<typeof BeerlightInput>;

export default defineTool({
  description:
    "Beerlight Runtime v1 — поиск неочевидных углов и направлений для текста/черновика. " +
    "Вызывает питоний CLI (python -m beerlight.runtime). " +
    "Действия: run_json — прогнать текст (2–5 минут, предупреди пользователя); " +
    "session — управление сессией (create/run/update/show/event/outcomes); " +
    "inspect — инспекция трасс; handoff — экспорт сессии. " +
    "Перед вызовом загрузи скилл `beerlight`. " +
    "run_json и session run — долгие (до 7 мин), остальные — быстрые.",

  inputSchema: BeerlightInput,

  async execute(input: BeerlightInput) {
    let command: string;
    let timeout: number = FAST_TIMEOUT;
    let parseJson: boolean = false;

    switch (input.action) {
      // ─────────────────────────────────────────────────────────────
      // run_json
      // ─────────────────────────────────────────────────────────────
      case "run_json": {
        const request = {
          input_path: input.input_path,
          task: input.task,
          mode: input.mode ?? "normal",
          trajectory_path: input.trajectory_path ?? null,
          context_mode: input.context_mode ?? "trajectory",
          trace_level: input.trace_level ?? "compact",
          output_dir: input.output_dir ?? null,
        };

        const tmpDir = join(
          tmpdir(),
          `beerlight-${randomBytes(4).toString("hex")}`,
        );
        await mkdir(tmpDir, { recursive: true });
        const requestFile = join(tmpDir, "request.json");
        await writeFile(requestFile, JSON.stringify(request, null, 2));

        command = cli("run-json", requestFile);
        timeout = RUN_TIMEOUT;
        parseJson = true;

        const result = await runCommand(command, timeout, parseJson);

        // убираем временный файл
        try {
          await rm(tmpDir, { recursive: true, force: true });
        } catch {
          /* ok */
        }

        if (result.exitCode !== 0) {
          return {
            exitCode: result.exitCode,
            stderr: result.stderr,
            stdout: result.stdout,
            ...(result.timedOut ? { timedOut: true } : {}),
          };
        }

        const parsed = result.parsed as Record<string, unknown> | null;
        if (!parsed || typeof parsed.status !== "string") {
          return {
            exitCode: result.exitCode,
            parsed: null,
            error: "Некорректный JSON-ответ от Runtime",
            stdout: truncate(result.stdout),
          };
        }

        return {
          exitCode: result.exitCode,
          status: parsed.status,
          run_id: parsed.run_id,
          cards: parsed.cards,
          trace_dir: parsed.trace_dir,
          trajectory_update_path: parsed.trajectory_update_path,
          warnings: parsed.warnings,
          error: parsed.error,
        };
      }

      // ─────────────────────────────────────────────────────────────
      // session
      // ─────────────────────────────────────────────────────────────
      case "session": {
        const args: string[] = ["session", input.subcommand];

        switch (input.subcommand) {
          case "create": {
            if (!input.input_file) {
              return { error: "session create требует input_file" };
            }
            args.push(input.input_file);
            if (input.session_dir) args.push(input.session_dir);
            break;
          }
          case "run": {
            if (!input.task) {
              return { error: "session run требует --task" };
            }
            args.push("--task", input.task);
            if (input.mode) args.push("--mode", input.mode);
            if (!input.session_dir) {
              return { error: "session run требует session_dir" };
            }
            args.push(input.session_dir);
            timeout = RUN_TIMEOUT;
            break;
          }
          case "update": {
            if (input.file) args.push("--file", input.file);
            if (!input.session_dir) {
              return { error: "session update требует session_dir" };
            }
            args.push(input.session_dir);
            if (input.text) args.push(input.text);
            break;
          }
          case "show": {
            if (!input.session_dir) {
              return { error: "session show требует session_dir" };
            }
            args.push(input.session_dir);
            break;
          }
          case "event": {
            if (!input.session_dir || !input.run_id || !input.candidate_id || !input.event_type) {
              return {
                error:
                  "session event требует session_dir, run_id, candidate_id, event_type",
              };
            }
            args.push(
              input.session_dir,
              input.run_id,
              input.candidate_id,
              input.event_type,
            );
            if (input.reason) args.push("--reason", input.reason);
            break;
          }
          case "outcomes": {
            if (!input.session_dir) {
              return { error: "session outcomes требует session_dir" };
            }
            args.push(input.session_dir);
            break;
          }
        }

        command = cli(...args);
        const result = await runCommand(command, timeout);
        return {
          exitCode: result.exitCode,
          stdout: result.stdout,
          ...(result.exitCode !== 0 ? { stderr: result.stderr } : {}),
          ...(result.timedOut ? { timedOut: true } : {}),
        };
      }

      // ─────────────────────────────────────────────────────────────
      // inspect
      // ─────────────────────────────────────────────────────────────
      case "inspect": {
        const args: string[] = ["inspect", input.run_id];
        if (input.show_pool) args.push("--show-pool");
        if (input.show_judge) args.push("--show-judge");
        if (input.show_errors) args.push("--show-errors");
        if (input.calibrate) args.push("--calibrate");
        if (input.session_dir) args.push("--session", input.session_dir);

        command = cli(...args);
        timeout = FAST_TIMEOUT;

        const result = await runCommand(command, timeout);
        return {
          exitCode: result.exitCode,
          stdout: result.stdout,
          ...(result.exitCode !== 0 ? { stderr: result.stderr } : {}),
          ...(result.timedOut ? { timedOut: true } : {}),
        };
      }

      // ─────────────────────────────────────────────────────────────
      // handoff
      // ─────────────────────────────────────────────────────────────
      case "handoff": {
        const args: string[] = [
          "handoff",
          input.session_dir,
          "--output",
          input.output,
          "--yes",
        ];
        if (input.include_traces) args.push("--include-traces");

        command = cli(...args);
        timeout = FAST_TIMEOUT;

        const result = await runCommand(command, timeout);
        return {
          exitCode: result.exitCode,
          stdout: result.stdout,
          ...(result.exitCode !== 0 ? { stderr: result.stderr } : {}),
          ...(result.timedOut ? { timedOut: true } : {}),
        };
      }
    }
  },
});
