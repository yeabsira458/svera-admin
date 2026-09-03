"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const TYPES = [
  { value: "resident_id", label: "Resident ID" },
  { value: "marriage_cert", label: "Marriage Certificate" },
];

export default function EditFamilyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<{ title: string; description: string; type: string; requirements: string[]; document_url: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch("/api/family")
      .then((r) => r.json())
      .then((data: Array<{ id: string; title: string; description: string; type: string; requirements: string[]; document_url: string | null }>) => {
        const found = data.find((p) => p.id === id);
        if (found) {
          setItem(found);
          if (found.document_url) {
            setFileName("Existing uploaded document");
          }
        }
      });
  }, [id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/family/${id}`, { method: "PUT", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to update guide.");
      setLoading(false);
    } else {
      router.push("/family");
    }
  }

  if (!item) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f0f4f8" }}>
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading guide details...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f0f4f8" }}>
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex items-center gap-3 mb-8 fade-in">
          <Link href="/family" className="text-sm font-medium hover:underline" style={{ color: "#1a5276" }}>← Family Registrations</Link>
          <span style={{ color: "#dce6f0" }}>/</span>
          <h1 className="text-2xl font-extrabold" style={{ color: "#0d2137" }}>Edit Family Guide</h1>
        </div>

        <div className="max-w-2xl fade-in">
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="rounded-2xl bg-white p-4 sm:p-8 shadow-sm space-y-6"
            style={{ border: "1px solid #dce6f0" }}
          >
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: "#fdf2f2", border: "1px solid #f5c6cb", color: "#c0392b" }}>
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Title <span style={{ color: "#c0392b" }}>*</span></label>
              <input name="title" type="text" required defaultValue={item.title} className="admin-input" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Type <span style={{ color: "#c0392b" }}>*</span></label>
              <select name="type" required defaultValue={item.type} className="admin-input">
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Description <span style={{ color: "#c0392b" }}>*</span></label>
              <textarea name="description" required defaultValue={item.description} className="admin-textarea" rows={4} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Requirements <span className="text-gray-400 font-normal">(one per line)</span></label>
              <textarea
                name="requirements"
                className="admin-textarea"
                rows={5}
                defaultValue={item.requirements ? item.requirements.join("\n") : ""}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Document Form File <span className="text-gray-400 font-normal">(upload new to replace)</span>
              </label>
              {fileName && (
                <div className="p-3 bg-slate-50 border rounded-xl text-xs flex justify-between items-center mb-2">
                  <span className="truncate">{fileName}</span>
                </div>
              )}
              <label
                className="flex flex-col items-center justify-center w-full h-20 rounded-xl cursor-pointer transition hover:opacity-80"
                style={{ border: "2px dashed #dce6f0", background: "#f8f9fc" }}
              >
                <span className="text-xs font-medium" style={{ color: "#5d6d7e" }}>📁 Click to upload new file</span>
                <input type="file" name="documentFile" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #1a5276, #1f618d)" }}
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
              <Link href="/family" className="px-5 py-2.5 rounded-xl text-sm font-semibold transition" style={{ background: "#eaf0fb", color: "#1a5276" }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
