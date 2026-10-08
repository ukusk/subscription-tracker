'use client';

import { useState } from "react";
import {
  validateSubscription,
  readError,
  yearlyPrice,
  formatEuro,
  nextBillingDate,
  daysUntil,
  formatDaysUntil,
  formatDate,
  NAME_MAX,
} from "./subscriptionHelpers";

const EMPTY = { name: "", monthly_price: "", billing_day: "" };

export default function SubscriptionForm({ onCreated }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    // 1. Check in the browser first — fast feedback, no request needed.
    const { data, errors: found } = validateSubscription(values);
    if (!data) {
      setErrors(found);
      return;
    }

    // 2. Send only the editable fields to our API.
    setSaving(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await readError(res));

      const created = await res.json(); // 201 + the new row
      onCreated(created);
      setValues(EMPTY);
      setErrors({});
    } catch (err) {
      setServerError(err.message || "Salvestamine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  }

  // Live hints under the fields — shown only when that field is valid.
  const check = validateSubscription({ name: "x", monthly_price: "1", billing_day: "1", ...values });
  const priceOk = !check.errors.monthly_price && values.monthly_price !== "";
  const dayOk = !check.errors.billing_day && values.billing_day !== "";
  const price = Number(String(values.monthly_price).replace(",", "."));
  const nextDate = dayOk ? nextBillingDate(values.billing_day) : null;

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h2>Lisa tellimus</h2>

      <div className="form-row">
        <div className="field field-wide">
          <label htmlFor="sub-name">Nimi</label>
          <input
            id="sub-name"
            type="text"
            placeholder="nt Spotify"
            maxLength={NAME_MAX}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "sub-name-error" : undefined}
            disabled={saving}
            autoComplete="off"
          />
          {errors.name && <p id="sub-name-error" className="field-error">{errors.name}</p>}
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="sub-price">Hind kuus</label>
          <div className="input-suffix">
            <input
              id="sub-price"
              type="text"
              inputMode="decimal"
              placeholder="9,99"
              value={values.monthly_price}
              onChange={(e) => update("monthly_price", e.target.value)}
              aria-invalid={Boolean(errors.monthly_price)}
              aria-describedby={errors.monthly_price ? "sub-price-error" : "sub-price-hint"}
              disabled={saving}
              autoComplete="off"
            />
            <span aria-hidden="true">€</span>
          </div>
          {errors.monthly_price ? (
            <p id="sub-price-error" className="field-error">{errors.monthly_price}</p>
          ) : (
            <p id="sub-price-hint" className="hint">
              {priceOk ? `= ${formatEuro(yearlyPrice(price))} aastas` : " "}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="sub-day">Maksepäev (1–31)</label>
          <input
            id="sub-day"
            type="number"
            min="1"
            max="31"
            step="1"
            placeholder="15"
            value={values.billing_day}
            onChange={(e) => update("billing_day", e.target.value)}
            aria-invalid={Boolean(errors.billing_day)}
            aria-describedby={errors.billing_day ? "sub-day-error" : "sub-day-hint"}
            disabled={saving}
          />
          {errors.billing_day ? (
            <p id="sub-day-error" className="field-error">{errors.billing_day}</p>
          ) : (
            <p id="sub-day-hint" className="hint">
              {nextDate
                ? `Järgmine makse ${formatDate(nextDate)} (${formatDaysUntil(daysUntil(nextDate))})`
                : " "}
            </p>
          )}
        </div>
      </div>

      {serverError && (
        <p className="alert" role="alert">
          {serverError}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Salvestan…" : "Lisa tellimus"}
      </button>
    </form>
  );
}
