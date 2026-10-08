create table subscriptions (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) between 1 and 80),
  monthly_price numeric(10, 2) not null check (monthly_price > 0),
  billing_day int not null check (billing_day between 1 and 31),
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "Anyone can read subscriptions"
  on subscriptions for select to anon using (true);

create policy "Anyone can add subscriptions"
  on subscriptions for insert to anon with check (true);

create policy "Anyone can delete subscriptions"
  on subscriptions for delete to anon using (true);

insert into subscriptions (name, monthly_price, billing_day) values
  ('Muusika (näidis)', 9.99, 5),
  ('Jõusaal (näidis)', 35.00, 15),
  ('Pilveruum (näidis)', 2.99, 28);
