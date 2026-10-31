import test from "node:test";
import assert from "node:assert/strict";
import { initialJob, restoreDraft, importMilestones, formatCalendarDate, calendarInputType, calendarInputValue, totals } from "../app/model.ts";

test("legacy Import drafts retain party details and completed progress", () => {
  for (const [oldActivity, expected] of [[3, 3], [7, 7], [8, 9], [9, 10]]) {
    const legacy = initialJob("Import");
    delete legacy.importVersion;
    legacy.activity = oldActivity;
    legacy.parties[3] = { ...legacy.parties[3], role: "Notify Party", name: "Existing billing company" };
    const restored = restoreDraft("Import", JSON.stringify(legacy));
    assert.equal(restored.activity, expected);
    assert.equal(restored.parties[3].role, "Billing To Party");
    assert.equal(restored.parties[3].name, "Existing billing company");
    assert.equal(restored.parties[3].address, legacy.parties[3].address);
    assert.deepEqual(restoreDraft("Import", JSON.stringify(restored)), restored);
  }
});

test("Import draft round trip preserves independent row values and column choices", () => {
  const job = initialJob("Import");
  job.fields["Shipment Type"] = "Project Cargo";
  job.fields["Job Date"] = "31-Oct-2026";
  job.containers[0].transporter = "First Transport";
  job.containers[0].vehicle = "GJ01AB1234";
  job.containers[1].transporter = "Second Transport";
  job.containers[1].vehicle = "MH01CD5678";
  job.income[0].date = "2026-10-31";
  job.expense[0].date = "2026-11-01";
  job.hiddenColumns = { Cargo: ["Seal No."], Income: ["Remarks"] };
  job.activity = importMilestones.indexOf("Empty Container Return");
  assert.deepEqual(restoreDraft("Import", JSON.stringify(job)), job);
  assert.deepEqual(totals(job.income), totals(initialJob("Import").income));
});

test("missing optional fields restore blank, malformed preferences are ignored", () => {
  const job = initialJob("Import");
  delete job.income[0].date;
  delete job.expense[0].date;
  delete job.containers[0].transporter;
  delete job.containers[0].vehicle;
  job.hiddenColumns = { Cargo: ["Seal No."], Income: "invalid", Duties: [123] };
  const restored = restoreDraft("Import", JSON.stringify(job));
  assert.equal(restored.income[0].date, "");
  assert.equal(restored.expense[0].date, "");
  assert.equal(restored.containers[0].transporter, "");
  assert.equal(restored.containers[0].vehicle, "");
  assert.deepEqual(restored.hiddenColumns, { Cargo: ["Seal No."] });
  assert.deepEqual(restoreDraft("Import", "bad json"), initialJob("Import"));
});

test("Export drafts are unchanged", () => {
  const job = initialJob("Export");
  assert.equal(job.parties[3].role, "Notify Party");
  assert.equal(job.importVersion, undefined);
  assert.equal(job.containers[0].transporter, undefined);
  assert.equal(job.income[0].date, undefined);
  job.fields["IGM No."] = "123";
  assert.deepEqual(restoreDraft("Export", JSON.stringify(job)), job);
});

test("calendar display preserves the selected day without timezone conversion", () => {
  assert.equal(formatCalendarDate("2026-10-31"), "31-Oct-2026");
  assert.equal(formatCalendarDate("2024-02-29"), "29-Feb-2024");
  assert.equal(formatCalendarDate(""), "–");
  assert.equal(formatCalendarDate(undefined), "–");
  assert.equal(formatCalendarDate("2026-10-31T23:45"), "31-Oct-2026 23:45");
});

test("native calendars accept existing date formats and preserve local time", () => {
  assert.equal(calendarInputValue("09-Sep-2026"), "2026-09-09");
  assert.equal(calendarInputValue("2026-10-31"), "2026-10-31");
  assert.equal(calendarInputValue("9-sep-2026 08:30", true), "2026-09-09T08:30");
  assert.equal(calendarInputValue("2026-10-31T23:45", true), "2026-10-31T23:45");
  assert.equal(calendarInputValue("29-Feb-2024"), "2024-02-29");
  for (const value of ["", "invalid", "31-Feb-2026", "2026-13-01", "2026-01-01T25:00", "2026-00-10"]) {
    assert.equal(calendarInputValue(value), "");
  }
});

test("date labels include cutoffs, schedules, and validity without matching ordinary fields", () => {
  for (const label of ["Job Date", "Challan Date", "Gate-in Date", "Doc Handover Cutoff", "SI Cut-off", "ETA (at POD)", "ETD (from POL)", "ATA (at POD)", "ATD (from POL)", "Cargo Closing", "LEO Valid Till"]) {
    assert.equal(calendarInputType(label), "date");
  }
  assert.equal(calendarInputType("Date & Time"), "datetime-local");
  for (const label of ["Updated By", "Candidate", "Vessel Name", "Container No."]) assert.equal(calendarInputType(label), undefined);
});
