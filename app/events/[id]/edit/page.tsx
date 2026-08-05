"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

type Event = { id: string; title: string; description: string | null; event_date: string; location: string | null; image_url: string | null; };

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: Event[]) => {
        const found = data.find((e) => e.id === id);
        if (found) { setEvent(found); setImagePreview(found.image_url); }
      });
  }, [id]);

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
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/events/${id}`, { method: "PUT", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to update event.");
      setLoading(false);
    } else {
      router.push("/events");
    }
  }

  // Format datetime-local value
  const toDatetimeLocal = (d: string) => {
    const date = new Date(d);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  if (!event) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f0f4f8" }}>
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading event...</p>
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
          <Link href="/events" className="text-sm font-medium hover:underline" style={{ color: "#1a5276" }}>← Events</Link>
          <span style={{ color: "#dce6f0" }}>/</span>
          <h1 className="text-2xl font-extrabold" style={{ color: "#0d2137" }}>Edit Event</h1>
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
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Event Title <span style={{ color: "#c0392b" }}>*</span></label>
              <input name="title" type="text" required defaultValue={event.title} className="admin-input" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Description</label>
              <textarea name="description" className="admin-textarea" rows={4} defaultValue={event.description ?? ""} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Date & Time <span style={{ color: "#c0392b" }}>*</span></label>
                <input name="event_date" type="datetime-local" required defaultValue={toDatetimeLocal(event.event_date)} className="admin-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>Location</label>
                <input name="location" type="text" defaultValue={event.location ?? ""} className="admin-input" placeholder="Venue or address" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#0d2137" }}>
                Event Image <span className="text-gray-400 font-normal">(upload new to replace)</span>
              </label>
              {imagePreview && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3 border" style={{ borderColor: "#dce6f0" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label
                className="flex flex-col items-center justify-center w-full h-24 rounded-xl cursor-pointer transition hover:opacity-80"
                style={{ border: "2px dashed #dce6f0", background: "#f8f9fc" }}
              >
                <span className="text-sm font-medium" style={{ color: "#5d6d7e" }}>🖼️ Click to upload new image</span>
                <input type="file" name="imageFile" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition hover:scale-105 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #c0392b, #922b21)" }}
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
              <Link href="/events" className="px-5 py-2.5 rounded-xl text-sm font-semibold transition" style={{ background: "#eaf0fb", color: "#1a5276" }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
