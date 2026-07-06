"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, LogOut, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else if (pathname !== "/admin/login") {
      router.push("/admin/login");
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/");
  };

  if (loading) return null;

  if (!isAuthenticated && pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname === path ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-800 hover:text-white";

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-blue-900 text-white shrink-0">
        <div className="p-4 font-bold text-xl border-b border-blue-800">
          Admin Panel
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard')}`}>
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/submissions" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/submissions')}`}>
            <Users className="w-5 h-5" />
            จัดการการส่งงาน
          </Link>
          <Link href="/admin/topics" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/topics')}`}>
            <BookOpen className="w-5 h-5" />
            จัดการหัวข้อ/รอบ
          </Link>
          <Link href="/admin/teacher-submissions" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/teacher-submissions')}`}>
            <Users className="w-5 h-5" />
            ส่งงาน Role Teacher Model
          </Link>
          <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/settings')}`}>
            <Settings className="w-5 h-5" />
            ตั้งค่าระบบ
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-colors mt-8"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </div>
    </div>
  );
}
