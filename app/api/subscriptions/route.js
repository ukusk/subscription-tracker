import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, name, monthly_price, billing_day, created_at")
      .order("billing_day", { ascending: true });

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Could not load subscriptions" }, { status: 500 });
  }
}

export async function POST() {
  // TODO (backend): read and validate body, insert into Supabase, return 201 with the created row
  return Response.json({ error: "Not implemented yet" }, { status: 501 });
}
