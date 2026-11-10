import test from 'node:test';
import assert from 'node:assert/strict';
import { formatToman, formatDate } from './admin-nav';

test('formatToman formats numbers into Persian locale numbers', () => {
  const result = formatToman(1250000);
  assert.equal(typeof result, 'string');
  assert.ok(result.length > 0);
  // Zero handling
  assert.equal(formatToman(0), '۰');
  // Null and undefined handling
  assert.equal(formatToman(null), '۰');
  assert.equal(formatToman(undefined), '۰');
});

test('formatDate handles valid ISO dates and nulls gracefully', () => {
  assert.equal(formatDate(null), '—');
  const formatted = formatDate('2025-01-15T12:00:00Z');
  assert.equal(typeof formatted, 'string');
  assert.ok(formatted.length > 0);
});
