"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { Avatar } from "@/components/ui";

export function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user?.username ?? "your account"}`}
        className="flex cursor-pointer items-center gap-2 rounded-md p-1 hover:bg-slate-soft"
      >
        <Avatar name={user?.username ?? "?"} />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink md:block">
          {user?.username}
        </span>
        <svg viewBox="0 0 12 8" className="hidden h-2.5 w-3 text-ink-soft sm:block" fill="none" aria-hidden>
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-md border border-line bg-panel py-1 shadow-lg"
        >
          <div className="border-b border-line px-3 py-2 sm:hidden">
            <p className="truncate text-sm font-medium text-ink">{user?.username}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setShowChangePassword(true);
              setOpen(false);
            }}
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-ink hover:bg-slate-soft"
          >
            Change password
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-clay hover:bg-clay-soft"
          >
            Sign out
          </button>
        </div>
      )}

      {showChangePassword && (
        <ChangePasswordDialog onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
