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

// By default look for C-style comments: // /* */ /** */
const DEFAULT_COMMENT_PATTERN = '\\s*(?://|\\*)\\s+';
const COMMENT_PATTERNS: Record<string, string> = {
  javascript: DEFAULT_COMMENT_PATTERN,
  typescript: DEFAULT_COMMENT_PATTERN,
};

export class Decorator {
  /** Number of lines in the document during the last decorate() call  */
  private lineCount = 0;
  /** Numbers of lines where decorations were applied */
  private decoratedLines: Set<number> = new Set();
  /** RegExp pattern to match all comments */
  private pattern: RegExp | undefined;
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
    if (textEditor === undefined || this.pattern === undefined) {
      return;
    }

    this.lineCount = textEditor.document.lineCount;
    this.decoratedLines.clear();

    const text = textEditor.document.getText();
    const matches: Record<string, Range[]> = {};
    let match: RegExpExecArray | null;
    while ((match = this.pattern.exec(text))) {
      const startPos = textEditor.document.positionAt(
        match.index + (match[0].length - match[1].length),
      );
      const endPos = textEditor.document.positionAt(
        match.index + match[0].length,
      );
      const range = new Range(startPos, endPos);

      const keyword = match[1].toUpperCase();
      if (keyword in matches === false) {
        matches[keyword] = [];
      }

      matches[keyword].push(range);

      this.decoratedLines.add(startPos.line);
    }

    for (const { keywords, decorationType } of this.decorationTypes) {
      const ranges = keywords.flatMap((x) => matches[x]).filter(Boolean);
      textEditor?.setDecorations(decorationType, ranges);
    }
  }

  public decorateLines(
    contentChanges: readonly TextDocumentContentChangeEvent[],
  ) {
    const textEditor = window.activeTextEditor;
    if (textEditor === undefined || this.pattern === undefined) {
      return;
    }

    const hasMultilineChanges =
      contentChanges.every(({ range }) => range.isSingleLine) === false;
    const changedLines = contentChanges.map(({ range }) => range.start.line);
    const hadDecoratorsOnChangedLines = changedLines.some((x) =>
      this.decoratedLines.has(x),
    );
    const shouldHaveDecoratorsOnChangedLines = changedLines.some((x) =>
      this.pattern?.test(textEditor.document.lineAt(x).text),
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

  private getPattern(patterns: KeywordConfig[]) {
    const languageId = window.activeTextEditor?.document?.languageId;
    if (!languageId) {
      return undefined;
    }
    const commentPattern = COMMENT_PATTERNS[languageId];
    if (!commentPattern) {
      return undefined;
    }

    logMessage('Language:', languageId);

    const pattern = patterns
      .flatMap(({ keywords }) => keywords.map(escapeRegExp))
      .join('|');

    logMessage('RegExp:', pattern);

    return new RegExp(`${commentPattern}(${pattern})`, 'gi');
  }
}
