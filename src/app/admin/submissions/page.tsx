"use client";

import { useEffect, useState } from "react";
import { fetchFromGas } from "@/lib/api";
import Swal from "sweetalert2";
import { Trash2, ExternalLink, Download } from "lucide-react";

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState("all");

  const load = async () => {
    setLoading(true);
    const res = await fetchFromGas('getAllData');
    if (res.success && res.submissions) {
      setSubmissions(res.submissions.reverse());
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบข้อมูลการส่งงานของ ${name} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (confirm.isConfirmed) {
      const res = await fetchFromGas('deleteSubmission', { id });
      if (res.success) {
        Swal.fire('ลบสำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
        load();
      } else {
        Swal.fire('เกิดข้อผิดพลาด', res.message || 'ไม่สามารถลบได้', 'error');
      }
    }
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      return Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลสำหรับส่งออก', 'info');
    }

    const BOM = "\uFEFF"; // สำหรับภาษาไทยใน Excel
    let csvContent = BOM + "ชื่อ-นามสกุล,หัวข้อการอบรม,รอบการส่ง,เวลาที่ส่ง\n";
    
    filteredSubmissions.forEach(sub => {
      // ป้องกันเครื่องหมายจุลภาค (,) ในข้อความทำไฟล์ CSV พัง
      const name = `"${sub.Prefix || ''}${sub.FirstName || ''} ${sub.LastName || ''}"`;
      const topic = `"${sub.TopicName || ''}"`;
      const round = `"${sub.RoundName || ''}"`;
      const time = `"${new Date(sub.Timestamp).toLocaleString('th-TH')}"`;
      
      csvContent += `${name},${topic},${round},${time}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ข้อมูลการส่งงาน_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topics = Array.from(new Set(submissions.map(s => s.TopicName))).filter(Boolean);
  const filteredSubmissions = filterTopic === "all" 
    ? submissions 
    : submissions.filter(s => s.TopicName === filterTopic);

  if (loading) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">จัดการข้อมูลการส่งงาน</h1>
        <div className="flex items-center gap-4">
          <select 
            className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm"
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
          >
            <option value="all">แสดงทุกหัวข้อ</option>
            {topics.map((t, idx) => (
              <option key={idx} value={t as string}>{t as string}</option>
            ))}
          </select>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100 whitespace-nowrap">
            จำนวนผู้ส่งงาน: {filteredSubmissions.length} คน
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หัวข้อ / รอบ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผลงาน</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((sub: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sub.Prefix} {sub.FirstName} {sub.LastName}</div>
                    <div className="text-xs text-gray-500">{new Date(sub.Timestamp).toLocaleString('th-TH')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sub.TopicName}</div>
                    <div className="text-xs text-blue-600">{sub.RoundName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {sub.FileLink ? (
                      <a href={sub.FileLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" /> ลิงก์
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(sub.ID, `${sub.FirstName} ${sub.LastName}`)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    ยังไม่มีข้อมูลการส่งงาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
