import { getTotals, formatEuro } from "./subscriptionHelpers";

// Totals per month and per year. Calculated in cents so the sum is exact.
export default function Totals({ subscriptions, loading = false }) {
  const { monthly, yearly, count } = getTotals(subscriptions);
  const show = (value) => (loading ? "—" : value);

  return (
    <section className="totals" aria-label="Kokkuvõte" aria-live="polite">
      <div className="stat stat-main">
        <span className="stat-label">Aastas kokku</span>
        <strong className="stat-value num">{show(formatEuro(yearly))}</strong>
      </div>
      <div className="stat">
        <span className="stat-label">Kuus kokku</span>
        <strong className="stat-value num">{show(formatEuro(monthly))}</strong>
      </div>
      <div className="stat">
        <span className="stat-label">Tellimusi</span>
        <strong className="stat-value num">{show(count)}</strong>
      </div>
    </section>
  );
}
