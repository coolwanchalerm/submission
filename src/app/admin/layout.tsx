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
      <div className="w-full md:w-64 bg-blue-900 text-white shrink-0 md:h-auto">
        <div className="p-4 font-bold text-xl border-b border-blue-800">
          Admin Panel
        </div>
        <nav className="p-2 sm:p-4 flex overflow-x-auto md:flex-col gap-2 md:space-y-2 no-scrollbar">
          <Link href="/admin/dashboard" className={`flex shrink-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isActive('/admin/dashboard')}`}>
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
            Dashboard
          </Link>
          <Link href="/admin/submissions" className={`flex shrink-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isActive('/admin/submissions')}`}>
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            จัดการการส่งงาน
          </Link>
          <Link href="/admin/topics" className={`flex shrink-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isActive('/admin/topics')}`}>
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            จัดการหัวข้อ/รอบ
          </Link>
          <Link href="/admin/teacher-submissions" className={`flex shrink-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isActive('/admin/teacher-submissions')}`}>
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            ส่งงาน Role Teacher Model
          </Link>
          <Link href="/admin/settings" className={`flex shrink-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${isActive('/admin/settings')}`}>
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            ตั้งค่าระบบ
          </Link>
          <button 
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-colors md:mt-8 whitespace-nowrap text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            ออกจากระบบ
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-auto w-full">
        {children}
      </div>
    </div>
  );
}
