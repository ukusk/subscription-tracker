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

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const { subscription, error: validationError } = validateSubscription(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("subscriptions")
      .insert(subscription)
      .select("id, name, monthly_price, billing_day, created_at")
      .single();

    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Could not create subscription" }, { status: 500 });
  }
}

// Form inputs send strings, so numeric fields may arrive as "9.99" as well as 9.99
function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function validateSubscription(body) {
  if (!body || typeof body !== "object") {
    return { error: "Body must be a JSON object" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 1 || name.length > 80) {
    return { error: "name must be 1-80 characters" };
  }

  const monthlyPrice = toNumber(body.monthly_price);
  // numeric(10, 2) in the database holds at most 99999999.99
  if (!Number.isFinite(monthlyPrice) || monthlyPrice <= 0 || monthlyPrice >= 100000000) {
    return { error: "monthly_price must be a number greater than 0" };
  }

  const billingDay = toNumber(body.billing_day);
  if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31) {
    return { error: "billing_day must be a whole number from 1 to 31" };
  }

  return { subscription: { name, monthly_price: monthlyPrice, billing_day: billingDay } };
}
