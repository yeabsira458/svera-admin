"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";

type Event = {
  id: string; title: string; description: string | null;
  event_date: string; location: string | null; image_url: string | null;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchEvents(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await fetchEvents();
    setDeleting(null);
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  const upcoming = events.filter((e) => new Date(e.event_date) >= new Date());
  const past = events.filter((e) => new Date(e.event_date) < new Date());

  return (
    <div className="flex min-h-screen" style={{ background: "#f0f4f8" }}>
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#0d2137" }}>Events</h1>
            <p className="text-sm" style={{ color: "#5d6d7e" }}>
              {upcoming.length} upcoming · {past.length} past
            </p>
          </div>
          <Link
            href="/events/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition hover:scale-105"
            style={{ background: "linear-gradient(135deg, #c0392b, #922b21)" }}
          >
            <span>+</span> New Event
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl skeleton" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white" style={{ border: "1px dashed #dce6f0" }}>
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium text-gray-500">No events yet.</p>
            <Link href="/events/new" className="text-sm font-semibold hover:underline mt-2 inline-block" style={{ color: "#1a5276" }}>
              Create your first event →
            </Link>
          </div>
        ) : (
          <div className="space-y-8 fade-in">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#1a5276" }}>📅 Upcoming</h2>
                <div className="space-y-4">
                  {upcoming.map((ev) => (
                    <EventRow key={ev.id} ev={ev} formatDate={formatDate} deleting={deleting} onDelete={handleDelete} isPast={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#7f8c8d" }}>🕐 Past Events</h2>
                <div className="space-y-4 opacity-70">
                  {past.map((ev) => (
                    <EventRow key={ev.id} ev={ev} formatDate={formatDate} deleting={deleting} onDelete={handleDelete} isPast={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EventRow({ ev, formatDate, deleting, onDelete, isPast }: {
  ev: Event;
  formatDate: (d: string) => string;
  deleting: string | null;
  onDelete: (id: string) => void;
  isPast: boolean;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl bg-white p-4 hover:shadow-md transition-all duration-200"
      style={{ border: "1px solid #dce6f0" }}
    >
      {/* Date block */}
      <div
        className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white shadow"
        style={{ background: isPast ? "#95a5a6" : "linear-gradient(135deg, #1a5276, #1f618d)" }}
      >
        <span className="text-lg font-extrabold leading-none">{new Date(ev.event_date).getDate()}</span>
        <span className="text-[10px] uppercase leading-none">{new Date(ev.event_date).toLocaleString("default", { month: "short" })}</span>
      </div>

      {/* Image */}
      {ev.image_url && (
        <div className="relative w-16 h-14 rounded-xl overflow-hidden shrink-0">
          <Image src={ev.image_url} alt={ev.title} fill className="object-cover" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm truncate mb-0.5" style={{ color: "#0d2137" }}>{ev.title}</h3>
        {ev.description && <p className="text-xs line-clamp-1 mb-0.5" style={{ color: "#5d6d7e" }}>{ev.description}</p>}
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "#5d6d7e" }}>
          <span>📆 {formatDate(ev.event_date)}</span>
          {ev.location && <span>📍 {ev.location}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/events/${ev.id}/edit`}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:scale-105"
          style={{ background: "#eaf0fb", color: "#1a5276" }}
        >
          ✏️ Edit
        </Link>
        <button
          onClick={() => onDelete(ev.id)}
          disabled={deleting === ev.id}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:scale-105 disabled:opacity-50"
          style={{ background: "#fdf2f2", color: "#c0392b" }}
        >
          {deleting === ev.id ? "..." : "🗑️ Delete"}
        </button>
      </div>
    </div>
  );
}
