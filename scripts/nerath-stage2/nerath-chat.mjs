import { TerminalUI, handleInputRequest, EOF } from './terminal-ui.mjs';
import { createRequire } from 'node:module';
import { readFileSync, writeSync } from 'node:fs';

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
  const client = new Client({ host: 'http://127.0.0.1:8724', preserveCompletedSessions: true });
  session = client.session();

  const guard = new SendGuard();

  while (true) {
    const input = await ui.prompt();
    if (input === ui.EOF) {
      break;
    }
    if (!input) continue;

    abortController = new AbortController();
    await executeTurn(ui, session, input, guard, abortController);
    abortController = null;
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
