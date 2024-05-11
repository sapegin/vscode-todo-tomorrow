// TODO: Basic todo comment
// TODO Basic todo comment
// HACK: Basic hack comment
// FIXME: Basic hack comment
// @todo: Basic todo comment
// @hack: Basic hack comment
//TODO: Basic todo comment
//@hack: Basic hack comment
// Shouldn't highlight TODO: or @todo in the middle

/* TODO: Multiline todo comment */
/* TODO Multiline todo comment */
/* XXX: Multiline hack comment */
/* HACK: Multiline hack comment */
/* FIXME: Multiline hack comment */
/* @todo: Multiline todo comment */
/* @todo Multiline todo comment */
/* @hack: Multiline hack comment */
/*TODO: Multiline todo comment */
/*@hack: Multiline hack comment */
/* Shouldn't highlight TODO: or @todo in the middle */
/*
 * Shouldn't highlight TODO: or @todo (here it's highlighted by
 * VS Code's JSDoc support) in the middle
 */

/** TODO: Another multiline todo comment */
/** TODO Another multiline todo comment */
/** XXX: Another multiline hack comment */
/** HACK: Another multiline hack comment */
/** FIXME: Another multiline hack comment */
/** @todo: Another multiline todo comment */
/** @todo Another multiline todo comment */
/** @hack: Another multiline hack comment */
/**TODO: Another multiline todo comment */
/**@hack: Another multiline hack comment */
/**
 * Shouldn't highlight TODO: or @todo (here it's highlighted by VS Code's JSDoc
 * support) in the middle
 */

/**
 * A big header comment
 * TODO: Make it even bigger!
 */

/**
 * A big header comment
 * @todo Make it even bigger!
 */

// TODO [2019-11-15]: Todo comment with a deadline
// @todo [2025-05-11]: Todo comment with a deadline
// TODO [2019-11-15] Todo comment with a deadline
// @todo [2025-05-11] Todo comment with a deadline
// TODO [>=1.0.0]: Todo comment with version
// TODO (@lubien) [>0]: Todo comment with version and at-mention
// FIXME [>10]: Fixme comment with a version
// XXX [>10]: Fixme comment with a version

// TODO: Basic todo comment
// TODO Basic todo comment
// XXX: Basic hack comment
// HACK: Basic hack comment
// FIXME: Basic hack comment
// @todo: Basic todo comment
// @hack: Basic hack comment
//TODO: Basic todo comment
//@hack: Basic hack comment
// Shouldn't highlight TODO: or @todo in the middle

/* TODO: Multiline todo comment */
/* TODO Multiline todo comment */
/* XXX: Multiline hack comment */
/* HACK: Multiline hack comment */
/* FIXME: Multiline hack comment */
/* @todo: Multiline todo comment */
/* @todo Multiline todo comment */
/* @hack: Multiline hack comment */
/*TODO: Multiline todo comment */
/*@hack: Multiline hack comment */
/* Shouldn't highlight TODO: or @todo in the middle */
/*
 * Shouldn't highlight TODO: or @todo (here it's highlighted by
 * VS Code's JSDoc support) in the middle
 */

/** TODO: Another multiline todo comment */
/** TODO Another multiline todo comment */
/** XXX: Another multiline hack comment */
/** HACK: Another multiline hack comment */
/** FIXME: Another multiline hack comment */
/** @todo: Another multiline todo comment */
/** @todo Another multiline todo comment */
/** @hack: Another multiline hack comment */
/**TODO: Another multiline todo comment */
/**@hack: Another multiline hack comment */
/**
 * Shouldn't highlight TODO: or @todo (here it's highlighted by VS Code's JSDoc
 * support) in the middle
 */

/**
 * A big header comment
 * TODO: Make it even bigger!
 */

/**
 * A big header comment
 * @todo Make it even bigger!
 */

// TODO [2019-11-15]: Todo comment with a deadline
// @todo [2025-05-11]: Todo comment with a deadline
// TODO [2019-11-15] Todo comment with a deadline
// @todo [2025-05-11] Todo comment with a deadline
// TODO [>=1.0.0]: Todo comment with version
// TODO (@lubien) [>0]: Todo comment with version and at-mention
// FIXME [react>=19]: Fixme comment with a version
// XXX [>10]: Fixme comment with a version

export function Test() {
  return (
    <main>
      {/* TODO: Todo comment inside JSX */}
      {/* @todo Todo comment inside JSX */}
      <h1>Hola</h1>
      {/* XXX: Hack comment inside JSX */}
      <h2>Test test test</h2>
    </main>
  );
}

// ------------------- 8< --- 8< -------------------
// Main screenshot
import escapeRegExp from 'lodash/escapeRegExp';

// TODO: Make it prettier
export function getPattern(patterns) {
  const pattern = patterns
    .flatMap(({ keywords }) => keywords.map(escapeRegExp))
    .join('|');

  console.log('🍕 pattern', pattern);

  // XXX: Doing something very dangerous here
  return new RegExp(pattern, 'gi');
}

// ------------------- 8< --- 8< -------------------
// Screenshot with all types of comments

// TODO: Basic todo comment
// XXX: Basic hack comment
// @todo: Basic todo comment
// @hack: Basic hack comment

/* @todo: Multiline todo comment */
/* HACK: Multiline hack comment */

/**
 * A big header comment
 * TODO: Make it even bigger!
 */

// TODO [2019-11-15]: Todo comment with a deadline
// @todo [2025-05-11] Todo comment with a deadline
// FIXME [react>=19]: Fixme comment with a version
