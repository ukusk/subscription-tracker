'use client';

import { useEffect, useState } from "react";
import Totals from "./Totals";
import SubscriptionForm from "./SubscriptionForm";
import SubscriptionList from "./SubscriptionList";

export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then(setSubscriptions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(subscription) {
    setSubscriptions((prev) => [...prev, subscription]);
  }

  function handleDeleted(id) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="stack">
      {error && <p className="error" role="alert">Viga: {error}</p>}
      <Totals subscriptions={subscriptions} />
      <SubscriptionForm onCreated={handleCreated} />
      {loading ? (
        <p>Laadin...</p>
      ) : (
        <SubscriptionList subscriptions={subscriptions} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
