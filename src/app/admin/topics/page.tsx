"use client";

import { useEffect, useState } from "react";
import { fetchFromGas } from "@/lib/api";
import { formatDateThai } from "@/lib/formatDate";
import Swal from "sweetalert2";
import { Plus, Edit, Check, X, Trash2 } from "lucide-react";

export default function AdminTopics() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ id: '', name: '', date: '', isOpen: 'true', uploadType: 'file', timePeriod: 'allday' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetchFromGas('getAllData');
    if (res.success && res.topics) {
      setTopics(res.topics);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetchFromGas(newTopic.id ? 'updateTopic' : 'addTopic', newTopic);
    setSaving(false);
    
    if (res.success) {
      Swal.fire('สำเร็จ', newTopic.id ? 'อัปเดตหัวข้อเรียบร้อยแล้ว' : 'เพิ่มหัวข้อเรียบร้อยแล้ว', 'success');
      setShowAddForm(false);
      setNewTopic({ id: '', name: '', date: '', isOpen: 'true', uploadType: 'file', timePeriod: 'allday' });
      load();
    } else {
      Swal.fire('ข้อผิดพลาด', res.message || 'ไม่สามารถบันทึกหัวข้อได้', 'error');
    }
  };

  const handleEditTopic = (topic: any) => {
    setNewTopic({
      id: topic.ID,
      name: topic.Name,
      date: topic.Date,
      isOpen: topic.IsOpen.toString(),
      uploadType: topic.UploadType || 'file',
      timePeriod: topic.TimePeriod || 'allday'
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTopic = async (topicId: string, topicName: string) => {
    const confirm = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบหัวข้อ "${topicName}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (confirm.isConfirmed) {
      const res = await fetchFromGas('deleteTopic', { id: topicId });
      if (res.success) {
        Swal.fire('ลบสำเร็จ', 'ลบหัวข้อเรียบร้อยแล้ว', 'success');
        load();
      } else {
        Swal.fire('เกิดข้อผิดพลาด', res.message || 'ไม่สามารถลบได้', 'error');
      }
    }
  };

  const toggleStatus = async (topic: any) => {
    const newStatus = (topic.IsOpen === 'true' || topic.IsOpen === true) ? 'false' : 'true';
    const payload = {
      id: topic.ID,
      name: topic.Name,
      date: topic.Date,
      uploadType: topic.UploadType,
      timePeriod: topic.TimePeriod,
      isOpen: newStatus
    };
    
    // Optimistic UI update
    setTopics(topics.map(t => t.ID === topic.ID ? { ...t, IsOpen: newStatus } : t));
    
    const res = await fetchFromGas('updateTopic', payload);
    if (!res.success) {
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
      load(); // revert
    }
  };

  if (loading && topics.length === 0) {
    return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการหัวข้อการอบรม</h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'ปิดฟอร์ม' : 'เพิ่มหัวข้อ'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold mb-4">{newTopic.id ? 'แก้ไขหัวข้อ' : 'เพิ่มหัวข้อใหม่'}</h2>
          <form onSubmit={handleAddTopic} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อการอบรม</label>
              <input 
                type="text" 
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                value={newTopic.name}
                onChange={e => setNewTopic({...newTopic, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
              <input 
                type="date" 
                required
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                value={newTopic.date}
                onChange={e => setNewTopic({...newTopic, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รูปแบบการส่งงาน</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                value={newTopic.uploadType}
                onChange={e => setNewTopic({...newTopic, uploadType: e.target.value})}
              >
                <option value="file">อัปโหลดไฟล์ (PDF, ภาพ)</option>
                <option value="link">แนบลิงก์ URL</option>
                <option value="both">ไฟล์ หรือ ลิงก์ (ให้ผู้ใช้เลือกเอง)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-black"
                value={newTopic.isOpen}
                onChange={e => setNewTopic({...newTopic, isOpen: e.target.value})}
              >
                <option value="true">เปิดรับ</option>
                <option value="false">ปิดรับ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลาส่งงาน</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border text-black"
                value={newTopic.timePeriod}
                onChange={e => setNewTopic({...newTopic, timePeriod: e.target.value})}
              >
                <option value="allday">ครั้งเดียว (หน้าฟอร์มจะไม่แสดงให้เลือก)</option>
                <option value="morning">เฉพาะรอบเช้า</option>
                <option value="afternoon">เฉพาะรอบบ่าย</option>
                <option value="both">เช้าและบ่าย (ให้ผู้ใช้เลือกรอบเอง)</option>
              </select>
            </div>
            <div className="md:col-span-2 mt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อการอบรม</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รูปแบบการส่ง</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ช่วงเวลา</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เปิด/ปิด รับงาน</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topics.map((topic, idx) => {
                const isOpen = topic.IsOpen === 'true' || topic.IsOpen === true;
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {topic.Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateThai(topic.Date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.UploadType === 'file' ? 'อัปโหลดไฟล์' : topic.UploadType === 'link' ? 'แนบลิงก์ URL' : 'ไฟล์ หรือ ลิงก์'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.TimePeriod === 'morning' ? 'เฉพาะรอบเช้า' : 
                       topic.TimePeriod === 'afternoon' ? 'เฉพาะรอบบ่าย' : 
                       topic.TimePeriod === 'both' ? 'เช้าและบ่าย' : 'ครั้งเดียว'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(topic)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isOpen ? 'bg-green-500' : 'bg-gray-200'}`}
                        role="switch"
                        aria-checked={isOpen}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOpen ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {isOpen ? 'เปิด' : 'ปิด'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditTopic(topic)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors mr-2"
                        title="แก้ไขข้อมูล"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTopic(topic.ID, topic.Name)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="ลบหัวข้อ"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
