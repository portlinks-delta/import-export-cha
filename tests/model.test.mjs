import { test } from "node:test";
import assert from "node:assert/strict";
import { initialJob, totals, restoreDraft, number } from "../app/model.ts";
test("reference financial totals differ correctly by workflow", () => {
  const exp = initialJob("Export"),
    imp = initialJob("Import");
  assert.deepEqual(totals(exp.income), {
    base: 27000,
    gst: 4860,
    total: 31860,
  });
  assert.deepEqual(totals(exp.expense), {
    base: 27450,
    gst: 4941,
    total: 32391,
  });
  assert.equal(totals(imp.income).total, 22000);
  assert.equal(totals(imp.expense).total, 146000);
});
test("edited quantity, rate and GST determine totals", () => {
  assert.deepEqual(totals([{ qty: "2", rate: "1,000", gst: "18" }]), {
    base: 2000,
    gst: 360,
    total: 2360,
  });
  assert.deepEqual(totals([]), { base: 0, gst: 0, total: 0 });
  assert.equal(number("1,46,500"), 146500);
});
test("drafts restore edits and recover from invalid storage", () => {
  const job = initialJob("Import");
  job.fields.Client = "Edited Client";
  job.containers.pop();
  assert.deepEqual(restoreDraft("Import", JSON.stringify(job)), job);
  for (const raw of [null, "bad json", "{}", '{"fields":{}}'])
    assert.deepEqual(restoreDraft("Export", raw), initialJob("Export"));
});
test("Import and Export defaults are independent", () => {
  const a = initialJob("Import"),
    b = initialJob("Export");
  a.fields.Client = "Changed";
  a.containers[0].number = "Changed";
  assert.equal(b.fields["Client / Exporter"], "ABC Exports Pvt. Ltd.");
  assert.equal(b.containers[0].number, "MEDU1234567");
  assert.equal(
    a.containers.reduce((n, r) => n + number(r.packages), 0),
    390,
  );
  assert.equal(
    b.containers.reduce((n, r) => n + number(r.weight), 0),
    46700,
  );
});
