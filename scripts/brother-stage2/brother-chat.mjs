import readline from 'node:readline';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export const PROD_VAULT_PREFIX = '/home/alx/projects/iva/vault';

export function assertPlayCanonWriteAllowed(targetPath) {
  const resolved = path.resolve(targetPath);
  if (resolved.startsWith(PROD_VAULT_PREFIX)) {
    throw new Error(`ABORT: Play Canon write denied for production vault path: ${resolved}`);
  }
}

export function createPlayCanonEntry(targetPath, title, content) {
  assertPlayCanonWriteAllowed(targetPath);

  const frontmatter = `---
title: ${JSON.stringify(title)}
type: "play_canon"
factual: false
created_at: ${JSON.stringify(new Date().toISOString())}
---

${content.trim()}
`;

  const dir = path.dirname(targetPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(targetPath, frontmatter, 'utf8');
  return targetPath;
}

export function isReducedMotion(args = process.argv, env = process.env) {
  if (args && args.includes('--reduced-motion')) return true;
  if (env && (env.REDUCED_MOTION === '1' || env.REDUCED_MOTION === 'true')) return true;
  if (env && env.TERM === 'dumb') return true;
  if (env && 'NO_COLOR' in env) return true;
  return false;
}

const color = (code) => (str) => {
  const isDumb = process.env.TERM === 'dumb';
  const noColor = 'NO_COLOR' in process.env;
  return (isDumb || noColor) ? str : `\x1b[${code}m${str}\x1b[0m`;
};

const cyan = color('38;5;51');
const magenta = color('38;5;199');
const yellow = color('38;5;220');
const green = color('38;5;82');
const white = color('38;5;231');

export const EOF = Symbol('EOF');

export class BrotherTerminalUI {
  constructor(inputStream = process.stdin, outputStream = process.stdout, sigwinchEmitter = process, options = {}) {
    this.inputStream = inputStream;
    this.outputStream = outputStream;
    this.rl = readline.createInterface({ input: inputStream, output: outputStream });
    this.printedLength = 0;
    this.currentLineLength = 0;
    this.cleanedUp = false;
    this.cursorHidden = false;
    this.width = Math.max(this.outputStream.columns || 80, 20);
    this.EOF = EOF;
    this.reducedMotion = options.reducedMotion ?? isReducedMotion();
    this.currentState = 'IDLE';
    this.animationFrames = [];

    this.onResize = () => {
      this.width = Math.max(this.outputStream.columns || 80, 20);
    };
    this.sigwinchEmitter = sigwinchEmitter;
    if (this.sigwinchEmitter && typeof this.sigwinchEmitter.on === 'function') {
      this.sigwinchEmitter.on('SIGWINCH', this.onResize);
    }
  }

  async prompt(prefix = '⚡ brother:: ') {
    return new Promise((resolve) => {
      const onLine = (line) => {
        cleanup();
        resolve(line);
      };
      const onClose = () => {
        cleanup();
        resolve(this.EOF);
      };
      const cleanup = () => {
        this.rl.removeListener('line', onLine);
        this.rl.removeListener('close', onClose);
      };
      this.rl.on('line', onLine);
      this.rl.on('close', onClose);
      this.rl.setPrompt(cyan(prefix));
      this.rl.prompt();
    });
  }

  hideCursor() {
    const isDumb = process.env.TERM === 'dumb';
    const noColor = 'NO_COLOR' in process.env;
    if (!isDumb && !noColor && !this.cursorHidden) {
      this.outputStream.write('\x1b[?25l');
      this.cursorHidden = true;
    }
  }

  showCursor() {
    const isDumb = process.env.TERM === 'dumb';
    const noColor = 'NO_COLOR' in process.env;
    if (!isDumb && !noColor && this.cursorHidden) {
      this.outputStream.write('\x1b[?25h');
      this.cursorHidden = false;
    }
  }

  glitchTransition(newState, semanticDetails = '') {
    const oldState = this.currentState;
    this.currentState = newState;

    if (this.reducedMotion) {
      const statusLine = `[BROTHER STATE: ${newState}]${semanticDetails ? ' ' + semanticDetails : ''}`;
      this.outputStream.write(`/// ${statusLine}\n`);
      this.currentLineLength = 0;
      return;
    }

    this.hideCursor();
    const frame = `⚡ [BROTHER // ${oldState} ➔ ${newState}] ${semanticDetails}`.trim();
    this.animationFrames.push(frame);
    this.outputStream.write(magenta('/// ') + yellow(frame) + '\n');
    this.currentLineLength = 0;
    this.showCursor();
  }

  printHeader() {
    this.glitchTransition('CONNECTED', 'Brother Companion Interface Ready (Port 8725)');
  }

  printDelta(text) {
    if (!text) return;
    let out = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '\n') {
        this.currentLineLength = 0;
        out += char;
      } else {
        if (this.currentLineLength >= this.width) {
          out += '\n';
          this.currentLineLength = 0;
        }
        out += char;
        this.currentLineLength++;
      }
    }
    this.outputStream.write(white(out));
  }

  handleEvent(ev) {
    switch (ev.type) {
      case 'turn.started':
        this.glitchTransition('THINKING', 'Agent evaluating input frame...');
        break;
      case 'message.appended':
        if (this.currentState !== 'STREAMING') {
          this.glitchTransition('STREAMING', 'Receiving agent register output...');
        }
        if (ev.data?.messageDelta) {
          this.printDelta(ev.data.messageDelta);
          this.printedLength += ev.data.messageDelta.length;
        }
        break;
      case 'message.completed':
        if (ev.data?.message) {
          const newPart = ev.data.message.slice(this.printedLength);
          if (newPart) {
            this.printDelta(newPart);
          }
          this.outputStream.write('\n');
          this.printedLength = 0;
          this.currentLineLength = 0;
        } else {
          this.outputStream.write('\n');
          this.printedLength = 0;
          this.currentLineLength = 0;
        }
        break;
      case 'actions.requested': {
        const actionNames = (ev.data?.actions || []).map(a => a.toolName || a.name || a.kind || 'unknown');
        this.glitchTransition('EXECUTING', `Running tools: ${actionNames.join(', ')}`);
        break;
      }
      case 'action.result': {
        const resName = ev.data?.result?.toolName || ev.data?.result?.subagentName || ev.data?.result?.name || ev.data?.result?.kind || ev.data?.action?.toolName || ev.data?.action?.name || ev.data?.action?.kind || 'unknown';
        const status = ev.data?.status === 'failed' ? 'FAILED' : 'OK';
        this.glitchTransition('EXECUTING', `Tool result [${status}]: ${resName}`);
        break;
      }
      case 'input.requested':
        this.glitchTransition('WAITING_INPUT', 'Interactive prompt approval requested');
        break;
      case 'step.failed':
      case 'turn.failed':
      case 'session.failed':
        this.glitchTransition('ERROR', `${ev.type} ${ev.data?.code || ''} ${ev.data?.message || ''}`.trim());
        break;
      case 'turn.cancelled':
        this.glitchTransition('CANCELLED', 'Turn execution interrupted');
        break;
      case 'turn.completed':
      case 'session.completed':
        this.printedLength = 0;
        this.currentLineLength = 0;
        this.glitchTransition('IDLE', 'Turn completed successfully');
        break;
      case 'reasoning.appended':
      case 'reasoning.completed':
        break;
    }
  }

  cleanup() {
    if (this.cleanedUp) return;
    this.cleanedUp = true;
    if (this.sigwinchEmitter && typeof this.sigwinchEmitter.off === 'function') {
      this.sigwinchEmitter.off('SIGWINCH', this.onResize);
    }
    if (this.rl && typeof this.rl.close === 'function') {
      this.rl.close();
    }
    const isDumb = process.env.TERM === 'dumb';
    const noColor = 'NO_COLOR' in process.env;
    if (!isDumb && !noColor) {
      if (this.cursorHidden) {
        this.outputStream.write('\x1b[?25h');
        this.cursorHidden = false;
      }
      this.outputStream.write('\x1b[0m');
    }
  }
}

