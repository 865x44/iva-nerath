#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

const PRODUCTION_VAULT = '/home/alx/projects/iva/vault';
const PRODUCTION_DATA = '/home/alx/projects/iva/data';
const PRODUCTION_PORT = '8723';

let errors = 0;

function check(name, condition, message) {
  if (!condition) {
    console.error(`❌ ${name}: ${message}`);
    errors++;
  } else {
    console.log(`✅ ${name}`);
  }
}

// Check nerath-chat launcher
const nerathChat = fs.readFileSync('/home/alx/.local/bin/nerath-chat', 'utf8');
check('nerath-chat: absolute vault', nerathChat.includes('DOGFOOD_ROOT='), 'Uses DOGFOOD_ROOT variable');
check('nerath-chat: no production vault', !nerathChat.includes(PRODUCTION_VAULT), 'Does not reference production vault');
check('nerath-chat: fail-closed check', nerathChat.includes('FATAL: dogfood vault cannot be production vault'), 'Has fail-closed guard');

// Check brother-chat launcher
const brotherChat = fs.readFileSync('/home/alx/.local/bin/brother-chat', 'utf8');
check('brother-chat: absolute paths', brotherChat.includes('BROTHER_ROOT='), 'Uses BROTHER_ROOT variable');
check('brother-chat: no production vault', !brotherChat.includes(PRODUCTION_VAULT), 'Does not reference production vault');

// Check rollup.ts (anchored to this script's dir — cwd-independent)
const rollup = fs.readFileSync(path.join(SCRIPT_DIR, 'memory/rollup.ts'), 'utf8');
check('rollup: dogfood guard', rollup.includes('DOGFOOD_MODE'), 'Has DOGFOOD_MODE guard');

// Summary
console.log('');
if (errors === 0) {
  console.log('✅ All isolation checks passed');
  process.exit(0);
} else {
  console.error(`❌ ${errors} isolation check(s) failed`);
  process.exit(1);
}
