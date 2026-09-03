import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

// GET /api/family — list all family registrations
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("family_registrations")
    .select("id, title, description, type, requirements, document_url, created_at, author_id")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/family — create a new family registration resource
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const requirementsRaw = formData.get("requirements") as string;
  const documentFile = formData.get("documentFile") as File | null;

  if (!title || !description || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const requirements = requirementsRaw
    ? requirementsRaw.split("\n").map(r => r.trim()).filter(Boolean)
    : [];

  let documentUrl: string | null = null;
  if (documentFile && documentFile.size > 0) {
    const ext = documentFile.name.split(".").pop();
    const path = `family-documents/${uuidv4()}.${ext}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "citizen-documents";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, documentFile, { cacheControl: "3600", upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    documentUrl = urlData?.publicUrl ?? null;
  }

  const { data, error } = await supabase
    .from("family_registrations")
    .insert([{ author_id: user.id, title, description, type, requirements, document_url: documentUrl }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
