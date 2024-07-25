# Changelog

## 1.4.0

- Stricter matching to avoid false positives:
  - More precise matching of multiline comments.
  - Matches are now case-sensitive, and only two forms of each keyword are matched: `@pizza` or `PIZZA`.
  - Simplify the config: no need to duplicate keywords with and without `@`.

## 1.3.1

- Remove more unnecessary files form the package.

## 1.3.0

- Support LaTeX.

## 1.2.0

- Support Elixir and Erlang.

## 1.1.0

- Support Bash, Lua, Perl, PHP, Python, R, Ruby, and SQL (only single-line comments).
- Add `BODGE`, `KLUDGE`, `NOTE`, and `UNDONE` tags.
- Allow stray todos in Markdown. Stray todo is when the keyword (tag) is the only content of a line.

## 1.0.1

- Fix config change handling.
- Decrease the severity of `debug`, `fix`, and `fixme` comments in the default options.

## 1.0.0

First version.
