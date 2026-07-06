"use client";

import { useState } from "react";
import { fetchFromGas } from "@/lib/api";
import Swal from "sweetalert2";
import { ExternalLink, UploadCloud, UserCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TeacherPage() {
  const [formData, setFormData] = useState({
    prefix: "นาย",
    firstName: "",
    lastName: "",
    subject: "",
    topic: "",
    gradeLevel: ""
  });
  
  const [fileDatas, setFileDatas] = useState<{ fileData: string, fileName: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [videoSubmitted, setVideoSubmitted] = useState(false);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      Swal.fire('บางไฟล์มีขนาดใหญ่เกินไป', 'ระบบละเว้นไฟล์ที่ขนาดใหญ่กว่า 5MB', 'warning');
    }

    const filePromises = validFiles.map(file => {
      return new Promise<{fileData: string, fileName: string}>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ fileData: e.target?.result as string, fileName: file.name });
        reader.readAsDataURL(file);
      });
    });

    const results = await Promise.all(filePromises);
    setFileDatas(results);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoSubmitted) {
      return Swal.fire('กรุณายืนยัน', 'กรุณาติ๊กถูกที่กล่องยืนยันว่าคุณได้ส่งวิดีโอผ่าน Google Form เรียบร้อยแล้ว', 'warning');
    }
    
    if (fileDatas.length === 0) {
      return Swal.fire('กรุณาแนบรูปภาพ', 'กรุณาแนบรูปภาพประกอบอย่างน้อย 1 รูป', 'warning');
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      files: fileDatas
    };

    const res = await fetchFromGas('submitTeacherWork', payload);
    setSubmitting(false);

    if (res.success) {
      Swal.fire({
        title: 'ส่งงานสำเร็จ!',
        text: 'ระบบบันทึกข้อมูลการส่งงานของคุณเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire('เกิดข้อผิดพลาด', res.message || 'ไม่สามารถส่งงานได้', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <UserCheck className="w-8 h-8" />
            ส่งงาน Role Teacher Model
          </h1>
          <p className="text-amber-50">กรุณากรอกข้อมูลและอัปโหลดผลงานของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* ข้อมูลส่วนตัว */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">1. ข้อมูลส่วนตัวและรายละเอียด</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำนำหน้า</label>
                <select 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 border text-black"
                  value={formData.prefix}
                  onChange={e => setFormData({...formData, prefix: e.target.value})}
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ว่าที่ร้อยตรี">ว่าที่ร้อยตรี</option>
                  <option value="ดร.">ดร.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 border text-black"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 border text-black"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">วิชาที่สอน</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 border text-black"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="เช่น คณิตศาสตร์, วิทยาศาสตร์"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับชั้น</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 border text-black"
                  value={formData.gradeLevel}
                  onChange={e => setFormData({...formData, gradeLevel: e.target.value})}
                  placeholder="เช่น ม.1, ป.6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เรื่อง/หัวข้อ</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 px-3 border text-black"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* การส่งงานวิดีโอ */}
          <div className="mb-8 bg-amber-50 p-6 rounded-xl border border-amber-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span> 
              การส่งวิดีโอ (ความยาวไม่เกิน 5 นาที)
            </h2>
            <p className="text-gray-600 mb-4 ml-8">เนื่องจากไฟล์วิดีโอมีขนาดใหญ่ กรุณาอัปโหลดไฟล์วิดีโอผ่านระบบ Google Form ที่เตรียมไว้ให้ครับ</p>
            
            <div className="ml-8 mb-4">
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSeNvM0A1lAWmVz-Unf5oiaGXaPx8m9PkQRnmpiHLyR2xFs2Sw/viewform?usp=publish-editor" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                <ExternalLink className="w-5 h-5" />
                คลิกที่นี่เพื่ออัปโหลดวิดีโอ (เปิดหน้าใหม่)
              </a>
            </div>
            
            <div className="ml-8 mt-4 flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="video-confirm"
                  name="video-confirm"
                  type="checkbox"
                  checked={videoSubmitted}
                  onChange={(e) => setVideoSubmitted(e.target.checked)}
                  className="focus:ring-amber-500 h-5 w-5 text-amber-600 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="video-confirm" className="font-medium text-gray-800 cursor-pointer">
                  ฉันได้ทำการอัปโหลดวิดีโอผ่าน Google Form เรียบร้อยแล้ว
                </label>
                <p className="text-gray-500">กรุณาติ๊กถูกที่ช่องนี้เพื่อยืนยันก่อนกดส่งงานในหน้าเว็บนี้</p>
              </div>
            </div>
          </div>

          {/* อัปโหลดรูปภาพ */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">3</span> 
              แนบไฟล์รูปภาพ
            </h2>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 ml-8">
              <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                <UploadCloud className="text-amber-500" />
                อัปโหลดรูปภาพ (เลือกได้หลายรูปพร้อมกัน)
              </h3>
              
              <div>
                <input 
                  type="file" 
                  multiple
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
                  onChange={handleFilesChange}
                  accept=".png,.jpg,.jpeg"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">รองรับไฟล์ JPG, PNG ขนาดไฟล์ละไม่เกิน 5MB</p>
              </div>
              
              {fileDatas.length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    เลือกแล้ว {fileDatas.length} ไฟล์:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-1">
                    {fileDatas.map((f, i) => (
                      <li key={i} className="truncate" title={f.fileName}>{f.fileName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              disabled={submitting}
              className="px-8 py-3 bg-amber-500 text-white text-lg font-medium rounded-xl hover:bg-amber-600 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'กำลังบันทึกข้อมูล...' : 'ส่งงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
