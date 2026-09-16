"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
