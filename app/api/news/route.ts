import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

// GET /api/news — list all posts (admin view)
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:profiles!posts_author_id_fkey(id, full_name)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/news — create a new post (admin only)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const imageFile = formData.get("imageFile") as File | null;

  if (!title || !content || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `news-images/${uuidv4()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("citizen-documents")
      .upload(path, imageFile, { cacheControl: "3600", upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    const { data: urlData } = supabase.storage.from("citizen-documents").getPublicUrl(path);
    imageUrl = urlData?.publicUrl ?? null;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert([{ author_id: user.id, title, content, category, image_url: imageUrl }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
