import {
  window,
  workspace,
  Range,
  type TextEditorDecorationType,
  type TextDocumentContentChangeEvent,
} from 'vscode';
import escapeRegExp from 'lodash/escapeRegExp';
import { logMessage } from './debug';
import type { KeywordConfig } from './types';

type DecorationType = {
  keywords: string[];
  decorationType: TextEditorDecorationType;
};

export class Decorator {
  /** Number of lines in the document during the last decorate() call  */
  private lineCount = 0;
  /** Numbers of lines where decorations were applied */
  private decoratedLines: Set<number> = new Set();
  /** RegExp pattern to match all comments */
  private pattern: RegExp;
  /** Decoration types for each style */
  private decorationTypes: DecorationType[];

  public constructor() {
    const { patterns } = workspace.getConfiguration('todoTomorrow');
    this.decorationTypes = this.getDecorationTypes(patterns);
    this.pattern = this.getPattern(patterns);
  }

  public updateConfig() {
    this.constructor();
  }

  public decorate(): void {
    const textEditor = window.activeTextEditor;
    if (!textEditor) {
      return;
    }

    this.lineCount = textEditor.document.lineCount;
    this.decoratedLines.clear();

    const text = textEditor.document.getText();
    const matches: Record<string, Range[]> = {};
    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text))) {
      logMessage('Match:', match[0]);
      const startPos = textEditor.document.positionAt(match.index);
      const endPos = textEditor.document.positionAt(
        match.index + match[0].length,
      );
      const range = new Range(startPos, endPos);

      const keyword = match[0].toUpperCase();
      if (keyword in matches === false) {
        matches[keyword] = [];
      }

      matches[keyword].push(range);

      this.decoratedLines.add(startPos.line);
    }

    logMessage('Matches:', matches);

    for (const { keywords, decorationType } of this.decorationTypes) {
      const ranges = keywords.flatMap((x) => matches[x]).filter(Boolean);
      if (ranges.length === 0) {
        return;
      }

      // const ranges = matches[keyword] ?? [];
      logMessage('Set decorations', keywords, ranges);
      textEditor?.setDecorations(decorationType, ranges);
    }
  }

  public decorateLines(
    contentChanges: readonly TextDocumentContentChangeEvent[],
  ) {
    const textEditor = window.activeTextEditor;
    if (!textEditor) {
      return;
    }

    const hasMultilineChanges =
      contentChanges.every(({ range }) => range.isSingleLine) === false;
    const changedLines = contentChanges.map(({ range }) => range.start.line);
    const hadDecoratorsOnChangedLines = changedLines.some((x) =>
      this.decoratedLines.has(x),
    );
    const shouldHaveDecoratorsOnChangedLines = changedLines.some((x) =>
      this.pattern.test(textEditor.document.lineAt(x).text),
    );

    // Skip decorating for certain cases to improve performance
    if (
      // No lines were added or removed
      this.lineCount === textEditor.document.lineCount &&
      // All changes are single line changes
      hasMultilineChanges === false &&
      // Had no decorators on changed lines
      hadDecoratorsOnChangedLines === false &&
      // No need to add decorators to changed lines
      shouldHaveDecoratorsOnChangedLines === false
    ) {
      logMessage('Skip decoration...');
      return;
    }

    this.decorate();
  }

  private getDecorationTypes(patterns: KeywordConfig[]) {
    const decorationTypes: DecorationType[] = [];
    patterns.forEach((pattern) => {
      const decorationType = window.createTextEditorDecorationType(pattern);
      decorationTypes.push({
        keywords: pattern.keywords.map((x) => x.toUpperCase()),
        decorationType,
      });
    });
    return decorationTypes;
  }

  // TODO: Allow optional : ?
  private getPattern(patterns: KeywordConfig[]) {
    const pattern = patterns
      .flatMap(({ keywords }) => keywords.map(escapeRegExp))
      .join('|');

    // XXX: Doing something very dangerous here
    logMessage('RegExp:', pattern);

    return new RegExp(pattern, 'gi');
  }
}
