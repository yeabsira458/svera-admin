"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";

type Post = {
  id: string; title: string; content: string;
  category: string; image_url: string | null; created_at: string;
  author?: { full_name: string };
};

const CATEGORY_LABELS: Record<string, string> = {
  birth_info: "Birth Registration", marriage_info: "Marriage Registration",
  death_info: "Death Registration", general_news: "General News",
};
const CATEGORY_COLORS: Record<string, string> = {
  birth_info: "#27ae60", marriage_info: "#8e44ad",
  death_info: "#7f8c8d", general_news: "#1a5276",
};

export default function AdminNewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  async function fetchPosts() {
    const res = await fetch("/api/news");
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this news article? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    await fetchPosts();
    setDeleting(null);
  }

  const filtered = filter === "all" ? posts : posts.filter((p) => p.category === filter);
  const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex min-h-screen" style={{ background: "#f0f4f8" }}>
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#0d2137" }}>News Articles</h1>
            <p className="text-sm" style={{ color: "#5d6d7e" }}>{posts.length} articles published</p>
          </div>
          <Link
            href="/news/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:opacity-90 transition hover:scale-105"
            style={{ background: "linear-gradient(135deg, #1a5276, #1f618d)" }}
          >
            <span>+</span> New Article
          </Link>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6 fade-in">
          {["all", "birth_info", "marriage_info", "death_info", "general_news"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={
                filter === cat
                  ? { background: "#1a5276", color: "#fff" }
                  : { background: "#fff", color: "#1a5276", border: "1px solid #dce6f0" }
              }
            >
              {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
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
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium text-gray-500">No articles yet.</p>
            <Link href="/news/new" className="text-sm font-semibold hover:underline mt-2 inline-block" style={{ color: "#1a5276" }}>
              Create your first article →
            </Link>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 hover:shadow-md transition-all duration-200"
                style={{ border: "1px solid #dce6f0" }}
              >
                {/* Thumbnail */}
                {post.image_url ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "linear-gradient(135deg, #eaf0fb, #dce6f0)" }}
                  >
                    📰
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="badge text-white"
                      style={{ background: CATEGORY_COLORS[post.category] ?? "#1a5276" }}
                    >
                      {CATEGORY_LABELS[post.category] ?? post.category}
                    </span>
                    <span className="text-xs" style={{ color: "#5d6d7e" }}>{formatDate(post.created_at)}</span>
                  </div>
                  <h3 className="font-bold text-sm truncate" style={{ color: "#0d2137" }}>{post.title}</h3>
                  <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "#5d6d7e" }}>{post.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/news/${post.id}/edit`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:scale-105"
                    style={{ background: "#eaf0fb", color: "#1a5276" }}
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleting === post.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:scale-105 disabled:opacity-50"
                    style={{ background: "#fdf2f2", color: "#c0392b" }}
                  >
                    {deleting === post.id ? "..." : "🗑️ Delete"}
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
