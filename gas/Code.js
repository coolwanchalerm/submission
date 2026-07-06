const FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE"; // แทนที่ด้วย ID โฟลเดอร์ใน Google Drive
const SHEET_ID = ""; // ถ้ารันจาก script.google.com ให้ใส่ ID ของ Google Sheet ที่นี่

function getSS() {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("ไม่พบ Google Sheet: กรุณาสร้าง Script จากเมนูส่วนขยายใน Google Sheet หรือระบุ SHEET_ID");
  }
  return ss;
}

function setup() {
  const ss = getSS();
  
  // Create sheets if not exist
  const sheets = ['Submissions', 'Topics', 'Rounds'];
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });

  // Setup headers
  const subSheet = ss.getSheetByName('Submissions');
  if (subSheet.getLastRow() === 0) {
    subSheet.appendRow(['ID', 'Timestamp', 'Prefix', 'FirstName', 'LastName', 'TopicID', 'Round', 'FileLink', 'TopicName', 'RoundName']);
  }

  const topicSheet = ss.getSheetByName('Topics');
  if (topicSheet.getLastRow() === 0) {
    topicSheet.appendRow(['ID', 'Name', 'Date', 'IsOpen', 'UploadType', 'TimePeriod']);
    topicSheet.appendRow(['T1', 'อบรม Next.js', '2024-01-01', 'true', 'file', 'allday']);
  }

  const roundSheet = ss.getSheetByName('Rounds');
  if (roundSheet.getLastRow() === 0) {
    roundSheet.appendRow(['ID', 'Name']);
    roundSheet.appendRow(['R1', 'เช้า']);
    roundSheet.appendRow(['R2', 'บ่าย']);
  }

  const settingsSheet = ss.getSheetByName('Settings');
  if (!settingsSheet) {
    const newSettings = ss.insertSheet('Settings');
    newSettings.appendRow(['Key', 'Value']);
    newSettings.appendRow(['TeacherMenuEnabled', 'false']);
  } else if (settingsSheet.getLastRow() === 0) {
    settingsSheet.appendRow(['Key', 'Value']);
    settingsSheet.appendRow(['TeacherMenuEnabled', 'false']);
  }

  const teacherSheet = ss.getSheetByName('TeacherSubmissions');
  if (!teacherSheet) {
    const newTeacher = ss.insertSheet('TeacherSubmissions');
    newTeacher.appendRow(['ID', 'Timestamp', 'Prefix', 'FirstName', 'LastName', 'Subject', 'Topic', 'GradeLevel', 'ImageLinks']);
  } else if (teacherSheet.getLastRow() === 0) {
    teacherSheet.appendRow(['ID', 'Timestamp', 'Prefix', 'FirstName', 'LastName', 'Subject', 'Topic', 'GradeLevel', 'ImageLinks']);
  }
}

// ฟังก์ชันสำหรับขอสิทธิ์เข้าถึง Google Drive
// กรุณากดปุ่ม "เรียกใช้" (Run) ฟังก์ชันนี้ 1 ครั้งในหน้า Editor เพื่อกดยืนยันสิทธิ์
function authorize() {
  DriveApp.getRootFolder();
  Logger.log("ได้รับสิทธิ์เข้าถึง Drive สำเร็จ!");
}

