"use client";

import { useEffect, useState } from "react";
import { fetchFromGas } from "@/lib/api";
import { Users, FileText, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetchFromGas('getAllData');
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  const submissions = data?.submissions || [];
  const topics = data?.topics || [];
  
  const totalSubmissions = submissions.length;
  const activeTopics = topics.filter((t: any) => t.IsOpen === 'true' || t.IsOpen === true).length;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard สถิติการส่งงาน</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">จำนวนการส่งงานทั้งหมด</p>
            <p className="text-3xl font-bold text-gray-800">{totalSubmissions}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">หัวข้อที่เปิดรับอยู่</p>
            <p className="text-3xl font-bold text-gray-800">{activeTopics}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-full text-purple-600">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">หัวข้อทั้งหมด</p>
            <p className="text-3xl font-bold text-gray-800">{topics.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">สถิติแยกตามหัวข้อ</h2>
        </div>
        <div className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัวข้อการอบรม</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">จำนวนที่ส่ง</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((t: any, idx: number) => {
                const count = submissions.filter((s: any) => s.TopicID === t.ID).length;
                const isOpen = t.IsOpen === 'true' || t.IsOpen === true;
                return (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{t.Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isOpen ? 'เปิดรับ' : 'ปิด'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
