import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selfTest, parseHtml, scriptSet } from '../../scripts/check-schedule-dist.mjs';

test('the post-build checker detects every injected violation and passes the clean sample', () => {
  assert.deepEqual(selfTest(), []);
});

test('the reader handles quoted, unquoted and inline-script markup', () => {
  const html = '<div data-layout=list class="a b"><script>if (a<b) {}</script><li data-session-id=x></li></div>';
  const open = parseHtml(html).filter((t) => t.kind === 'open');
  assert.equal(open[0].attrs.get('data-layout'), 'list');
  assert.equal(open[0].closeIdx, parseHtml(html).length - 1);
  assert.equal(open.find((t) => t.name === 'li').attrs.get('data-session-id'), 'x');
  assert.equal(scriptSet(html).size, 1);
});
