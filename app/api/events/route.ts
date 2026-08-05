import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
        .select("id, title, description, event_date, location, image_url, author_id")
    .order("event_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const event_date = formData.get("event_date") as string;
  const location = (formData.get("location") as string) || null;
  const imageFile = formData.get("imageFile") as File | null;

  if (!title || !event_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `event-images/${uuidv4()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("citizen-documents")
      .upload(path, imageFile, { cacheControl: "3600", upsert: false });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("citizen-documents").getPublicUrl(path);
      imageUrl = urlData?.publicUrl ?? null;
    }
  }

  const { data, error } = await supabase
    .from("events")
    .insert([{ author_id: user.id, title, description, event_date, location, image_url: imageUrl }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
