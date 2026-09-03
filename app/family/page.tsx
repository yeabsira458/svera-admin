"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

type FamilyReg = {
  id: string;
  title: string;
  description: string;
  type: "resident_id" | "marriage_cert";
  requirements: string[];
  document_url: string | null;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  resident_id: "Resident ID",
  marriage_cert: "Marriage Certificate",
};

const TYPE_COLORS: Record<string, string> = {
  resident_id: "#e67e22", // Orange
  marriage_cert: "#e74c3c", // Red
};

export default function AdminFamilyPage() {
  const [items, setItems] = useState<FamilyReg[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  async function fetchItems() {
    const res = await fetch("/api/family");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this family registration guide? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/family/${id}`, { method: "DELETE" });
    await fetchItems();
    setDeleting(null);
  }

  const filtered = filter === "all" ? items : items.filter((p) => p.type === filter);
  const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f0f4f8" }}>
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-in">
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#0d2137" }}>Family Registrations</h1>
            <p className="text-sm" style={{ color: "#5d6d7e" }}>{items.length} guides published</p>
          </div>
          <Link
            href="/family/new"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition hover:scale-105 w-full sm:w-auto text-center"
            style={{ background: "linear-gradient(135deg, #1a5276, #1f618d)" }}
          >
            <span>+</span> New Guide
          </Link>
        </div>

        {/* Type filter */}
        <div className="flex flex-wrap gap-2 mb-6 fade-in">
          {["all", "resident_id", "marriage_cert"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                filter === t
                  ? { background: "#1a5276", color: "#fff" }
                  : { background: "#fff", color: "#1a5276", border: "1px solid #dce6f0" }
              }
            >
              {t === "all" ? "All" : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white" style={{ border: "1px dashed #dce6f0" }}>
            <p className="text-4xl mb-3">🗂️</p>
            <p className="font-medium text-gray-500">No family registration guides yet.</p>
            <Link href="/family/new" className="text-sm font-semibold hover:underline mt-2 inline-block" style={{ color: "#1a5276" }}>
              Create your first guide →
            </Link>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl bg-white p-4 hover:shadow-md transition-all duration-200"
                style={{ border: "1px solid #dce6f0" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${TYPE_COLORS[item.type]}15`, color: TYPE_COLORS[item.type] }}
                >
                  {item.type === "resident_id" ? "🪪" : "💍"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="badge text-white"
                      style={{ background: TYPE_COLORS[item.type] ?? "#1a5276" }}
                    >
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                    <span className="text-xs" style={{ color: "#5d6d7e" }}>{formatDate(item.created_at)}</span>
                  </div>
                  <h3 className="font-bold text-sm truncate" style={{ color: "#0d2137" }}>{item.title}</h3>
                  <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "#5d6d7e" }}>{item.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 sm:ml-auto w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  <Link
                    href={`/family/${item.id}/edit`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:scale-105"
                    style={{ background: "#eaf0fb", color: "#1a5276" }}
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:scale-105 disabled:opacity-50"
                    style={{ background: "#fdf2f2", color: "#c0392b" }}
                  >
                    {deleting === item.id ? "..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
