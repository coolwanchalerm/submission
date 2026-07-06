"use client";

import Link from 'next/link';
import { ClipboardList, Search, ShieldCheck, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchFromGas } from '@/lib/api';

export default function Navbar() {
  const [showTeacherMenu, setShowTeacherMenu] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetchFromGas('getDataForForm');
        if (res.success && res.settings) {
          setShowTeacherMenu(res.settings.TeacherMenuEnabled === 'true' || res.settings.TeacherMenuEnabled === true);
        }
      } catch(e) {
        // ignore
      }
    }
    loadSettings();
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg sm:text-xl tracking-wide whitespace-nowrap">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="hidden xs:inline sm:inline">ระบบส่งงาน</span>
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
            {showTeacherMenu && (
              <Link 
                href="/teacher" 
                className="text-amber-200 hover:text-white hover:bg-amber-600/50 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">ส่งงาน Role Teacher Model</span>
                <span className="sm:hidden">ครู</span>
              </Link>
            )}
            <Link 
              href="/search" 
              className="text-blue-100 hover:text-white hover:bg-blue-500/50 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>ค้นหา</span>
            </Link>
            <Link 
              href="/admin/login" 
              className="text-blue-100 hover:text-white hover:bg-blue-500/50 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">แอดมิน</span>
              <span className="sm:hidden">แอดมิน</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
