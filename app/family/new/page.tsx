"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const TYPES = [
  { value: "resident_id", label: "Resident ID" },
  { value: "marriage_cert", label: "Marriage Certificate" },
];

export default function NewFamilyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

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

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/family", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to publish guide.");
      setLoading(false);
    } else {
      router.push("/family");
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f0f4f8" }}>
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 fade-in">
          <Link href="/family" className="text-sm font-medium hover:underline" style={{ color: "#1a5276" }}>
            ← Family Registrations
          </Link>
          <span style={{ color: "#dce6f0" }}>/</span>
          <h1 className="text-2xl font-extrabold" style={{ color: "#0d2137" }}>New Family Guide</h1>
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

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Title <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <input name="title" type="text" required className="admin-input" placeholder="e.g. Kebele Residency ID Requirements" />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Type <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <select name="type" required className="admin-input">
                <option value="">Select a type...</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Description <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <textarea name="description" required className="admin-textarea" rows={4} placeholder="Write a brief overview of the service..." />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Requirements <span className="text-gray-400 font-normal">(one per line)</span>
              </label>
              <textarea
                name="requirements"
                className="admin-textarea"
                rows={5}
                placeholder="Required document 1&#10;Required document 2&#10;Required document 3..."
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Document Form File <span className="text-gray-400 font-normal">(optional PDF, DOCX, or Image)</span>
              </label>
              {fileName && (
                <div className="p-3 bg-slate-50 border rounded-xl text-xs flex justify-between items-center mb-2">
                  <span className="truncate">{fileName}</span>
                  <button type="button" onClick={() => setFileName(null)} className="text-red-500 font-bold ml-2">✕</button>
                </div>
              )}
              <label
                className="flex flex-col items-center justify-center w-full h-24 rounded-xl cursor-pointer transition hover:opacity-80"
                style={{ border: "2px dashed #dce6f0", background: "#f8f9fc" }}
              >
                <span className="text-2xl mb-1">📁</span>
                <span className="text-xs font-medium" style={{ color: "#5d6d7e" }}>Click to upload application file</span>
                <input
                  type="file"
                  name="documentFile"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #1a5276, #1f618d)" }}
              >
                {loading ? "Publishing..." : "🚀 Publish Guide"}
              </button>
              <Link
                href="/family"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ background: "#eaf0fb", color: "#1a5276" }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
