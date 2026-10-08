import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

export function Protected({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-sm text-ink/50">Loading session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/brand"} replace />;
  }
  return <>{children}</>;
}
