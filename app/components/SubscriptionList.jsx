'use client';

import { useState } from "react";
import {
  readError,
  formatEuro,
  yearlyPrice,
  nextBillingDate,
  daysUntil,
  formatDaysUntil,
  formatDate,
  startOfToday,
} from "./subscriptionHelpers";

const DUE_SOON_DAYS = 7;

const SORTS = {
  next: (a, b) => nextBillingDate(a.billing_day) - nextBillingDate(b.billing_day),
  price: (a, b) => Number(b.monthly_price) - Number(a.monthly_price),
  name: (a, b) => a.name.localeCompare(b.name, "et"),
};

export default function SubscriptionList({ subscriptions, onDeleted }) {
  const [sort, setSort] = useState("next"); // nearest payment first
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function handleDelete(subscription) {
    setError("");
    setDeletingId(subscription.id);
    try {
      const res = await fetch(`/api/subscriptions/${encodeURIComponent(subscription.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await readError(res));
      // 204 has no body — so no res.json() here.
      onDeleted(subscription.id);
    } catch (err) {
      setError(`„${subscription.name}“ kustutamine ebaõnnestus: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  if (subscriptions.length === 0) {
    return <p className="empty">Tellimusi veel pole — lisa esimene ülal.</p>;
  }

  const today = startOfToday();
  const sorted = [...subscriptions].sort(SORTS[sort]);

  return (
    <section className="stack">
      <div className="list-header">
        <h2>Sinu tellimused</h2>
        {subscriptions.length > 1 && (
          <label className="sort">
            <span>Järjesta</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="next">Järgmine makse</option>
              <option value="price">Kalleim</option>
              <option value="name">Nimi</option>
            </select>
          </label>
        )}
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <ul className="list">
        {sorted.map((s) => {
          const next = nextBillingDate(s.billing_day, today);
          const days = daysUntil(next, today);
          const deleting = deletingId === s.id;

          return (
            <li key={s.id} className={deleting ? "row row-fading" : "row"}>
              <div className="row-info">
                {/* Normal JSX text — React escapes it, so user input is shown safely. */}
                <span className="row-name">{s.name}</span>
                <span className="row-meta">
                  Järgmine makse {formatDate(next)}
                  <span className={days <= DUE_SOON_DAYS ? "badge badge-soon" : "badge"}>
                    {formatDaysUntil(days)}
                  </span>
                </span>
              </div>

              <div className="row-price">
                <span className="num">{formatEuro(Number(s.monthly_price))}</span>
                <span className="row-meta num">{formatEuro(yearlyPrice(s.monthly_price))} / a</span>
              </div>

              <button
                type="button"
                className="btn-ghost btn-delete"
                onClick={() => handleDelete(s)}
                disabled={deletingId !== null}
                aria-label={`Kustuta ${s.name}`}
              >
                {deleting ? "Kustutan…" : "Kustuta"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
