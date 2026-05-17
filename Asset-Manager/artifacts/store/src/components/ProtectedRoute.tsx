import { useEffect, useState } from "react";
import { Redirect } from "wouter";
import { useAdminMe } from "@workspace/api-client-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: admin, isLoading, error } = useAdminMe();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحقق...</div>;
  }
  
  if (!admin || error) {
    return <Redirect to="/admin/login" />;
  }
  
  return <>{children}</>;
}
