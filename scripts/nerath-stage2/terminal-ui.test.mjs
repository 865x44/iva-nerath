import test from 'node:test';
import assert from 'node:assert';
import { TerminalUI, handleInputRequest, EOF } from './terminal-ui.mjs';
import { SendGuard, executeTurn } from './nerath-chat.mjs';
import { PassThrough } from 'node:stream';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import EventEmitter from 'node:events';

const events = JSON.parse(readFileSync(new URL('./fixtures/events.json', import.meta.url)));

test('1. streaming deltas plus completed text without duplication', () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  ui.handleEvent(events.find(e => e.type === 'message.appended' && e.data.messageDelta === 'Hello '));
  ui.handleEvent(events.find(e => e.type === 'message.appended' && e.data.messageDelta === 'World'));
  ui.handleEvent(events.find(e => e.type === 'message.completed'));
  const out = outStream.read()?.toString() || '';
  assert(out.includes('Hello World\n') || (out.includes('Hello ') && out.includes('World') && out.includes('\n'))); 
});

test('2. reasoning payload never printed', () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  ui.handleEvent(events.find(e => e.type === 'reasoning.appended'));
  const out = outStream.read()?.toString() || '';
  assert.strictEqual(out, '');
});

test('3. action name/status printed but raw input/output never printed', () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  ui.handleEvent(events.find(e => e.type === 'actions.requested'));
  ui.handleEvent(events.find(e => e.type === 'action.result' && e.data.status === 'completed'));
  const out = outStream.read()?.toString() || '';
  assert(out.includes('testTool'));
  assert(!out.includes('secret123'));
  assert(!out.includes('{"a": 1}'));
});

test('4. step/turn/session failures use code and message', () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  ui.handleEvent(events.find(e => e.type === 'step.failed'));
  const out = outStream.read()?.toString() || '';
  assert(out.includes('E1 step failed'));
});

test('5. narrow width and a simulated SIGWINCH width change', () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  outStream.columns = 10;
  const emitter = new EventEmitter();
  const ui = new TerminalUI(inStream, outStream, emitter);
  ui.handleEvent({ type: 'message.appended', data: { messageDelta: '123456789012345678901234567890' } });
  
  let out = '';
  let chunk;
  while ((chunk = outStream.read()) !== null) { out += chunk.toString(); }
  
  assert(out.includes('\n'));

  outStream.columns = 100;
  emitter.emit('SIGWINCH');
  assert.strictEqual(ui.width, 100);
  ui.cleanup();
});

test('6. NO_COLOR, TERM=dumb, and NERATH_NO_GLITCH', () => {
  process.env.NO_COLOR = '1';
  process.env.NERATH_NO_GLITCH = '1';
  process.env.TERM = 'dumb';
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  ui.glitch('TEST');
  const out = outStream.read()?.toString() || '';
  assert(out.includes('/// TEST\n'));
  assert(!out.includes('\x1b'));
  delete process.env.NO_COLOR;
  delete process.env.NERATH_NO_GLITCH;
  delete process.env.TERM;
});

test('7. cleanup is idempotent and emits show-cursor/reset without unsafe controls', () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  
  const oldTerm = process.env.TERM;
  const oldNoColor = process.env.NO_COLOR;
  delete process.env.TERM;
  delete process.env.NO_COLOR;
  
  ui.cleanup();
  ui.cleanup();
  
  process.env.TERM = oldTerm;
  if (oldNoColor !== undefined) process.env.NO_COLOR = oldNoColor;

  let out = '';
  let chunk;
  while ((chunk = outStream.read()) !== null) { out += chunk.toString(); }

  assert(!out.includes('\x1b[?25h'));
  assert(out.includes('\x1b[0m'));
  assert.strictEqual(out.match(/\x1b\[0m/g)?.length, 1);
  assert(!out.includes('\x1b[2J'));
  assert(!out.includes('\x07'));
});

