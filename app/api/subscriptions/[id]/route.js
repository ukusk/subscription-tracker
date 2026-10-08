import { getSupabase } from "@/lib/supabase";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    // .select() returns the deleted rows, so an empty result means nothing matched
    const { data, error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", numericId)
      .select("id");

    if (error) throw error;
    if (data.length === 0) {
      return Response.json({ error: "Subscription not found" }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Could not delete subscription" }, { status: 500 });
  }
}
