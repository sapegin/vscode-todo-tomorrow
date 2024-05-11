import {
  window,
  Range,
  type TextEditorDecorationType,
  type TextDocumentContentChangeEvent,
} from 'vscode';
import escapeRegExp from 'lodash/escapeRegExp';
import { logMessage } from './debug';
import type { ExtensionProperties } from './types';

type DecorationType = {
  keywords: string[];
  decorationType: TextEditorDecorationType;
};

// By default look for C-style comments: // /* */ /** */
const DEFAULT_COMMENT_PATTERN = '\\s*(?://|\\*)\\s+';
const COMMENT_PATTERNS: Record<string, string> = {
  markdown: '(?:^|\\n)',
};

export class Decorator {
  private config: ExtensionProperties;
  /** Number of lines in the document during the last decorate() call  */
  private lineCount = 0;
  /** Numbers of lines where decorations were applied */
  private decoratedLines: Set<number> = new Set();
  /** RegExp pattern to match all comments */
  private regExps: Record<string, RegExp> = {};
  /** Decoration types for each style */
  private decorationTypes: DecorationType[];

  public constructor(config: ExtensionProperties) {
    this.config = config;
    this.decorationTypes = this.getDecorationTypes();
    this.regExps = {};
  }

  public updateConfig(config: ExtensionProperties) {
    this.constructor(config);
    this.decorate();
  }

  public decorate(): void {
    const textEditor = window.activeTextEditor;
    if (textEditor === undefined) {
      return;
    }

    const regExp = this.getPattern();
    if (regExp === undefined) {
      return;
    }

    this.lineCount = textEditor.document.lineCount;
    this.decoratedLines.clear();

    const text = textEditor.document.getText();
    const matches: Record<string, Range[]> = {};
    let match: RegExpExecArray | null;
    while ((match = regExp.exec(text))) {
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
    if (textEditor === undefined) {
      return;
    }

    const regExp = this.getPattern();

    const hasMultilineChanges =
      contentChanges.every(({ range }) => range.isSingleLine) === false;
    const changedLines = contentChanges.map(({ range }) => range.start.line);
    const hadDecoratorsOnChangedLines = changedLines.some((x) =>
      this.decoratedLines.has(x),
    );
    const shouldHaveDecoratorsOnChangedLines = changedLines.some((x) =>
      regExp?.test(textEditor.document.lineAt(x).text),
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

  private getDecorationTypes() {
    return this.config.patterns.map((pattern) => {
      const decorationType = window.createTextEditorDecorationType(pattern);
      return {
        keywords: pattern.keywords.map((x) => x.toUpperCase()),
        decorationType,
      };
    });
  }

  private getPattern() {
    const languageId = window.activeTextEditor?.document?.languageId;
    if (!languageId) {
      return undefined;
    }
    const regExp = this.regExps[languageId];
    if (regExp) {
      return regExp;
    }

    logMessage('Language:', languageId);

    const languagePatterns =
      COMMENT_PATTERNS[languageId] ?? DEFAULT_COMMENT_PATTERN;
    const pattern = this.config.patterns
      .flatMap(({ keywords }) => keywords.map(escapeRegExp))
      .join('|');

    logMessage('RegExp:', pattern);

    this.regExps[languageId] = new RegExp(
      `${languagePatterns}(${pattern})`,
      'gi',
    );

    return this.regExps[languageId];
  }
}
