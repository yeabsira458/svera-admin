import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

// PUT /api/family/[id] — update a family registration guide
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const requirementsRaw = formData.get("requirements") as string;
  const documentFile = formData.get("documentFile") as File | null;

  const requirements = requirementsRaw
    ? requirementsRaw.split("\n").map(r => r.trim()).filter(Boolean)
    : [];

  const updateData: Record<string, any> = { title, description, type, requirements };

  if (documentFile && documentFile.size > 0) {
    const ext = documentFile.name.split(".").pop();
    const path = `family-documents/${uuidv4()}.${ext}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "citizen-documents";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, documentFile, { cacheControl: "3600", upsert: false });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      updateData.document_url = urlData?.publicUrl ?? null;
    }
  }

  const { data, error } = await supabase
    .from("family_registrations")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/family/[id] — delete a family registration guide
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("family_registrations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
