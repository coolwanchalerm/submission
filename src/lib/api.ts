// ให้ผู้ใช้ระบุ URL Web App ของ Google Apps Script ของตัวเองที่นี่
export const GAS_URL = "https://script.google.com/macros/s/AKfycby8FXeB2zgR-3zb-9TJ652-x7qRUqVBXUR1HClPPZF9wjoegS6lvggQZjy3Snjg-46B/exec";

export async function fetchFromGas(action: string, payload?: any) {
  if (GAS_URL.includes("YOUR_WEB_APP_ID")) {
    console.warn("Please set the GAS_URL in src/lib/api.ts");
    // Return mock data if URL is not set (for previewing the UI)
    return getMockData(action);
  }

  try {
    if (action === 'getDataForForm' || action === 'getAllData') {
      const res = await fetch(`${GAS_URL}?action=${action}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } else {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action, payload }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      return await res.json();
    }
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: 'Failed to connect to server.' };
  }
}

// Mock Data for UI development
function getMockData(action: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (action === 'getDataForForm') {
        resolve({
          success: true,
          topics: [
            { ID: 'T1', Name: 'อบรม Next.js รุ่น 1', Date: '2026-07-10', IsOpen: 'true', UploadType: 'file', TimePeriod: 'allday' },
            { ID: 'T2', Name: 'อบรม React รุ่น 2', Date: '2026-07-15', IsOpen: 'true', UploadType: 'link', TimePeriod: 'morning' }
          ],
          rounds: [
            { ID: 'R1', Name: 'รอบเช้า (09:00 - 12:00)' },
            { ID: 'R2', Name: 'รอบบ่าย (13:00 - 16:00)' }
          ]
        });
      } else if (action === 'getAllData') {
        resolve({
          success: true,
          topics: [
            { ID: 'T1', Name: 'อบรม Next.js รุ่น 1', Date: '2026-07-10', IsOpen: 'true', UploadType: 'file', TimePeriod: 'allday' },
            { ID: 'T2', Name: 'อบรม React รุ่น 2', Date: '2026-07-15', IsOpen: 'true', UploadType: 'link', TimePeriod: 'morning' }
          ],
          rounds: [
            { ID: 'R1', Name: 'รอบเช้า (09:00 - 12:00)' },
            { ID: 'R2', Name: 'รอบบ่าย (13:00 - 16:00)' }
          ],
          submissions: [
            { ID: 'SUB1', Timestamp: '2026-07-05T10:00:00Z', Prefix: 'นาย', FirstName: 'วันเฉลิม', LastName: 'ใจดี', TopicID: 'T1', Round: 'R1', FileLink: 'https://example.com/file', TopicName: 'อบรม Next.js รุ่น 1', RoundName: 'รอบเช้า (09:00 - 12:00)' }
          ]
        });
      } else {
        resolve({ success: true, message: 'Mock action successful' });
      }
    }, 500);
  });
}
