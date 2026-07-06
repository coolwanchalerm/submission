"use client";

import { useEffect, useState } from "react";
import { fetchFromGas } from "@/lib/api";
import Swal from "sweetalert2";
import { Settings, Save } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [teacherMenuEnabled, setTeacherMenuEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetchFromGas('getAllData');
      if (res.success && res.settings) {
        setTeacherMenuEnabled(res.settings.TeacherMenuEnabled === 'true' || res.settings.TeacherMenuEnabled === true);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetchFromGas('toggleTeacherMenu', { enabled: teacherMenuEnabled });
    setSaving(false);
    if (res.success) {
      Swal.fire('บันทึกสำเร็จ', 'อัปเดตการตั้งค่าเรียบร้อยแล้ว', 'success').then(() => {
        // Just show success, navbar might need full reload to update
        window.location.reload();
      });
    } else {
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกได้', 'error');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูลการตั้งค่า...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          ตั้งค่าระบบ
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="pr-8">
              <h3 className="text-lg font-medium text-gray-900">เปิดใช้งานเมนู "ส่งงาน (สำหรับครู)"</h3>
              <p className="text-sm text-gray-500 mt-1">
                หากเปิดใช้งาน จะมีเมนูสำหรับครูให้กรอกข้อมูล วิชา, เรื่อง, ระดับชั้น และสามารถอัปโหลดรูปภาพหลายรูป พร้อมแสดงลิงก์ฟอร์มสำหรับอัปโหลดวิดีโอ
              </p>
            </div>
            <div>
              <button 
                onClick={() => setTeacherMenuEnabled(!teacherMenuEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${teacherMenuEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
                role="switch"
                aria-checked={teacherMenuEnabled}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${teacherMenuEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
