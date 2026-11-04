/**
 * B ♥ S Wedding — เก็บคำตอบ RSVP ลง Google Sheet และส่งคำอวยพรกลับไปแสดงบนการ์ด
 * วิธีติดตั้งดูที่ README.md ในโฟลเดอร์เดียวกัน
 */
var SHEET_NAME = 'RSVP';
var HEADERS = ['เวลา', 'ชื่อ', 'มาร่วมงาน', 'ฝ่าย', 'มากับ', 'จำนวน (คน)', 'อาหารที่ทานไม่ได้', 'คำอวยพร', 'time'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function clean_(v, max) { return String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, max); }

function doPost(e) {
  var d = JSON.parse(e.postData.contents || '{}');
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    sheet_().appendRow([
      new Date(), clean_(d.name, 60), d.attend === 'yes' ? 'มา' : 'ไม่มา', clean_(d.side, 10), clean_(d.party, 10),
      Number(d.guests) || 0, clean_(d.diet, 200), clean_(d.wish, 300), Date.now()
    ]);
  } finally { lock.releaseLock(); }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

/* ส่งกลับเฉพาะข้อมูลที่แสดงบนการ์ด (ไม่ส่งข้อมูลอาหาร) */
function doGet() {
  var values = sheet_().getDataRange().getValues().slice(1);
  var rows = values.map(function (r) {
    return { name: r[1], attend: r[2] === 'มา' ? 'yes' : 'no', side: r[3], guests: r[5], wish: r[7], time: r[8] };
  });
  return ContentService.createTextOutput(JSON.stringify({ rows: rows })).setMimeType(ContentService.MimeType.JSON);
}
