const SHEET_NAME_STAFF       = 'スタッフ';
const SHEET_NAME_ATTENDANCE  = '勤怠';
const SHEET_NAME_SHIFT       = 'シフト';
const SHEET_NAME_SHIFT_REQ   = 'シフト希望';
const SHEET_NAME_CONSTRAINT  = 'ソフト制約';

function doGet(e) {
  const action = e.parameter.action;
  let result;
  try {
    switch (action) {
      case 'getAll':              result = getAllData(); break;
      case 'saveStaff':           result = saveStaff(e.parameter); break;
      case 'deleteStaff':         result = deleteStaff(e.parameter); break;
      case 'saveAttendance':      result = saveAttendance(e.parameter); break;
      case 'deleteAttendance':    result = deleteAttendance(e.parameter); break;
      case 'saveShift':           result = saveShift(e.parameter); break;
      case 'saveBulkShifts':      result = saveBulkShifts(e.parameter); break;
      case 'deleteMonthShifts':   result = deleteMonthShifts(e.parameter); break;
      case 'saveShiftRequest':    result = saveShiftRequest(e.parameter); break;
      case 'saveBulkShiftRequests': result = saveBulkShiftRequests(e.parameter); break;
      case 'deleteShiftRequest':  result = deleteShiftRequest(e.parameter); break;
      case 'saveConstraint':      result = saveConstraint(e.parameter); break;
      case 'deleteConstraint':    result = deleteConstraint(e.parameter); break;
      default: result = { error: 'Unknown action: ' + action };
    }
  } catch(e) {
    result = { error: e.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch(err) {
    data = e.parameter;
  }
  const action = data.action;
  let result;
  try {
    switch (action) {
      case 'getAll':              result = getAllData(); break;
      case 'saveStaff':           result = saveStaff(data); break;
      case 'deleteStaff':         result = deleteStaff(data); break;
      case 'saveAttendance':      result = saveAttendance(data); break;
      case 'deleteAttendance':    result = deleteAttendance(data); break;
      case 'saveShift':           result = saveShift(data); break;
      case 'saveBulkShifts':      result = saveBulkShifts(data); break;
      case 'deleteMonthShifts':   result = deleteMonthShifts(data); break;
      case 'saveShiftRequest':    result = saveShiftRequest(data); break;
      case 'saveBulkShiftRequests': result = saveBulkShiftRequests(data); break;
      case 'deleteShiftRequest':  result = deleteShiftRequest(data); break;
      case 'saveConstraint':      result = saveConstraint(data); break;
      case 'deleteConstraint':    result = deleteConstraint(data); break;
      default: result = { error: 'Unknown action: ' + action };
    }
  } catch(e) {
    result = { error: e.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function normalizeSheetDate(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const s = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function shiftMonthOf(value) {
  return normalizeSheetDate(value).slice(0, 7);
}

function normalizeShiftRows(rows) {
  return (rows || []).map(r => [
    r[0] || '',
    r[1] || '',
    normalizeSheetDate(r[2]),
    r[3] || false,
    r[4] || '',
  ]);
}

function prepareShiftDateColumn(sheet, rowCount) {
  sheet.getRange(1, 3, Math.max(rowCount, 1), 1).setNumberFormat('@');
}

function getAllData() {
  const staffSheet      = getSheet(SHEET_NAME_STAFF);
  const attendanceSheet = getSheet(SHEET_NAME_ATTENDANCE);
  const shiftSheet      = getSheet(SHEET_NAME_SHIFT);
  const reqSheet        = getSheet(SHEET_NAME_SHIFT_REQ);
  const conSheet        = getSheet(SHEET_NAME_CONSTRAINT);
  return {
    staff:        staffSheet.getLastRow()      > 0 ? staffSheet.getDataRange().getValues()      : [],
    attendance:   attendanceSheet.getLastRow() > 0 ? attendanceSheet.getDataRange().getValues() : [],
    shift:        shiftSheet.getLastRow()      > 0 ? normalizeShiftRows(shiftSheet.getDataRange().getValues()) : [],
    shiftRequest: reqSheet.getLastRow()        > 0 ? reqSheet.getDataRange().getValues()        : [],
    softConstraint: conSheet.getLastRow()      > 0 ? conSheet.getDataRange().getValues()        : [],
  };
}

function saveStaff(data) {
  const sheet = getSheet(SHEET_NAME_STAFF);
  const lastRow = sheet.getLastRow();
  const values = lastRow > 0 ? sheet.getDataRange().getValues() : [];
  const idx = values.findIndex(r => r[0] === data.id);
  const socialIns = (data.socialIns === 'true' || data.socialIns === true);
  const employIns = (data.employIns === 'true' || data.employIns === true);
  const row = [
    data.id, data.name, data.hourlyWage, data.transportFee,
    data.monthlyCommute, data.status, data.employmentType,
    data.weeklyDays, data.commuteRoute, data.address,
    data.email, data.phone, data.memo,
    data.payType, data.monthlySalary, data.birthdate,
    data.dependents, data.stdSalary, socialIns, employIns
  ];
  if (idx >= 0) {
    sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  return { success: true };
}

function deleteStaff(data) {
  const sheet = getSheet(SHEET_NAME_STAFF);
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return { success: true };
  const values = sheet.getDataRange().getValues();
  const idx = values.findIndex(r => r[0] === data.id);
  if (idx >= 0) sheet.deleteRow(idx + 1);
  return { success: true };
}

function saveAttendance(data) {
  const sheet = getSheet(SHEET_NAME_ATTENDANCE);
  const lastRow = sheet.getLastRow();
  const values = lastRow > 0 ? sheet.getDataRange().getValues() : [];
  const idx = values.findIndex(r => r[0] === data.id);
  const row = [data.id, data.staffId, data.clockIn, data.clockOut,
    data.adjustedWage, data.adjustedPay, data.adjustedTransport, data.isAdjusted];
  if (idx >= 0) {
    sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  return { success: true };
}

function deleteAttendance(data) {
  const sheet = getSheet(SHEET_NAME_ATTENDANCE);
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return { success: true };
  const values = sheet.getDataRange().getValues();
  const idx = values.findIndex(r => r[0] === data.id);
  if (idx >= 0) sheet.deleteRow(idx + 1);
  return { success: true };
}

// Bulk save for all shifts in a month — receives rows as JSON string
function saveBulkShifts(data) {
  let rows;
  try { rows = JSON.parse(data.rows); } catch { return { error: 'Invalid rows JSON' }; }
  const replaceMonth = data.replaceMonth ? String(data.replaceMonth) : '';
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet(SHEET_NAME_SHIFT);
    const lastRow = sheet.getLastRow();
    let existing = lastRow > 0 ? sheet.getDataRange().getValues() : [];

    if (replaceMonth) {
      const remaining = existing
        .filter(r => shiftMonthOf(r[2]) !== replaceMonth)
        .map(r => [r[0] || '', r[1] || '', normalizeSheetDate(r[2]), r[3] || false, r[4] || '']);
      const newRows = rows.map(r => [r.id, r.staffId, normalizeSheetDate(r.date), r.isConfirmed, r.shiftPattern || '']);
      const nextRows = remaining.concat(newRows);
      sheet.clearContents();
      if (nextRows.length > 0) {
        prepareShiftDateColumn(sheet, nextRows.length);
        sheet.getRange(1, 1, nextRows.length, 5).setValues(nextRows);
      }
      return { success: true };
    }

    for (const r of rows) {
      const idx = existing.findIndex(x => x[0] === r.id);
      const row = [r.id, r.staffId, normalizeSheetDate(r.date), r.isConfirmed, r.shiftPattern || ''];
      prepareShiftDateColumn(sheet, Math.max(sheet.getLastRow() + 1, idx + 1, 1));
      if (idx >= 0) {
        sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
        existing[idx] = row; // keep in sync for subsequent findIndex
      } else {
        sheet.appendRow(row);
        existing.push(row);
      }
    }
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteMonthShifts(data) {
  const month = String(data.month || '');
  if (!month) return { error: 'month is required' };
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet(SHEET_NAME_SHIFT);
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) return { success: true };
    const existing = sheet.getDataRange().getValues()
      .filter(r => shiftMonthOf(r[2]) !== month);
    sheet.clearContents();
    if (existing.length > 0) {
      prepareShiftDateColumn(sheet, existing.length);
      sheet.getRange(1, 1, existing.length, Math.max(5, existing[0].length)).setValues(
        existing.map(r => [r[0] || '', r[1] || '', normalizeSheetDate(r[2]), r[3] || false, r[4] || ''])
      );
    }
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

/*
 * Legacy endpoint retained for single-day edits.
 */
function saveBulkShiftsLegacy(data) {
  let rows;
  try { rows = JSON.parse(data.rows); } catch { return { error: 'Invalid rows JSON' }; }
  const sheet = getSheet(SHEET_NAME_SHIFT);
  const lastRow = sheet.getLastRow();
  const existing = lastRow > 0 ? sheet.getDataRange().getValues() : [];

  for (const r of rows) {
    const idx = existing.findIndex(x => x[0] === r.id);
    const row = [r.id, r.staffId, normalizeSheetDate(r.date), r.isConfirmed, r.shiftPattern || ''];
    prepareShiftDateColumn(sheet, Math.max(sheet.getLastRow() + 1, idx + 1, 1));
    if (idx >= 0) {
      sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
      existing[idx] = row; // keep in sync for subsequent findIndex
    } else {
      sheet.appendRow(row);
      existing.push(row);
    }
  }
  return { success: true };
}

// Columns: id, staffId, date, isConfirmed, shiftPattern
function saveShift(data) {
  const sheet = getSheet(SHEET_NAME_SHIFT);
  const lastRow = sheet.getLastRow();
  const values = lastRow > 0 ? sheet.getDataRange().getValues() : [];
  const idx = values.findIndex(r => r[0] === data.id);
  const row = [data.id, data.staffId, normalizeSheetDate(data.date), data.isConfirmed, data.shiftPattern || ''];
  prepareShiftDateColumn(sheet, Math.max(lastRow + 1, idx + 1, 1));
  if (idx >= 0) {
    sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  return { success: true };
}

function normalizeShiftRequestRow(r) {
  return [
    r[0] || '', r[1] || '', r[2] || '',
    r[3] || '[]', r[4] || '[]', r[5] || '[]',
    r[6] || '', r[7] || '', r[8] || '{}', r[9] || '[]'
  ];
}

// Columns: id, staffId, yearMonth, preferDaysOfWeek(JSON), offDaysOfWeek(JSON), specificDates(JSON), targetDaysMin(legacy), targetDaysMax(legacy), weekdayTimePrefs(JSON), choiceDateGroups(JSON)
function saveShiftRequest(data) {
  const sheet = getSheet(SHEET_NAME_SHIFT_REQ);
  const lastRow = sheet.getLastRow();
  const values = lastRow > 0 ? sheet.getDataRange().getValues() : [];
  const idx = values.findIndex(r => r[0] === data.id);
  const row = [
    data.id, data.staffId, data.yearMonth,
    data.preferDaysOfWeek || '[]',
    data.offDaysOfWeek    || '[]',
    data.specificDates    || '[]',
    data.targetDaysMin    || '',
    data.targetDaysMax    || '',
    data.weekdayTimePrefs || '{}',
    data.choiceDateGroups || '[]'
  ];
  if (idx >= 0) {
    sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  return { success: true };
}

function saveBulkShiftRequests(data) {
  let rows;
  try { rows = JSON.parse(data.rows); } catch { return { error: 'Invalid rows JSON' }; }
  const replaceMonth = data.replaceMonth ? String(data.replaceMonth) : '';
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sheet = getSheet(SHEET_NAME_SHIFT_REQ);
    const lastRow = sheet.getLastRow();
    let existing = lastRow > 0 ? sheet.getDataRange().getValues() : [];

    if (replaceMonth) {
      existing = existing.filter(r => String(r[2] || '') !== replaceMonth);
      sheet.clearContents();
      if (existing.length > 0) {
        sheet.getRange(1, 1, existing.length, 10).setValues(existing.map(normalizeShiftRequestRow));
      }
    }

    for (const r of rows) {
      const idx = existing.findIndex(x => x[0] === r.id);
      const row = [
        r.id, r.staffId, r.yearMonth,
        r.preferDaysOfWeek || '[]',
        r.offDaysOfWeek    || '[]',
        r.specificDates    || '[]',
        r.targetDaysMin    || '',
        r.targetDaysMax    || '',
        r.weekdayTimePrefs || '{}',
        r.choiceDateGroups || '[]'
      ];
      if (idx >= 0) {
        sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
        existing[idx] = row;
      } else {
        sheet.appendRow(row);
        existing.push(row);
      }
    }
    // Force yearMonth column (col 3) to plain text so Sheets won't
    // auto-convert "YYYY-MM" strings into Date serial numbers.
    const totalRows = sheet.getLastRow();
    if (totalRows > 0) {
      sheet.getRange(1, 3, totalRows, 1).setNumberFormat('@');
    }
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteShiftRequest(data) {
  const sheet = getSheet(SHEET_NAME_SHIFT_REQ);
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return { success: true };
  const values = sheet.getDataRange().getValues();
  const idx = values.findIndex(r => r[0] === data.id);
  if (idx >= 0) sheet.deleteRow(idx + 1);
  return { success: true };
}

// Columns: id, yearMonth, type, params(JSON), description, priority
function saveConstraint(data) {
  const sheet = getSheet(SHEET_NAME_CONSTRAINT);
  const lastRow = sheet.getLastRow();
  const values = lastRow > 0 ? sheet.getDataRange().getValues() : [];
  const idx = values.findIndex(r => r[0] === data.id);
  const row = [data.id, data.yearMonth, data.type, data.params || '{}', data.description || '', data.priority || 'medium'];
  if (idx >= 0) {
    sheet.getRange(idx + 1, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
  // Force yearMonth column (col 2) to plain text.
  const totalRows = sheet.getLastRow();
  if (totalRows > 0) {
    sheet.getRange(1, 2, totalRows, 1).setNumberFormat('@');
  }
  return { success: true };
}

function deleteConstraint(data) {
  const sheet = getSheet(SHEET_NAME_CONSTRAINT);
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return { success: true };
  const values = sheet.getDataRange().getValues();
  const idx = values.findIndex(r => r[0] === data.id);
  if (idx >= 0) sheet.deleteRow(idx + 1);
  return { success: true };
}