function doOptions(e) {
  return HtmlService.createHtmlOutput("ok").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doGet(e) {
  const action = e.parameter.action;
  let result = { success: false, message: 'Invalid action' };

  try {
    if (action === 'getDataForForm') {
      result = {
        success: true,
        topics: getTopics(true), // only open topics
        rounds: getRounds(),
        settings: getSettings()
      };
    } else if (action === 'getAllData') {
      result = {
        success: true,
        topics: getTopics(false),
        rounds: getRounds(),
        submissions: getSubmissions(),
        settings: getSettings(),
        teacherSubmissions: getTeacherSubmissions()
      };
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let result = { success: false, message: 'Invalid action' };
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'submitWork') {
      result = handleSubmit(data.payload);
    } else if (action === 'addTopic') {
      result = handleAddTopic(data.payload);
    } else if (action === 'updateTopic') {
      result = handleUpdateTopic(data.payload);
    } else if (action === 'deleteSubmission') {
      result = handleDeleteSubmission(data.payload);
    } else if (action === 'editSubmission') {
      result = handleEditSubmission(data.payload);
    } else if (action === 'deleteTopic') {
      result = handleDeleteTopic(data.payload);
    } else if (action === 'toggleTeacherMenu') {
      result = handleToggleTeacherMenu(data.payload);
    } else if (action === 'submitTeacherWork') {
      result = handleTeacherSubmit(data.payload);
    } else if (action === 'deleteTeacherSubmission') {
      result = handleDeleteTeacherSubmission(data.payload);
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Data Fetchers ---

function getTopics(onlyOpen) {
  const sheet = getSS().getSheetByName('Topics');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  let topics = rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  if (onlyOpen) {
    topics = topics.filter(t => t.IsOpen === true || t.IsOpen === 'true');
  }
  return topics;
}

function getRounds() {
  const sheet = getSS().getSheetByName('Rounds');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getSubmissions() {
  const sheet = getSS().getSheetByName('Submissions');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getSettings() {
  const sheet = getSS().getSheetByName('Settings');
  const data = sheet.getDataRange().getValues();
  let settings = {};
  for(let i=1; i<data.length; i++){
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function getTeacherSubmissions() {
  const sheet = getSS().getSheetByName('TeacherSubmissions');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

// --- Handlers ---

function handleSubmit(payload) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Submissions');
  
  // Check Duplicate
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find indices
  const fNameIdx = headers.indexOf('FirstName');
  const lNameIdx = headers.indexOf('LastName');
  const topicIdIdx = headers.indexOf('TopicID');
  const roundIdx = headers.indexOf('Round');

  for (let i = 1; i < data.length; i++) {
    if (data[i][fNameIdx] === payload.firstName && 
        data[i][lNameIdx] === payload.lastName && 
        data[i][topicIdIdx] === payload.topicId &&
        data[i][roundIdx] === payload.roundId) {
      return { success: false, message: 'ผู้ใช้นี้ได้ส่งงานในรอบนี้ไปแล้ว' };
    }
  }

  let fileLink = payload.link || '';
  
  // Handle File Upload
  if (payload.fileData && payload.fileName) {
    if (FOLDER_ID === "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") {
      return { success: false, message: 'Please set FOLDER_ID in Google Apps Script' };
    }
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const contentType = payload.fileData.substring(5,payload.fileData.indexOf(';'));
    const bytes = Utilities.base64Decode(payload.fileData.split(',')[1]);
    const blob = Utilities.newBlob(bytes, contentType, payload.firstName + "_" + payload.fileName);
    const file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      // บางองค์กรอาจมีการบล็อกการแชร์ไฟล์สาธารณะ ทำให้บรรทัดนี้ error ได้
      Logger.log("ไม่สามารถตั้งค่า Share ไฟล์ได้: " + shareErr);
    }
    fileLink = file.getUrl();
  }

  const newId = 'SUB' + new Date().getTime();
  const timestamp = new Date().toISOString();
  
  const topics = getTopics(false);
  const rounds = getRounds();
  
  const topicName = topics.find(t => t.ID === payload.topicId)?.Name || payload.topicId;
  const roundName = rounds.find(r => r.ID === payload.roundId)?.Name || payload.roundId;

  // ['ID', 'Timestamp', 'Prefix', 'FirstName', 'LastName', 'TopicID', 'Round', 'FileLink', 'TopicName', 'RoundName']
  const newRow = [
    newId,
    timestamp,
    payload.prefix,
    payload.firstName,
    payload.lastName,
    payload.topicId,
    payload.roundId,
    fileLink,
    topicName,
    roundName
  ];

  sheet.appendRow(newRow);
  
  return { success: true, message: 'ส่งงานสำเร็จ', data: { id: newId, link: fileLink } };
}

function handleAddTopic(payload) {
  const sheet = getSS().getSheetByName('Topics');
  const newId = 'TOPIC' + new Date().getTime();
  // ['ID', 'Name', 'Date', 'IsOpen', 'UploadType', 'TimePeriod']
  sheet.appendRow([newId, payload.name, payload.date, payload.isOpen, payload.uploadType, payload.timePeriod]);
  return { success: true, message: 'เพิ่มหัวข้อสำเร็จ' };
}

function handleUpdateTopic(payload) {
  const sheet = getSS().getSheetByName('Topics');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('ID');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === payload.id) {
      sheet.getRange(i + 1, 2).setValue(payload.name);
      sheet.getRange(i + 1, 3).setValue(payload.date);
      sheet.getRange(i + 1, 4).setValue(payload.isOpen);
      sheet.getRange(i + 1, 5).setValue(payload.uploadType);
      sheet.getRange(i + 1, 6).setValue(payload.timePeriod);
      return { success: true, message: 'อัปเดตหัวข้อสำเร็จ' };
    }
  }
  return { success: false, message: 'ไม่พบหัวข้อ' };
}

function handleDeleteTopic(payload) {
  const sheet = getSS().getSheetByName('Topics');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('ID');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === payload.id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'ลบหัวข้อสำเร็จ' };
    }
  }
  return { success: false, message: 'ไม่พบหัวข้อ' };
}

function handleDeleteSubmission(payload) {
  const sheet = getSS().getSheetByName('Submissions');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('ID');
  const fileLinkIdx = data[0].indexOf('FileLink');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === payload.id) {
      const fileLink = data[i][fileLinkIdx];
      if (fileLink && fileLink.includes('drive.google.com/file/d/')) {
        try {
          const match = fileLink.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            DriveApp.getFileById(match[1]).setTrashed(true);
          }
        } catch (e) {
          Logger.log("ไม่สามารถลบไฟล์จาก Drive ได้: " + e);
        }
      }
      sheet.deleteRow(i + 1);
      return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    }
  }
  return { success: false, message: 'ไม่พบข้อมูล' };
}

