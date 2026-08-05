"use client";
import React, { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Mobile Header Top Bar */}
      <div 
        className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 z-50 text-white shadow-md w-full"
        style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a5276 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-[10px] shadow"
            style={{ background: "rgba(192,57,43,0.8)" }}
          >
            SV
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight">Admin Portal</p>
            <p className="text-blue-300 text-[9px] leading-tight">SVERA</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none p-1 hover:bg-white/10 rounded-lg transition"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-x-0 top-[61px] bottom-0 z-40 flex flex-col text-white animate-fade-in"
          style={{ background: "rgba(13, 33, 55, 0.96)", backdropFilter: "blur(12px)" }}
        >
          <nav className="flex-1 px-4 py-6 space-y-2">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
                  style={
                    active
                      ? { background: "rgba(255,255,255,0.15)", color: "#fff" }
                      : { color: "rgba(255,255,255,0.75)" }
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10 mb-8">
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (visible only on large screens) */}
      <aside
        className="hidden lg:flex flex-col w-60 min-h-screen shrink-0 sticky top-0"
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
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
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
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
