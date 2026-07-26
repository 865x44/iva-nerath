import test from "node:test";
import assert from "node:assert/strict";
import { Writable, Readable } from "node:stream";
import EventEmitter from "node:events";

import {
  BrotherTerminalUI,
  isReducedMotion,
} from "../scripts/brother-stage2/brother-chat.mjs";

test("Glitch TUI helper: isReducedMotion detects flag and env vars correctly", () => {
  assert.equal(isReducedMotion(["--reduced-motion"], {}), true, "--reduced-motion flag detected");
  assert.equal(isReducedMotion([], { REDUCED_MOTION: "1" }), true, "REDUCED_MOTION=1 detected");
  assert.equal(isReducedMotion([], { REDUCED_MOTION: "true" }), true, "REDUCED_MOTION=true detected");
  assert.equal(isReducedMotion([], { TERM: "dumb" }), true, "TERM=dumb detected");
  assert.equal(isReducedMotion([], { NO_COLOR: "" }), true, "NO_COLOR detected");
  assert.equal(isReducedMotion([], {}), false, "normal motion default");
});

test("Glitch TUI: reduced-motion path produces static status line and zero animation frames", () => {
  let outputData = "";
  const mockOut = new Writable({
    write(chunk, encoding, callback) {
      outputData += chunk.toString();
      callback();
    },
  });
  const mockIn = new Readable({
    read() {},
  });
  const mockEmitter = new EventEmitter();

  const ui = new BrotherTerminalUI(mockIn, mockOut, mockEmitter, { reducedMotion: true });

  ui.glitchTransition("THINKING", "Processing query...");

  assert.equal(ui.animationFrames.length, 0, "reduced motion produces 0 animation frames in frames array");
  assert.ok(outputData.includes("[BROTHER STATE: THINKING] Processing query..."), "reduced motion outputs static status line");
  assert.ok(outputData.startsWith("/// "), "reduced motion uses glitch indicator line prefix");

  ui.cleanup();
});

test("Glitch TUI: cleanup restores terminal state and releases listeners", () => {
  let outputData = "";
  const mockOut = new Writable({
    write(chunk, encoding, callback) {
      outputData += chunk.toString();
      callback();
    },
  });
  const mockIn = new Readable({
    read() {},
  });
  const mockEmitter = new EventEmitter();

  const ui = new BrotherTerminalUI(mockIn, mockOut, mockEmitter, { reducedMotion: false });

  assert.equal(ui.cleanedUp, false, "starts not cleaned up");
  assert.equal(mockEmitter.listenerCount("SIGWINCH"), 1, "SIGWINCH listener attached");

  ui.cleanup();

  assert.equal(ui.cleanedUp, true, "cleanedUp set to true");
  assert.equal(mockEmitter.listenerCount("SIGWINCH"), 0, "SIGWINCH listener detached");

  // Re-calling cleanup is idempotent
  assert.doesNotThrow(() => {
    ui.cleanup();
  }, "calling cleanup twice does not throw");
});
