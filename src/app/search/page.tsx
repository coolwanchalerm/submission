"use client";

import { useState, useEffect } from "react";
import { fetchFromGas } from "@/lib/api";
import { Search as SearchIcon, FileText, ExternalLink } from "lucide-react";

export default function SearchPage() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTopic, setFilterTopic] = useState("all");
  const [openTopics, setOpenTopics] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const res = await fetchFromGas('getAllData');
      if (res.success && res.submissions) {
        // Reverse to show latest first
        setData(res.submissions.reverse());
        setFilteredData(res.submissions);
        
        if (res.topics) {
          const open = res.topics.filter((t: any) => t.IsOpen === 'true' || t.IsOpen === true);
          setOpenTopics(open.map((t: any) => t.Name));
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    let filtered = data;
    if (filterTopic !== "all") {
      filtered = filtered.filter(item => item.TopicName === filterTopic);
    }
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.FirstName?.toLowerCase().includes(lower) ||
        item.LastName?.toLowerCase().includes(lower) ||
        item.TopicName?.toLowerCase().includes(lower)
      );
    }
    
    setFilteredData(filtered);
  }, [searchTerm, data, filterTopic]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ค้นหารายชื่อการส่งงาน</h1>
            <p className="text-gray-500 text-sm mt-1">ตรวจสอบสถานะการส่งงานของคุณ</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <select 
              className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-sm"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
            >
              <option value="all">ทุกหัวข้อการอบรม</option>
              {openTopics.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
            
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ค้นหาชื่อ, นามสกุล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หัวข้อการอบรม</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รอบ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ส่ง</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.Prefix} {item.FirstName} {item.LastName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.TopicName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.RoundName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.Timestamp).toLocaleString('th-TH')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        ไม่พบข้อมูลการส่งงาน
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