function handleEditSubmission(payload) {
  const sheet = getSS().getSheetByName('Submissions');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('ID');
  
  // ['ID', 'Timestamp', 'Prefix', 'FirstName', 'LastName', 'TopicID', 'Round', 'FileLink', 'TopicName', 'RoundName']
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === payload.id) {
      sheet.getRange(i + 1, 3).setValue(payload.prefix);
      sheet.getRange(i + 1, 4).setValue(payload.firstName);
      sheet.getRange(i + 1, 5).setValue(payload.lastName);
      // optionally update topic/round if needed
      return { success: true, message: 'แก้ไขข้อมูลสำเร็จ' };
    }
  }
  return { success: false, message: 'ไม่พบข้อมูล' };
}

function handleToggleTeacherMenu(payload) {
  const sheet = getSS().getSheetByName('Settings');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'TeacherMenuEnabled') {
      sheet.getRange(i + 1, 2).setValue(payload.enabled.toString());
      return { success: true, message: 'บันทึกการตั้งค่าสำเร็จ' };
    }
  }
  return { success: false, message: 'ไม่พบ Key Settings' };
}

function handleTeacherSubmit(payload) {
  const ss = getSS();
  const sheet = ss.getSheetByName('TeacherSubmissions');
  
  let uploadedLinks = [];
  
  if (payload.files && payload.files.length > 0) {
    if (FOLDER_ID === "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") {
      return { success: false, message: 'Please set FOLDER_ID in Google Apps Script' };
    }
    const folder = DriveApp.getFolderById(FOLDER_ID);
    
    payload.files.forEach(f => {
      const contentType = f.fileData.substring(5, f.fileData.indexOf(';'));
      const bytes = Utilities.base64Decode(f.fileData.split(',')[1]);
      const blob = Utilities.newBlob(bytes, contentType, payload.firstName + "_" + f.fileName);
      const file = folder.createFile(blob);
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {
        Logger.log(e);
      }
      uploadedLinks.push(file.getUrl());
    });
  }

  const newId = 'TSUB' + new Date().getTime();
  const timestamp = new Date().toISOString();
  
  // ['ID', 'Timestamp', 'Prefix', 'FirstName', 'LastName', 'Subject', 'Topic', 'GradeLevel', 'ImageLinks']
  const newRow = [
    newId,
    timestamp,
    payload.prefix,
    payload.firstName,
    payload.lastName,
    payload.subject,
    payload.topic,
    payload.gradeLevel,
    uploadedLinks.join(', ')
  ];

  sheet.appendRow(newRow);
  
  return { success: true, message: 'ส่งงานสำเร็จ' };
}

function handleDeleteTeacherSubmission(payload) {
  const sheet = getSS().getSheetByName('TeacherSubmissions');
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('ID');
  const linksIdx = data[0].indexOf('ImageLinks');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIdx] === payload.id) {
      const linksStr = data[i][linksIdx];
      if (linksStr) {
        const links = linksStr.split(', ');
        links.forEach(link => {
          if (link.includes('drive.google.com/file/d/')) {
            try {
              const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
              if (match && match[1]) {
                DriveApp.getFileById(match[1]).setTrashed(true);
              }
            } catch (e) {
              Logger.log(e);
            }
          }
        });
      }
      sheet.deleteRow(i + 1);
      return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    }
  }
  return { success: false, message: 'ไม่พบข้อมูล' };
}
