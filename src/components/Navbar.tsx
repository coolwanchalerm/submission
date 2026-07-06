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
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
              <ClipboardList className="w-6 h-6" />
              <span>ระบบส่งงาน</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            {showTeacherMenu && (
              <Link 
                href="/teacher" 
                className="text-amber-200 hover:text-white hover:bg-amber-600/50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                ส่งงาน Role Teacher Model
              </Link>
            )}
            <Link 
              href="/search" 
              className="text-blue-100 hover:text-white hover:bg-blue-500/50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              ค้นหา
            </Link>
            <Link 
              href="/admin/login" 
              className="text-blue-100 hover:text-white hover:bg-blue-500/50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              แอดมิน
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
