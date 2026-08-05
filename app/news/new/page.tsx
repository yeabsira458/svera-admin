"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const CATEGORIES = [
  { value: "general_news", label: "General News" },
  { value: "birth_info", label: "Birth Registration Info" },
  { value: "marriage_info", label: "Marriage Registration Info" },
  { value: "death_info", label: "Death Registration Info" },
];

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/news", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to publish article.");
      setLoading(false);
    } else {
      router.push("/news");
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f0f4f8" }}>
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 fade-in">
          <Link href="/news" className="text-sm font-medium hover:underline" style={{ color: "#1a5276" }}>
            ← News
          </Link>
          <span style={{ color: "#dce6f0" }}>/</span>
          <h1 className="text-2xl font-extrabold" style={{ color: "#0d2137" }}>New Article</h1>
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
              <input name="title" type="text" required className="admin-input" placeholder="Article title..." />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Category <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <select name="category" required className="admin-input">
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Content <span style={{ color: "#c0392b" }}>*</span>
              </label>
              <textarea name="content" required className="admin-textarea" rows={8} placeholder="Write your article content here..." />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Featured Image <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              {imagePreview && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3 border" style={{ borderColor: "#dce6f0" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label
                className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition hover:opacity-80"
                style={{ border: "2px dashed #dce6f0", background: "#f8f9fc" }}
              >
                <span className="text-3xl mb-2">📷</span>
                <span className="text-sm font-medium" style={{ color: "#5d6d7e" }}>Click to upload image</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 10MB</span>
                <input
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
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
                {loading ? "Publishing..." : "🚀 Publish Article"}
              </button>
              <Link
                href="/news"
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
