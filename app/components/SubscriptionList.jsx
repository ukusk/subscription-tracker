'use client';

export default function SubscriptionList({ subscriptions, onDeleted }) {
  // TODO (frontend): sort by nearest billing day; delete button -> DELETE /api/subscriptions/:id, then onDeleted(id)
  if (subscriptions.length === 0) {
    return <p className="muted">Tellimusi veel pole.</p>;
  }

  return (
    <ul className="list">
      {subscriptions.map((s) => (
        <li key={s.id} className="row">
          <span>{s.name}</span>
          <span>{Number(s.monthly_price).toFixed(2)} €</span>
          <span>{s.billing_day}. kuupäev</span>
        </li>
      ))}
    </ul>
  );
}
