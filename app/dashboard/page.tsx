import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch stats in parallel
  const [
    { count: newsCount },
    { count: eventsCount },
    { data: recentNews },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("id, title, category, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("events").select("id, title, event_date, location").order("event_date", { ascending: true }).limit(5),
  ]);

  const CATEGORY_LABELS: Record<string, string> = {
    birth_info: "Birth",
    marriage_info: "Marriage",
    death_info: "Death",
    general_news: "General",
  };
  const CATEGORY_COLORS: Record<string, string> = {
    birth_info: "#27ae60",
    marriage_info: "#8e44ad",
    death_info: "#7f8c8d",
    general_news: "#1a5276",
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ background: "#f0f4f8" }}>
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="fade-in mb-8">
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#0d2137" }}>Dashboard</h1>
          <p style={{ color: "#5d6d7e", fontSize: "0.875rem" }}>Welcome back. Here's what's happening at SVERA.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 fade-in">
          {[
            { label: "Total News Articles", value: newsCount ?? 0, icon: "📰", color: "#1a5276", href: "/news" },
            { label: "Total Events", value: eventsCount ?? 0, icon: "📅", color: "#8e44ad", href: "/events" },
            { label: "Upcoming Events", value: (recentEvents?.filter(e => new Date(e.event_date) >= new Date()) ?? []).length, icon: "🗓️", color: "#27ae60", href: "/events" },
            { label: "This Month's News", value: (recentNews?.filter(n => new Date(n.created_at).getMonth() === new Date().getMonth()) ?? []).length, icon: "📢", color: "#c0392b", href: "/news" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div
                className="rounded-2xl p-5 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                style={{ border: "1px solid #dce6f0" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{stat.icon}</div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${stat.color}18`, color: stat.color }}
                  >
                    View
                  </span>
                </div>
                <div className="text-3xl font-extrabold mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <p className="text-sm font-medium" style={{ color: "#5d6d7e" }}>{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 fade-in">
          <Link href="/news/new">
            <div
              className="flex items-center gap-4 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #1a5276, #1f618d)", color: "#fff" }}
            >
              <div className="text-3xl">✏️</div>
              <div>
                <p className="font-bold text-sm">Create News Article</p>
                <p className="text-blue-200 text-xs mt-0.5">Publish a new announcement or update</p>
              </div>
              <span className="ml-auto text-xl opacity-50">→</span>
            </div>
          </Link>
          <Link href="/events/new">
            <div
              className="flex items-center gap-4 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #c0392b, #922b21)", color: "#fff" }}
            >
              <div className="text-3xl">📅</div>
              <div>
                <p className="font-bold text-sm">Create New Event</p>
                <p className="text-red-200 text-xs mt-0.5">Schedule an upcoming event for citizens</p>
              </div>
              <span className="ml-auto text-xl opacity-50">→</span>
            </div>
          </Link>
        </div>

        {/* Recent content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
          {/* Recent News */}
          <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #dce6f0" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: "#0d2137" }}>Recent News</h2>
              <Link href="/news" className="text-xs font-semibold hover:underline" style={{ color: "#1a5276" }}>
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {!recentNews || recentNews.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No news articles yet.</p>
              ) : (
                recentNews.map((post) => (
                  <div key={post.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "#f0f4f8" }}>
                    <span
                      className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ background: CATEGORY_COLORS[post.category] ?? "#1a5276" }}
                    >
                      {CATEGORY_LABELS[post.category] ?? post.category}
                    </span>
                    <p className="flex-1 text-sm font-medium truncate" style={{ color: "#0d2137" }}>{post.title}</p>
                    <span className="text-xs shrink-0" style={{ color: "#5d6d7e" }}>{formatDate(post.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #dce6f0" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm" style={{ color: "#0d2137" }}>Upcoming Events</h2>
              <Link href="/events" className="text-xs font-semibold hover:underline" style={{ color: "#1a5276" }}>
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {!recentEvents || recentEvents.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No events scheduled yet.</p>
              ) : (
                recentEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "#f0f4f8" }}>
                    <div
                      className="shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ background: "linear-gradient(135deg, #1a5276, #1f618d)" }}
                    >
                      <span className="text-sm font-extrabold leading-none">{new Date(ev.event_date).getDate()}</span>
                      <span className="text-[9px] uppercase leading-none">{new Date(ev.event_date).toLocaleString("default", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#0d2137" }}>{ev.title}</p>
                      {ev.location && <p className="text-xs truncate" style={{ color: "#5d6d7e" }}>📍 {ev.location}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