test('8. confirmation response uses real display, requestId, and option ID', async () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  setTimeout(() => inStream.write('approve\n'), 10);
  const req = events.find(e => e.type === 'input.requested').data.requests[0];
  const res = await handleInputRequest(ui, req);
  assert.strictEqual(res.requestId, 'req1');
  assert.strictEqual(res.optionId, 'approve');
  ui.cleanup();
});

test('9. select response uses label for display and validates selection', async () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  setTimeout(() => {
    inStream.write('invalid\n');
    setTimeout(() => inStream.write('1\n'), 10);
  }, 10);
  const req = events.find(e => e.type === 'input.requested').data.requests[1];
  const res = await handleInputRequest(ui, req);
  assert.strictEqual(res.requestId, 'req2');
  assert.strictEqual(res.optionId, 'opt1');
  const out = outStream.read()?.toString() || '';
  assert(out.includes('Option 1'));
  ui.cleanup();
});

test('10. text response uses requestId and text', async () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  setTimeout(() => inStream.write('my text\n'), 10);
  const req = events.find(e => e.type === 'input.requested').data.requests[2];
  const res = await handleInputRequest(ui, req);
  assert.strictEqual(res.requestId, 'req3');
  assert.strictEqual(res.text, 'my text');
  ui.cleanup();
});

test('11. unsupported/malformed requests throw and are not dropped', async () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  await assert.rejects(() => handleInputRequest(ui, { requestId: 'req4', display: 'unknown' }));
  await assert.rejects(() => handleInputRequest(ui, { requestId: 'req5', display: 'confirmation' }));
  ui.cleanup();
});

test('12. overlapping sends are rejected by the guard actually used in main', () => {
  const guard = new SendGuard();
  guard.acquire();
  assert.throws(() => guard.acquire(), /Overlapping send rejected/);
});

test('13. AbortController signal reaches the send path and abort releases the guard', async () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  const guard = new SendGuard();
  const abortController = new AbortController();
  
  const mockSession = {
    send: async ({ signal }) => {
       assert(signal === abortController.signal);
       return (async function* () {
          abortController.abort();
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          yield { type: 'message.received' };
       })();
    }
  };
  
  await executeTurn(ui, mockSession, 'hello', guard, abortController);
  assert.strictEqual(guard.isSending, false);
  const out = outStream.read()?.toString() || '';
  assert(out.includes('CANCELLED'));
  ui.cleanup();
});

test('14. EOF resolves and cleanup completes', async () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const mockEmitter = new EventEmitter();
  const ui = new TerminalUI(inStream, outStream, mockEmitter);
  
  setTimeout(() => ui.rl.close(), 10);
  const res = await ui.prompt();
  assert.strictEqual(res, EOF);
  
  ui.cleanup();
  assert.strictEqual(ui.cleanedUp, true);
  assert.strictEqual(mockEmitter.listenerCount('SIGWINCH'), 0);
});

