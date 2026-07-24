import readline from 'node:readline';

const color = (code) => (str) => {
  const isDumb = process.env.TERM === 'dumb';
  const noColor = 'NO_COLOR' in process.env;
  return (isDumb || noColor) ? str : `\x1b[${code}m${str}\x1b[0m`;
};
const cyan = color('38;5;51');
const magenta = color('38;5;199');
const white = color('38;5;231');

export const EOF = Symbol('EOF');

export class TerminalUI {
  constructor(inputStream = process.stdin, outputStream = process.stdout, sigwinchEmitter = process) {
    this.inputStream = inputStream;
    this.outputStream = outputStream;
    this.rl = readline.createInterface({ input: inputStream, output: outputStream });
    this.printedLength = 0;
    this.currentLineLength = 0;
    this.cleanedUp = false;
    this.cursorHidden = false;
    this.width = Math.max(this.outputStream.columns || 80, 20);
    this.EOF = EOF;
    
    this.onResize = () => {
      this.width = Math.max(this.outputStream.columns || 80, 20);
    };
    this.sigwinchEmitter = sigwinchEmitter;
    this.sigwinchEmitter.on('SIGWINCH', this.onResize);
  }

  async prompt(prefix = ':: ') {
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

  glitch(text) {
    this.hideCursor();
    const isDumb = process.env.TERM === 'dumb';
    const noGlitch = process.env.NERATH_NO_GLITCH === '1';
    if (!noGlitch && !isDumb) {
      this.outputStream.write(magenta('/// ') + white(text) + '\n');
    } else {
      this.outputStream.write('/// ' + text + '\n');
    }
    this.currentLineLength = 0;
    this.showCursor();
  }

  printHeader() {
    this.glitch('CONNECTED');
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
      case 'message.appended':
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
        this.glitch(`TOOL START: ${actionNames.join(', ')}`);
        break;
      }
      case 'action.result': {
        const resName = ev.data?.result?.toolName || ev.data?.result?.subagentName || ev.data?.result?.name || ev.data?.result?.kind || ev.data?.action?.toolName || ev.data?.action?.name || ev.data?.action?.kind || 'unknown';
        if (ev.data?.status === 'failed') {
          this.glitch(`TOOL FAILED: ${resName}`);
        } else {
          this.glitch(`TOOL COMPLETED: ${resName}`);
        }
        break;
      }
      case 'input.requested':
        this.glitch('APPROVAL NEEDED');
        break;
      case 'step.failed':
      case 'turn.failed':
      case 'session.failed':
        this.glitch(`ERROR ${ev.type} ${ev.data?.code || ''} ${ev.data?.message || ''}`.trim());
        break;
      case 'turn.cancelled':
        this.glitch('CANCELLED');
        break;
      case 'turn.completed':
      case 'session.completed':
        this.printedLength = 0;
        this.currentLineLength = 0;
        this.glitch('TURN COMPLETE');
        break;
      case 'reasoning.appended':
      case 'reasoning.completed':
        break;
    }
  }

  cleanup() {
    if (this.cleanedUp) return;
    this.cleanedUp = true;
    this.sigwinchEmitter.off('SIGWINCH', this.onResize);
    this.rl.close();
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

export async function handleInputRequest(ui, req) {
  if (!req.display || !['confirmation', 'select', 'text'].includes(req.display)) {
    throw new Error(`Unsupported input request display: ${req.display || 'undefined'}`);
  }

  let inputResponse = { requestId: req.requestId };

  if (req.display === 'confirmation') {
    const options = req.options || [];
    if (options.length === 0) {
      throw new Error('Malformed confirmation request: no options provided');
    }
    while (true) {
      ui.outputStream.write(cyan(`:: [Confirmation] ${req.prompt}\n`));
      for (const opt of options) {
        ui.outputStream.write(cyan(`  - ${opt.id}: ${opt.label || opt.id}\n`));
      }
      const answer = await ui.prompt();
      if (answer === ui.EOF) throw new Error('EOF during input');
      const ansTrimmed = answer.trim();
      const matched = options.find(o => o.id === ansTrimmed || o.id[0].toLowerCase() === ansTrimmed.toLowerCase());
      if (matched) {
        inputResponse.optionId = matched.id;
        break;
      }
      ui.glitch('INVALID SELECTION');
    }
  } else if (req.display === 'select') {
    const options = req.options || [];
    if (options.length === 0) {
      throw new Error('Malformed select request: no options provided');
    }
    while (true) {
      ui.outputStream.write(cyan(`:: [Select] ${req.prompt}\n`));
      let idx = 1;
      for (const opt of options) {
        ui.outputStream.write(cyan(`  ${idx}. ${opt.id}: ${opt.label || opt.id}\n`));
        idx++;
      }
      const answer = await ui.prompt();
      if (answer === ui.EOF) throw new Error('EOF during input');
      const ansTrimmed = answer.trim();
      const matched = options.find(o => o.id === ansTrimmed);
      const numeric = parseInt(ansTrimmed, 10);
      if (matched) {
         inputResponse.optionId = matched.id;
         break;
      } else if (!isNaN(numeric) && numeric >= 1 && numeric <= options.length) {
         inputResponse.optionId = options[numeric - 1].id;
         break;
      }
      ui.glitch('INVALID SELECTION');
    }
  } else if (req.display === 'text') {
    ui.outputStream.write(cyan(`:: [Input] ${req.prompt}\n`));
    const answer = await ui.prompt();
    if (answer === ui.EOF) throw new Error('EOF during input');
    inputResponse.text = answer;
  }
  return inputResponse;
}
