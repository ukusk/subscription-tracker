import "./globals.css";

export const metadata = {
  title: "Tellimuste jälgija",
  description: "Track your monthly subscriptions in one place",
};

export default function RootLayout({ children }) {
  return (
    <html lang="et">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
