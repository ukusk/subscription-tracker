import SubscriptionTracker from "./components/SubscriptionTracker";
 
// Server Component: renders the static header.
// Only SubscriptionTracker (and what it renders) runs in the browser.
export default function Home() {
  return (
    <>
      <header className="page-header">
        <h1>Tellimuste jälgija</h1>
        <p className="muted">Lisa oma tellimused ja vaata, palju need kuus ja aastas maksavad.</p>
      </header>
      <SubscriptionTracker />
    </>
  );
}