export class SendGuard {
  constructor() {
    this.isSending = false;
  }
  acquire() {
    if (this.isSending) throw new Error('Overlapping send rejected');
    this.isSending = true;
  }
  release() {
    this.isSending = false;
  }
}

export async function executeBrotherTurn(ui, session, input, guard, abortController) {
  guard.acquire();
  try {
    const response = await session.send({ message: input, signal: abortController.signal });
    for await (const ev of response) {
      if (ev.type.startsWith('reasoning.')) continue;
      ui.handleEvent(ev);
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      ui.handleEvent({ type: 'turn.cancelled' });
    } else {
      ui.handleEvent({ type: 'session.failed', data: { message: e.message } });
    }
  } finally {
    guard.release();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const reducedMotion = isReducedMotion(args, process.env);

  const ui = new BrotherTerminalUI(process.stdin, process.stdout, process, { reducedMotion });
  ui.printHeader();

  const cleanupAndExit = (code = 0) => {
    if (ui) ui.cleanup();
    process.exit(code);
  };

  let abortController = null;

  process.on('SIGINT', () => {
    if (abortController) {
      abortController.abort();
    } else {
      cleanupAndExit(0);
    }
  });

  process.on('SIGTERM', () => {
    cleanupAndExit(0);
  });

  const req = createRequire(new URL('../../package.json', import.meta.url));
  const { Client } = await import(req.resolve('eve/client'));

  const host = process.env.ASSISTANT_HOST || 'http://127.0.0.1:8725';
  const client = new Client({
    host,
    preserveCompletedSessions: true,
  });

  const session = await client.session({
    preserveCompletedSessions: true,
  });

  const guard = new SendGuard();

  while (true) {
    const input = await ui.prompt();
    if (input === ui.EOF) {
      break;
    }
    if (!input || !input.trim()) continue;

    abortController = new AbortController();
    await executeBrotherTurn(ui, session, input, guard, abortController);
    abortController = null;
  }

  cleanupAndExit(0);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((e) => {
    process.exitCode = 1;
  });
}
