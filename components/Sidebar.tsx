"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/utils/supabase/client";

const NAV = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/news", icon: "📰", label: "News" },
  { href: "/events", icon: "📅", label: "Events" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="flex flex-col w-60 min-h-screen shrink-0"
      style={{ background: "linear-gradient(180deg, #0d2137 0%, #1a5276 100%)" }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow"
            style={{ background: "rgba(192,57,43,0.8)" }}
          >
            SVERA
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight">Admin Portal</p>
            <p className="text-blue-300 text-[10px] leading-tight">Content Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={
                active
                  ? { background: "rgba(255,255,255,0.15)", color: "#fff" }
                  : { color: "rgba(255,255,255,0.65)" }
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
