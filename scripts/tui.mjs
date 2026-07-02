#!/usr/bin/env node
// Iva TUI v2 — Terminal User Interface
// Chat + Vault Browser + Status Screen

import blessed from 'blessed';
import { Client } from 'eve/client';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PORT = process.env.IVA_PORT ?? '8723';
const HOST = process.env.ASSISTANT_HOST ?? `http://127.0.0.1:${PORT}`;
const VAULT_PATH = process.env.IVA_VAULT ?? './vault';

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'Iva TUI',
});

// Create client
const client = new Client({ host: HOST });
const session = client.session();

// State
let currentScreen = 0; // 0=chat, 1=vault, 2=status
let isOnline = false;
let messages = [];
let vaultFiles = [];
let selectedVaultFile = 0;

// === CHAT SCREEN ===
const chatBox = blessed.box({
  top: 1,
  left: 0,
  width: '100%',
  height: '100%-3',
  label: ' Chat ',
  border: { type: 'line' },
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true,
  scrollbar: { ch: ' ', track: { bg: 'cyan' }, style: { inverse: true } },
});

const chatInput = blessed.textbox({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 3,
  label: ' Input ',
  border: { type: 'line' },
  inputOnFocus: true,
});

const statusBar = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 1,
  style: { bg: 'blue', fg: 'white' },
  content: ' [Tab] switch │ [q] quit │ [?] help',
});

// === VAULT SCREEN ===
const vaultList = blessed.list({
  top: 1,
  left: 0,
  width: '30%',
  height: '100%-1',
  label: ' Files ',
  border: { type: 'line' },
  keys: true,
  vi: true,
  mouse: true,
  style: {
    selected: { bg: 'blue', fg: 'white' },
    item: { bg: 'black', fg: 'white' },
  },
});

const vaultPreview = blessed.box({
  top: 1,
  left: '30%',
  width: '70%',
  height: '100%-1',
  label: ' Preview ',
  border: { type: 'line' },
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true,
  scrollbar: { ch: ' ', track: { bg: 'cyan' }, style: { inverse: true } },
});

// === STATUS SCREEN ===
const statusBox = blessed.box({
  top: 1,
  left: 0,
  width: '100%',
  height: '100%-1',
  label: ' Status ',
  border: { type: 'line' },
  content: 'Loading...',
});

// Add all elements to screen
screen.append(statusBar);
screen.append(chatBox);
screen.append(chatInput);
screen.append(vaultList);
screen.append(vaultPreview);
screen.append(statusBox);

// Hide non-chat screens initially
vaultList.hide();
vaultPreview.hide();
statusBox.hide();

// === FUNCTIONS ===

function updateStatusBar() {
  const mode = isOnline ? '● online' : '○ offline';
  const screens = ['Chat', 'Vault', 'Status'];
  statusBar.setContent(` ${mode} │ ${screens[currentScreen]} │ [Tab] switch │ [q] quit │ [?] help`);
  screen.render();
}

async function checkHealth() {
  try {
    await client.health();
    isOnline = true;
  } catch {
    isOnline = false;
  }
  updateStatusBar();
}

function addMessage(role, text) {
  messages.push({ role, text });
  const content = messages.map(m => `${m.role}: ${m.text}`).join('\n\n');
  chatBox.setContent(content);
  chatBox.setScrollPerc(100);
  screen.render();
}

async function sendMessage(text) {
  if (!text.trim()) return;
  
  addMessage('you', text);
  
  if (!isOnline) {
    addMessage('iva', '[offline] Agent unreachable. Check vault for context.');
    return;
  }
  
  try {
    const response = await session.send(text);
    let fullResponse = '';
    
    for await (const event of response) {
      if (event.type === 'message.appended') {
        fullResponse += event.data.messageDelta;
      }
      if (event.type === 'message.completed' && event.data.finishReason !== 'tool-calls') {
        if (!fullResponse && event.data.message) {
          fullResponse = event.data.message;
        }
      }
    }
    
    addMessage('iva', fullResponse || '[no response]');
  } catch (e) {
    addMessage('iva', `[error] ${e.message}`);
  }
}

function loadVaultFiles() {
  vaultFiles = [];
  
  const dirs = ['daily', 'weekly', 'monthly', 'yearly'];
  for (const dir of dirs) {
    const path = join(VAULT_PATH, dir);
    if (existsSync(path)) {
      const files = readdirSync(path).filter(f => f.endsWith('.md'));
      for (const file of files) {
        vaultFiles.push({ path: join(dir, file), name: file });
      }
    }
  }
  
  // Add root files
  const rootFiles = ['CORE.md', 'MOC.md'];
  for (const file of rootFiles) {
    if (existsSync(join(VAULT_PATH, file))) {
      vaultFiles.push({ path: file, name: file });
    }
  }
  
  vaultList.setItems(vaultFiles.map(f => f.name));
  screen.render();
}

function showVaultPreview(index) {
  if (index < 0 || index >= vaultFiles.length) {
    vaultPreview.setContent('');
    screen.render();
    return;
  }
  
  const file = vaultFiles[index];
  const fullPath = join(VAULT_PATH, file.path);
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    vaultPreview.setContent(content);
    vaultPreview.setScrollPerc(0);
  } catch (e) {
    vaultPreview.setContent(`[error] ${e.message}`);
  }
  screen.render();
}

function updateStatusScreen() {
  const lines = [
    `Agent: ${isOnline ? '● connected' : '○ disconnected'} (${HOST})`,
    `Vault: ${VAULT_PATH}`,
    `Files: ${vaultFiles.length} notes`,
    ``,
    `Health check: ${new Date().toLocaleTimeString()}`,
    ``,
    `Press [Tab] to switch screens`,
    `Press [q] to quit`,
  ];
  statusBox.setContent(lines.join('\n'));
  screen.render();
}

function switchScreen(index) {
  currentScreen = index;
  
  // Hide all
  chatBox.hide();
  chatInput.hide();
  vaultList.hide();
  vaultPreview.hide();
  statusBox.hide();
  
  // Show current
  if (index === 0) {
    chatBox.show();
    chatInput.show();
    chatInput.focus();
  } else if (index === 1) {
    vaultList.show();
    vaultPreview.show();
    vaultList.focus();
    showVaultPreview(vaultList.selected);
  } else if (index === 2) {
    statusBox.show();
    updateStatusScreen();
  }
  
  updateStatusBar();
}

// === KEY BINDINGS ===

screen.key(['C-q', 'C-c'], () => {
  screen.destroy();
  process.exit(0);
});

screen.key(['tab'], () => {
  switchScreen((currentScreen + 1) % 3);
});

screen.key(['?'], () => {
  const help = blessed.message(
    'Help',
    'Tab: switch screen\nq: quit\n?: help\n\nChat: Enter to send\nVault: j/k navigate, Enter to open',
    ['OK'],
    () => {}
  );
  screen.append(help);
});

chatInput.key('enter', () => {
  const text = chatInput.getValue();
  chatInput.clearValue();
  sendMessage(text);
  chatInput.focus();
});

vaultList.on('select', (item, index) => {
  showVaultPreview(index);
});

vaultList.on('select item', (item, index) => {
  showVaultPreview(index);
});

// === INIT ===

async function init() {
  await checkHealth();
  loadVaultFiles();
  switchScreen(0);
  
  // Health check every 30s
  setInterval(checkHealth, 30000);
  
  addMessage('iva', 'Welcome to Iva TUI. Press [?] for help.');
}

init().catch(e => {
  console.error('TUI init error:', e);
  process.exit(1);
});

screen.render();
