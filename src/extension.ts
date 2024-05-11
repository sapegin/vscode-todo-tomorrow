import { window, workspace, type ExtensionContext } from 'vscode';
import { logMessage } from './debug';
import { Decorator } from './decorator';

// TODO: Limit to comments only
// TODO: Highlight whole line
// TODO: Highlight whole comment until the end of comment or empty line
// TODO: Whitelist languages and generate a regexp that matches only comments for this language
// TODO: Support Markdown: `TODO:` at the beginning of the line
// TODO: Do not run it in the Output panel

export function activate(context: ExtensionContext) {
  logMessage('✅ Todo Tomorrow starting...');

  let activeEditor = window.activeTextEditor;

  const decorator = new Decorator();
  decorator.decorate();

  context.subscriptions.push(
    // TODO Update on text change
    workspace.onDidChangeTextDocument(({ document, contentChanges }) => {
      if (
        // Ignore changes that didn't affect text content
        contentChanges.length === 0 ||
        // Ignore changes in other documents
        document !== activeEditor?.document ||
        // Ignore output panel
        document.languageId === 'Log'
      ) {
        return;
      }

      decorator.decorateLines(contentChanges);
    }),

    // Update on editor change
    window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;
      decorator.decorate();
    }),

    // Update on config change
    workspace.onDidChangeConfiguration(() => {
      logMessage('Config changed, reloading...');
      decorator.updateConfig();
      decorator.decorate();
    }),
  );
}
