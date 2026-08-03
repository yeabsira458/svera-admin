import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const updateData: Record<string, string | null> = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    event_date: formData.get("event_date") as string,
    location: (formData.get("location") as string) || null,
  };

  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `event-images/${uuidv4()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("citizen-documents")
      .upload(path, imageFile, { cacheControl: "3600", upsert: false });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("citizen-documents").getPublicUrl(path);
      updateData.image_url = urlData?.publicUrl ?? null;
    }
  }

  const { data, error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
