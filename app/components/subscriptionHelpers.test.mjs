// Run: node --test app/components/subscriptionHelpers.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSubscription,
  getTotals,
  yearlyPrice,
  nextBillingDate,
  daysUntil,
} from './subscriptionHelpers.js';

test('accepts a normal subscription and trims the name', () => {
  const { data, errors } = validateSubscription({
    name: '  Spotify ',
    monthly_price: '9,99',
    billing_day: '15',
  });
  assert.deepEqual(errors, {});
  assert.deepEqual(data, { name: 'Spotify', monthly_price: 9.99, billing_day: 15 });
});

test('rejects empty and invalid values', () => {
  const { data, errors } = validateSubscription({
    name: '   ',
    monthly_price: 'abc',
    billing_day: '2.5',
  });
  assert.equal(data, null);
  assert.ok(errors.name);
  assert.ok(errors.monthly_price);
  assert.ok(errors.billing_day);
});

test('boundaries: 80 chars and day 1/31 are fine, 81 chars, 0 € and day 32 are not', () => {
  const ok = validateSubscription({ name: 'a'.repeat(80), monthly_price: '0.01', billing_day: '31' });
  assert.deepEqual(ok.errors, {});
  assert.deepEqual(
    validateSubscription({ name: 'X', monthly_price: '1', billing_day: '1' }).errors,
    {}
  );

  const bad = validateSubscription({ name: 'a'.repeat(81), monthly_price: '0', billing_day: '32' });
  assert.ok(bad.errors.name);
  assert.ok(bad.errors.monthly_price);
  assert.ok(bad.errors.billing_day);
});

test('totals are exact in cents, and an empty list is zero', () => {
  const totals = getTotals([
    { monthly_price: 9.99 },
    { monthly_price: '35.00' }, // Supabase numeric may arrive as a string
    { monthly_price: 2.99 },
  ]);
  assert.deepEqual(totals, { count: 3, monthly: 47.98, yearly: 575.76 });
  assert.equal(yearlyPrice(9.99), 119.88);
  assert.deepEqual(getTotals([]), { count: 0, monthly: 0, yearly: 0 });
});

test('next billing date: later this month, today, or next month', () => {
  const today = new Date(2026, 9, 8); // 8 Oct 2026

  assert.deepEqual(nextBillingDate(15, today), new Date(2026, 9, 15));
  assert.equal(daysUntil(nextBillingDate(8, today), today), 0);
  assert.deepEqual(nextBillingDate(5, today), new Date(2026, 10, 5));
});

test('day 31 falls back to the last day of shorter months', () => {
  assert.deepEqual(nextBillingDate(31, new Date(2026, 10, 2)), new Date(2026, 10, 30)); // Nov
  assert.deepEqual(nextBillingDate(31, new Date(2027, 1, 1)), new Date(2027, 1, 28)); // Feb
  assert.deepEqual(nextBillingDate(30, new Date(2026, 11, 31)), new Date(2027, 0, 30)); // Dec → Jan
});
