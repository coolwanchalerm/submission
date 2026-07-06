"use client";

import { useEffect, useState } from "react";
import { fetchFromGas } from "@/lib/api";
import { formatDateThai } from "@/lib/formatDate";
import Swal from "sweetalert2";
import { FileSpreadsheet, Trash2, ImageIcon, FileText } from "lucide-react";
import * as XLSX from "xlsx";

interface TeacherSubmission {
  ID: string;
  Timestamp: string;
  Prefix: string;
  FirstName: string;
  LastName: string;
  Subject: string;
  Topic: string;
  GradeLevel: string;
  ImageLinks: string;
}

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const res = await fetchFromGas("getAllData");
    if (res.success) {
      setSubmissions(res.teacherSubmissions || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบข้อมูลนี้และไฟล์รูปภาพจาก Drive ใช่หรือไม่?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await fetchFromGas('deleteTeacherSubmission', { id });
      if (res.success) {
        Swal.fire('ลบสำเร็จ!', 'ข้อมูลและรูปภาพถูกลบแล้ว', 'success');
        fetchData();
      } else {
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    if (submissions.length === 0) {
      Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลสำหรับการ Export', 'warning');
      return;
    }

    const exportData = filteredSubmissions.map((s, index) => ({
      'ลำดับ': index + 1,
      'ชื่อ-นามสกุล': `${s.Prefix}${s.FirstName} ${s.LastName}`,
      'วิชา': s.Subject,
      'เรื่อง': s.Topic,
      'ระดับชั้น': s.GradeLevel,
      'เวลาที่ส่ง': formatDateThai(s.Timestamp),
      'ลิงก์รูปภาพ': s.ImageLinks
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet, { strip: false });
    
    // Add BOM for Excel Thai UTF-8 support
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvOutput], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `teacher_submissions_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubmissions = submissions.filter(s => 
    `${s.FirstName} ${s.LastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderImageLinks = (linksStr: string) => {
    if (!linksStr) return <span className="text-gray-400">-</span>;
    const links = linksStr.split(', ');
    return (
      <div className="flex flex-col gap-1">
        {links.map((link, idx) => (
          <a 
            key={idx}
            href={link} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ImageIcon className="w-3 h-3" /> ภาพที่ {idx + 1}
          </a>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูลการส่งงานของครู...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          การส่งงาน (Role Teacher Model)
        </h1>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSeNvM0A1lAWmVz-Unf5oiaGXaPx8m9PkQRnmpiHLyR2xFs2Sw/viewform?usp=publish-editor" 
            target="_blank" 
            rel="noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline mr-2"
          >
            ดูไฟล์วิดีโอ (Google Form)
          </a>
          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
            ทั้งหมด {filteredSubmissions.length} รายการ
          </span>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <input 
            type="text"
            placeholder="ค้นหาชื่อ, วิชา, หรือเรื่อง..."
            className="flex-1 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิชาที่สอน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับชั้น</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เรื่อง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลาที่ส่ง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ไฟล์แนบ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลการส่งงาน
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.ID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sub.Prefix}{sub.FirstName} {sub.LastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.Subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.GradeLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.Topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateThai(sub.Timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderImageLinks(sub.ImageLinks)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(sub.ID)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors ml-2 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
