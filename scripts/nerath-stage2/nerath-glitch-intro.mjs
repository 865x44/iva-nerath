import process from 'process';

const isTTY = process.stdout.isTTY;
const isDumb = process.env.TERM === 'dumb';
const noColor = 'NO_COLOR' in process.env;
const noGlitch = process.env.NERATH_NO_GLITCH === '1';

if (!isTTY || isDumb || noColor || noGlitch) {
  process.exit(0);
}

const ESC = '\x1b';
const HIDE_CURSOR = `${ESC}[?25l`;
const SHOW_CURSOR = `${ESC}[?25h`;
const RESET = `${ESC}[0m`;
const CYAN = `${ESC}[38;5;51m`;
const MAGENTA = `${ESC}[38;5;199m`;
const WHITE = `${ESC}[38;5;231m`;
const BOLD = `${ESC}[1m`;
const CLEAR_LINE = `${ESC}[2K`;
const CR = '\r';

let cleanedUp = false;
function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  try {
    process.stdout.write(SHOW_CURSOR + RESET);
  } catch (e) {}
}

process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });
process.on('uncaughtException', () => { cleanup(); process.exit(1); });
process.on('exit', cleanup);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  try {
    process.stdout.write(HIDE_CURSOR);
    
    const frames = [
      `${CLEAR_LINE}${CR}${CYAN}SEQ 0x4A ${WHITE}:: ${MAGENTA}SYNC${RESET}`,
      `${CLEAR_LINE}${CR}${MAGENTA}SEQ 0x4B ${WHITE}:: ${CYAN}SYN${RESET}`,
      `${CLEAR_LINE}${CR}${CYAN}SEQ 0x4C ${WHITE}:: ${WHITE}LOCK${RESET}`,
      `${CLEAR_LINE}${CR}${BOLD}${WHITE}N E R A T H ${CYAN}/// ${MAGENTA}ONLINE${RESET}\n`
    ];

    for (let i = 0; i < frames.length - 1; i++) {
      process.stdout.write(frames[i]);
      await sleep(150);
    }
    process.stdout.write(frames[frames.length - 1]);
    cleanup();
  } catch (e) {
    cleanup();
    process.exit(1);
  }
}

main();
