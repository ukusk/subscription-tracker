export async function DELETE(request, { params }) {
  const { id } = await params;
  // TODO (backend): delete the row with this id from Supabase, return 204 or 404
  return Response.json({ error: `Delete for id ${id} not implemented yet` }, { status: 501 });
}
