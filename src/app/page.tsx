"use client";

import { useState, useEffect } from "react";
import { fetchFromGas } from "@/lib/api";
import { formatDateThai } from "@/lib/formatDate";
import Swal from "sweetalert2";
import { UploadCloud, Link as LinkIcon, Send } from "lucide-react";

export default function Home() {
  const [topics, setTopics] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    prefix: "นาย",
    firstName: "",
    lastName: "",
    topicId: "",
    roundId: "",
    link: "",
  });
  const [fileData, setFileData] = useState<{ base64: string, name: string } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file');

  useEffect(() => {
    async function loadData() {
      const res = await fetchFromGas('getDataForForm');
      if (res.success) {
        setTopics(res.topics || []);
        setRounds(res.rounds || []);
      } else {
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลหัวข้อได้', 'error');
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    setFormData({ ...formData, topicId: tId });
    const topic = topics.find(t => t.ID === tId);
    setSelectedTopic(topic);
    setFileData(null); // reset file when topic changes
    if (topic) {
      setUploadMethod(topic.UploadType === 'link' ? 'link' : 'file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('ขนาดไฟล์เกิน', 'กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 5MB', 'warning');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData({
          base64: event.target?.result as string,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFileData(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topicId) {
      return Swal.fire('กรุณาเลือกหัวข้อ', '', 'warning');
    }
    let submitRoundId = formData.roundId;
    if (selectedTopic?.TimePeriod && selectedTopic.TimePeriod !== 'both') {
      if (selectedTopic.TimePeriod === 'morning') submitRoundId = 'R1';
      else if (selectedTopic.TimePeriod === 'afternoon') submitRoundId = 'R2';
      else if (selectedTopic.TimePeriod === 'allday') submitRoundId = 'ครั้งเดียว';
    }

    if (!submitRoundId) {
      return Swal.fire('กรุณาเลือกรอบ', '', 'warning');
    }
    if (uploadMethod === 'file' && !fileData) {
      return Swal.fire('กรุณาแนบไฟล์', '', 'warning');
    }
    if (uploadMethod === 'link' && !formData.link) {
      return Swal.fire('กรุณาระบุลิงก์ผลงาน', '', 'warning');
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      roundId: submitRoundId,
      fileData: uploadMethod === 'file' ? fileData?.base64 : undefined,
      fileName: uploadMethod === 'file' ? fileData?.name : undefined,
      link: uploadMethod === 'link' ? formData.link : ''
    };

    const res = await fetchFromGas('submitWork', payload);
    setSubmitting(false);

    if (res.success) {
      Swal.fire({
        title: 'ส่งงานสำเร็จ!',
        text: 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        // Reset form except prefix, firstName, lastName
        setFormData({
          ...formData,
          topicId: "",
          roundId: "",
          link: "",
        });
        setFileData(null);
        setSelectedTopic(null);
      });
    } else {
      Swal.fire('เกิดข้อผิดพลาด', res.message || 'ไม่สามารถส่งงานได้', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 px-6 py-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">ส่งผลงานการอบรม</h1>
          <p className="text-blue-100">กรุณากรอกข้อมูลและแนบผลงานให้ครบถ้วน</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-black mb-1">คำนำหน้า</label>
              <select 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border text-black"
                value={formData.prefix}
                onChange={e => setFormData({...formData, prefix: e.target.value})}
                required
              >
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div className="md:col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">ชื่อ</label>
              <input 
                type="text" 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border text-black"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                required
                placeholder="สมชาย"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black mb-1">นามสกุล</label>
              <input 
                type="text" 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border text-black"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                required
                placeholder="ใจดี"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">หัวข้อการอบรม</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border text-black"
              value={formData.topicId}
              onChange={handleTopicChange}
              required
            >
              <option value="">-- เลือกหัวข้อการอบรม --</option>
              {topics.map(t => (
                <option key={t.ID} value={t.ID}>{t.Name} ({formatDateThai(t.Date)})</option>
              ))}
            </select>
          </div>

          {(!selectedTopic || !selectedTopic.TimePeriod || selectedTopic.TimePeriod === 'both') ? (
            <div>
              <label className="block text-sm font-medium text-black mb-1">รอบการส่งงาน</label>
              <div className="grid grid-cols-2 gap-4">
                {rounds.map(r => (
                  <label key={r.ID} className={`cursor-pointer border rounded-lg p-4 flex items-center text-center justify-center transition-colors ${formData.roundId === r.ID ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="round" 
                      value={r.ID} 
                      className="sr-only"
                      checked={formData.roundId === r.ID}
                      onChange={e => setFormData({...formData, roundId: e.target.value})}
                      required={!selectedTopic?.TimePeriod || selectedTopic.TimePeriod === 'both'}
                    />
                    <span className="font-medium">{r.Name}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : selectedTopic.TimePeriod !== 'allday' && (
            <div>
              <label className="block text-sm font-medium text-black mb-1">รอบการส่งงาน</label>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium text-center">
                {selectedTopic.TimePeriod === 'morning' ? 'รอบเช้า (กำหนดโดยหัวข้อ)' : 'รอบบ่าย (กำหนดโดยหัวข้อ)'}
              </div>
            </div>
          )}

          {selectedTopic && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  {uploadMethod === 'file' ? <UploadCloud className="text-blue-500" /> : <LinkIcon className="text-blue-500" />}
                  {uploadMethod === 'file' ? 'แนบไฟล์ผลงาน' : 'แนบลิงก์ผลงาน'}
                </h3>
                {selectedTopic.UploadType === 'both' && (
                  <div className="flex bg-gray-200 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${uploadMethod === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      ไฟล์
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('link')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${uploadMethod === 'link' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      ลิงก์
                    </button>
                  </div>
                )}
              </div>
              
              {uploadMethod === 'file' ? (
                <div>
                  <input 
                    type="file" 
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 5MB</p>
                </div>
              ) : (
                <div>
                  <input 
                    type="url" 
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border text-black"
                    value={formData.link}
                    onChange={e => setFormData({...formData, link: e.target.value})}
                    placeholder="https://..."
                    required
                  />
                </div>
              )}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={submitting || !selectedTopic}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งผลงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
