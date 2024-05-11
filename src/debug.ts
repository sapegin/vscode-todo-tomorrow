import { window } from 'vscode';

const debug = window.createOutputChannel('Todo Tomorrow');

export function logMessage(...messages: any[]) {
  debug.appendLine(
    messages
      .map((x) =>
        typeof x === 'string' || typeof x === 'number' ? x : JSON.stringify(x),
      )
      .join(' '),
  );
}
