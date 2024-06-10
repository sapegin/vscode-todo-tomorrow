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
const DEFAULT_COMMENT_PATTERN = '(?://|\\*)\\s*';
// Shell-style comments: #
const HASH_COMMENT_PATTERN = '(?:#)\\s*';
const PERCENT_COMMENT_PATTERN = '(?:%)\\s*';
const COMMENT_PATTERNS: Record<string, string> = {
  // HTML should also support C-style comments for embedded JavaScript and CSS
  html: '(?:<!--|//|\\*)\\s*',
  // For Markdown we only support todos at the beginning of a line or inside
  // an HTML comment
  markdown: '(?:^|\\n|<!--\\s*)',
  // Lua: -- --[[
  // Only support single-line comments and the first line of multiline comments
  lua: '(?:--|--\\[\\[)\\s*',
  // SQL: --
  sql: '(?:--)\\s*',
  // PHP: / /* */ /** */ #
  php: '(?://|\\*|#)\\s*',
  // Python: #
  // Only support single-line comments, no multiline (""" ... """)
  python: HASH_COMMENT_PATTERN,
  // Ruby: #
  // Only support single-line comments, no multiline (=begin ... =end)
  ruby: HASH_COMMENT_PATTERN,
  perl: HASH_COMMENT_PATTERN,
  r: HASH_COMMENT_PATTERN,
  shellscript: HASH_COMMENT_PATTERN,
  erlang: PERCENT_COMMENT_PATTERN,
  elixir: HASH_COMMENT_PATTERN,
};

// Patterns after the keyword
const SUFFIX_PATTERNS: Record<string, string> = {
  // Require colon (:), new line or end of file after keyword
  markdown: '(?=:|\\n|$)',
};

export class Decorator {
  private config: ExtensionProperties;
  /** Number of lines in the document during the last decorate() call  */
  private lineCount = 0;
  /** Numbers of lines where decorations were applied */
  private decoratedLines: Set<number> = new Set();
  /** Pattern to match all comments */
  private patterns: Record<string, string> = {};
  /** Decoration types for each style */
  private decorationTypes: DecorationType[];

  public constructor(config: ExtensionProperties) {
    this.config = config;
    this.decorationTypes = this.getDecorationTypes();
    this.patterns = {};
  }

  public updateConfig(config: ExtensionProperties) {
    this.config = config;
    this.decorationTypes = this.getDecorationTypes();
    this.patterns = {};
    this.decorate();
  }

  public decorate(): void {
    const textEditor = window.activeTextEditor;
    if (textEditor === undefined) {
      return;
    }

    const regExp = this.getRegExp();
    if (regExp === undefined) {
      return;
    }

    this.lineCount = textEditor.document.lineCount;
    this.decoratedLines.clear();

    const text = textEditor.document.getText();
    const matches: Record<string, Range[]> = {};
    let match: RegExpExecArray | null;
    while ((match = regExp.exec(text))) {
      logMessage('Match:', match[0], `[${match[1]}]`);

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

    const regExp = this.getRegExp();

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

  private getRegExp() {
    const languageId = window.activeTextEditor?.document?.languageId;
    if (!languageId) {
      return undefined;
    }

    // Return new RegExp every time to avoid issues with the state (`lastIndex`)
    return new RegExp(this.getPattern(languageId), 'gi');
  }

  private getPattern(languageId: string) {
    logMessage('Language:', languageId);

    const pattern = this.patterns[languageId];
    if (pattern) {
      return pattern;
    }

    const languagePatterns =
      COMMENT_PATTERNS[languageId] ?? DEFAULT_COMMENT_PATTERN;
    const suffix = SUFFIX_PATTERNS[languageId] ?? '';
    const keywordsPattern = this.config.patterns
      .flatMap(({ keywords }) => keywords.map(escapeRegExp))
      .join('|');

    this.patterns[languageId] =
      `${languagePatterns}(${keywordsPattern})${suffix}`;

    logMessage('RegExp:', this.patterns[languageId]);

    return this.patterns[languageId];
  }
}