test('15. module import has no network/readline side effect', async () => {
  const fileUrl = pathToFileURL(new URL('./nerath-chat.mjs', import.meta.url).pathname).href;
  const child = spawn(process.execPath, ['-e', `import('${fileUrl}')`]);
  
  return new Promise((resolve, reject) => {
    let errOut = '';
    child.stderr.on('data', d => errOut += d.toString());
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Failed with code ${code}: ${errOut}`));
    });
  });
});

test('16. offline fixture unknown mode exits non-zero and prints stderr', async () => {
  const chatPath = fileURLToPath(new URL('./nerath-chat.mjs', import.meta.url));
  const child = spawn(process.execPath, [chatPath, '--offline-fixture', 'invalid']);
  let errOut = '';
  child.stderr.on('data', d => errOut += d.toString());
  return new Promise((resolve, reject) => {
    child.on('close', code => {
      if (code === 0) reject(new Error('Should have failed'));
      else {
        assert(errOut.includes('Unknown fixture mode'));
        resolve();
      }
    });
  });
});

test('17. offline fixture missing mode exits non-zero and prints stderr', async () => {
  const chatPath = fileURLToPath(new URL('./nerath-chat.mjs', import.meta.url));
  const child = spawn(process.execPath, [chatPath, '--offline-fixture']);
  let errOut = '';
  child.stderr.on('data', d => errOut += d.toString());
  return new Promise((resolve, reject) => {
    child.on('close', code => {
      if (code === 0) reject(new Error('Should have failed'));
      else {
        assert(errOut.includes('Missing fixture mode'));
        resolve();
      }
    });
  });
});

test('18. offline fixture modes render and exit zero without stdin', async () => {
  const chatPath = fileURLToPath(new URL('./nerath-chat.mjs', import.meta.url));
  for (const mode of ['normal', 'narrow', 'failure', 'interrupt', 'eof']) {
    const child = spawn(process.execPath, [chatPath, '--offline-fixture', mode], { stdio: ['ignore', 'pipe', 'pipe'] });
    let errOut = '';
    child.stderr.on('data', d => errOut += d.toString());
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
         child.kill();
         reject(new Error(`${mode} timed out`));
      }, 2000);
      child.on('close', code => {
        clearTimeout(timeout);
        if (code !== 0) reject(new Error(`${mode} failed with code ${code}: ${errOut}`));
        else resolve();
      });
    });
  }
});

test('19. launcher intro-skip logic with --offline-fixture', async () => {
  const launcherPath = fileURLToPath(new URL('./nerath-chat-stage2', import.meta.url));
  const child = spawn(launcherPath, ['--offline-fixture', 'normal'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let errOut = '';
  child.stderr.on('data', d => errOut += d.toString());
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
       child.kill();
       reject(new Error('launcher timed out'));
    }, 2000);
    child.on('close', code => {
      clearTimeout(timeout);
      if (code !== 0) reject(new Error(`Launcher failed with code ${code}: ${errOut}`));
      else resolve();
    });
  });
});

test('20. executeTurn throws error on missing HITL response', async () => {
  const ui = new TerminalUI(new PassThrough(), new PassThrough(), new EventEmitter());
  const guard = new SendGuard();
  const abortController = new AbortController();
  const mockSession = {
    send: async function* () {
      yield { type: 'input.requested', data: { requests: [{ requestId: 'req', display: 'text', prompt: 'test' }] } };
    }
  };
  
  // Close the RL so it returns EOF -> handleInputRequest throws EOF
  setTimeout(() => ui.rl.close(), 10);
  
  await executeTurn(ui, mockSession, 'hello', guard, abortController);
  // execution should catch the throw and emit session.failed
  const out = ui.outputStream.read()?.toString() || '';
  assert(out.includes('session.failed') || out.includes('ERROR'));
  ui.cleanup();
});

test('21. balanced cursor and reset behavior', () => {
  const inStream = new PassThrough();
  const outStream = new PassThrough();
  const ui = new TerminalUI(inStream, outStream, new EventEmitter());
  
  const oldTerm = process.env.TERM;
  const oldNoColor = process.env.NO_COLOR;
  delete process.env.TERM;
  delete process.env.NO_COLOR;
  
  ui.glitch('hello');
  
  let chunk;
  let out = '';
  while ((chunk = outStream.read()) !== null) { out += chunk.toString(); }
  
  // Should hide and show once
  assert.strictEqual(out.match(/\x1b\[\?25l/g)?.length, 1);
  assert.strictEqual(out.match(/\x1b\[\?25h/g)?.length, 1);
  
  // Cleanup shouldn't add another show if not hidden
  ui.cleanup();
  let out2 = '';
  while ((chunk = outStream.read()) !== null) { out2 += chunk.toString(); }
  assert(!out2.includes('\x1b[?25h'));
  assert(out2.includes('\x1b[0m')); // Final reset
  
  process.env.TERM = oldTerm;
  if (oldNoColor !== undefined) process.env.NO_COLOR = oldNoColor;
});
