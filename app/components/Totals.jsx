export default function Totals({ subscriptions }) {
  const monthly = subscriptions.reduce((sum, s) => sum + Number(s.monthly_price), 0);
  const yearly = monthly * 12;

  return (
    <section className="card">
      <p>Kuus kokku: <strong>{monthly.toFixed(2)} €</strong></p>
      <p>Aastas kokku: <strong>{yearly.toFixed(2)} €</strong></p>
    </section>
  );
}
