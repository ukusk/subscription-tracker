'use client';

import { useEffect, useState } from "react";
import Totals from "./Totals";
import SubscriptionForm from "./SubscriptionForm";
import SubscriptionList from "./SubscriptionList";
import { readError } from "./subscriptionHelpers";

// Owns the list of subscriptions. The form and the list call the API
// themselves and report back with onCreated / onDeleted.
export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0); // bump to load again

  useEffect(() => {
    let ignore = false; // don't update state if the component is gone

    fetch("/api/subscriptions")
      .then(async (res) => {
        if (!res.ok) throw new Error(await readError(res));
        return res.json();
      })
      .then((data) => {
        if (!ignore) setSubscriptions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Tellimuste laadimine ebaõnnestus.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [attempt]);

  function retry() {
    setError("");
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  function handleCreated(subscription) {
    setSubscriptions((prev) => [...prev, subscription]);
  }

  function handleDeleted(id) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="stack">
      {error && (
        <div className="alert" role="alert">
          <span>Viga: {error}</span>
          <button type="button" className="btn-ghost" onClick={retry}>
            Proovi uuesti
          </button>
        </div>
      )}

      <Totals subscriptions={subscriptions} loading={loading} />

      <SubscriptionForm onCreated={handleCreated} />

      {loading ? (
        <p className="empty">Laadin tellimusi…</p>
      ) : (
        <SubscriptionList subscriptions={subscriptions} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
