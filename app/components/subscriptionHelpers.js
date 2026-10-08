// Pure helpers for the frontend: validation, money and dates.
// No React and no fetch here, so they are easy to test with `node --test`.
// The rules follow the API contract in README.md.

export const NAME_MAX = 80;
export const PRICE_MAX = 10000;

/**
 * Checks the form values. Returns cleaned data or error messages per field.
 * The backend repeats these checks — this is only for quick user feedback.
 */
export function validateSubscription(values) {
  const errors = {};

  const name = typeof values.name === 'string' ? values.name.trim() : '';
  if (name.length === 0) {
    errors.name = 'Nimi on kohustuslik.';
  } else if (name.length > NAME_MAX) {
    errors.name = `Nimi võib olla kuni ${NAME_MAX} märki.`;
  }

  // Accept both "9,99" and "9.99".
  const rawPrice = String(values.monthly_price ?? '').trim().replace(',', '.');
  const monthly_price = Number(rawPrice);
  if (rawPrice === '') {
    errors.monthly_price = 'Hind on kohustuslik.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(rawPrice)) {
    errors.monthly_price = 'Kirjuta number, kuni 2 komakohta (nt 9,99).';
  } else if (monthly_price <= 0 || monthly_price > PRICE_MAX) {
    errors.monthly_price = `Hind peab olema suurem kui 0 ja kuni ${PRICE_MAX} €.`;
  }

  const rawDay = String(values.billing_day ?? '').trim();
  const billing_day = Number(rawDay);
  if (rawDay === '') {
    errors.billing_day = 'Vali maksepäev.';
  } else if (!/^\d+$/.test(rawDay) || billing_day < 1 || billing_day > 31) {
    errors.billing_day = 'Maksepäev peab olema täisarv 1–31.';
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }
  return { data: { name, monthly_price, billing_day }, errors: {} };
}

// ---------------------------------------------------------------------------
// Money — calculated in whole cents so 3 × 9.99 is not 29.969999...
// ---------------------------------------------------------------------------

const toCents = (price) => Math.round(Number(price) * 100);

export function yearlyPrice(monthlyPrice) {
  return (toCents(monthlyPrice) * 12) / 100;
}

export function getTotals(subscriptions) {
  const monthlyCents = subscriptions.reduce((sum, s) => sum + toCents(s.monthly_price), 0);
  return {
    count: subscriptions.length,
    monthly: monthlyCents / 100,
    yearly: (monthlyCents * 12) / 100,
  };
}

const euro = new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' });

export function formatEuro(amount) {
  return euro.format(amount);
}

// ---------------------------------------------------------------------------
// Next payment date from billing_day (1–31)
// ---------------------------------------------------------------------------

/** Today at 00:00 local time. */
export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Day 31 in a 30-day month becomes the 30th; in February the 28th/29th.
function dayInMonth(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

/** The next payment on or after today. */
export function nextBillingDate(billingDay, today = startOfToday()) {
  const day = Number(billingDay);
  const thisMonth = dayInMonth(today.getFullYear(), today.getMonth(), day);
  if (thisMonth >= today) return thisMonth;
  return dayInMonth(today.getFullYear(), today.getMonth() + 1, day);
}

/** Whole days from today (0 = today). Rounding absorbs daylight-saving hours. */
export function daysUntil(date, today = startOfToday()) {
  return Math.round((date - today) / 86_400_000);
}

export function formatDaysUntil(days) {
  if (days === 0) return 'täna';
  if (days === 1) return 'homme';
  return `${days} päeva pärast`;
}

const dateFormat = new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'short' });

export function formatDate(date) {
  return dateFormat.format(date);
}

// ---------------------------------------------------------------------------
// API errors
// ---------------------------------------------------------------------------

/** Reads `{ "error": "..." }` from a failed response, with a fallback message. */
export async function readError(response) {
  try {
    const body = await response.json();
    if (body?.error) return body.error;
  } catch {
    // Body was not JSON.
  }
  return `Päring ebaõnnestus (${response.status})`;
}
