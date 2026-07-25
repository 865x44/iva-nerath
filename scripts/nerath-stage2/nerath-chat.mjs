import { TerminalUI, handleInputRequest, EOF } from './terminal-ui.mjs';
import { createRequire } from 'node:module';
import { readFileSync, writeSync } from 'node:fs';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(
  process.env.ASSISTANT_DATA_DIR || 'data',
  'nerath-cli-session.json'
);

function loadSessionState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(raw);
    if (!state.sessionId || !state.continuationToken) {
      console.log('⚠️  Invalid session state, starting fresh');
      return null;
    }
    return state;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('⚠️  Failed to load session state:', err.message);
    }
    return null;
  }
}

function saveSessionState(state) {
  try {
    const tmp = STATE_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, STATE_FILE);
  } catch (err) {
    console.error('⚠️  Failed to save session state:', err.message);
  }
}

function archiveCorruptedState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = STATE_FILE + `.corrupted-${timestamp}`;
      fs.renameSync(STATE_FILE, archivePath);
      console.log(`📦 Archived corrupted state to ${archivePath}`);
    }
  } catch (err) {
    console.error('⚠️  Failed to archive corrupted state:', err.message);
  }
}

let ui = null;
let abortController = null;

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

export async function executeTurn(ui, session, input, guard, abortController) {
  guard.acquire();
  try {
    const response = await session.send({ message: input, signal: abortController.signal });
    let inputRequests = [];
    for await (const ev of response) {
      if (ev.type.startsWith('reasoning.')) continue;
      ui.handleEvent(ev);
      if (ev.type === 'input.requested') {
        inputRequests = ev.data.requests || [];
      }
    }

    while (inputRequests.length > 0) {
      const reqItem = inputRequests.shift();
      const inputResponse = await handleInputRequest(ui, reqItem);
      if (!inputResponse) {
        throw new Error('Input response missing');
      }

      const followup = await session.send({ inputResponses: [inputResponse], signal: abortController.signal });
      for await (const ev of followup) {
         if (ev.type.startsWith('reasoning.')) continue;
         ui.handleEvent(ev);
         if (ev.type === 'input.requested') {
           inputRequests = ev.data.requests || [];
         }
      }
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
  const fixtureIdx = args.indexOf('--offline-fixture');
  let fixtureMode = null;
  if (fixtureIdx !== -1 && fixtureIdx + 1 < args.length) {
    fixtureMode = args[fixtureIdx + 1];
  } else if (fixtureIdx !== -1) {
    writeSync(2, 'Missing fixture mode\n');
    process.exitCode = 1;
    return;
  }

  if (fixtureMode && !['normal', 'narrow', 'failure', 'interrupt', 'eof'].includes(fixtureMode)) {
    writeSync(2, `Unknown fixture mode: ${fixtureMode}\n`);
    process.exitCode = 1;
    return;
  }

  ui = new TerminalUI(process.stdin, process.stdout);
  ui.printHeader();

  if (fixtureMode === 'narrow') {
     ui.width = 10;
  }

  const cleanupAndExit = (code = 0) => {
    if (ui) ui.cleanup();
    process.exit(code);
  };

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

  let session;
  if (fixtureMode) {
    const eventsPath = new URL('./fixtures/events.json', import.meta.url);
    const events = JSON.parse(readFileSync(eventsPath, 'utf8'));

    if (fixtureMode === 'interrupt') {
      setTimeout(() => { abortController = new AbortController(); process.emit('SIGINT'); }, 20);
    }

    let toYield = events;
    if (fixtureMode === 'failure') {
      toYield = events.filter(e => e.type.includes('fail'));
    } else if (fixtureMode === 'eof') {
      toYield = [];
    }

    try {
      for (const ev of toYield) {
        if (fixtureMode === 'interrupt' && abortController?.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }
        if (ev.type.startsWith('reasoning.')) continue;
        ui.handleEvent(ev);
        await new Promise(r => setTimeout(r, 5));
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        ui.handleEvent({ type: 'turn.cancelled' });
      } else {
        ui.handleEvent({ type: 'session.failed', data: { message: e.message } });
      }
    }

    cleanupAndExit(0);
    return;
  }

  const req = createRequire(new URL('../../package.json', import.meta.url));
  const { Client } = await import(req.resolve('eve/client'));

  const isFresh = args.includes('--fresh');
  let sessionState = null;
  if (!isFresh) {
    sessionState = loadSessionState();
    if (sessionState) {
      console.log(`🔄 Resuming session ${sessionState.sessionId}...`);
    } else {
      console.log('🆕 Starting new session...');
    }
  } else {
    console.log('🆕 Starting fresh session (--fresh flag)...');
  }

  const client = new Client({
    host: process.env.ASSISTANT_HOST || 'http://127.0.0.1:8724',
    preserveCompletedSessions: true
  });

  try {
    if (sessionState && !isFresh) {
      session = await client.session({
        state: sessionState,
        preserveCompletedSessions: true,
      });
    } else {
      session = await client.session({
        preserveCompletedSessions: true,
      });
    }
  } catch (err) {
    if (sessionState && err.message.includes('token')) {
      console.log('⚠️  Session token expired, starting fresh...');
      archiveCorruptedState();
      session = await client.session({
        preserveCompletedSessions: true,
      });
    } else {
      throw err;
    }
  }

  const guard = new SendGuard();

  while (true) {
    const input = await ui.prompt();
    if (input === ui.EOF) {
      break;
    }
    if (!input) continue;

    if (input.trim() === '/new') {
      console.log('🆕 Starting new session...');
      if (fs.existsSync(STATE_FILE)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const archivePath = STATE_FILE + `.archived-${timestamp}`;
        fs.renameSync(STATE_FILE, archivePath);
        console.log(`📦 Archived session to ${archivePath}`);
      }
      session = await client.session({
        preserveCompletedSessions: true,
      });
      continue;
    }

    abortController = new AbortController();
    await executeTurn(ui, session, input, guard, abortController);
    abortController = null;

    if (session.state && session.state.continuationToken) {
      saveSessionState({
        sessionId: session.state.sessionId,
        continuationToken: session.state.continuationToken,
        streamIndex: session.state.streamIndex,
        timestamp: new Date().toISOString(),
        candidateSHA: process.env.CANDIDATE_SHA || 'unknown',
      });
    }
  }

  cleanupAndExit(0);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((e) => {
    if (ui && !ui.cleanedUp) {
      ui.handleEvent({ type: 'session.failed', data: { message: e.message } });
      ui.cleanup();
    } else if (ui) {
      ui.cleanup();
    }
    process.exitCode = 1;
  });
}
