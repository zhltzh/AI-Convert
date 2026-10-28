import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('./home-workspace.intl.js', import.meta.url)), 'utf8');

test('locale is resolved before any locale-dependent module-level map', () => {
  const declaration = source.indexOf('const locale = getLocale();');
  const firstUsage = source.indexOf('[locale.code]');
  assert.ok(declaration >= 0, 'locale declaration is missing');
  assert.ok(firstUsage >= 0, 'expected a locale-keyed map');
  // A map evaluated before the declaration throws a TDZ ReferenceError and
  // takes the whole localized workspace down.
  assert.ok(declaration < firstUsage, 'locale must be declared before it is used at module scope');
});
