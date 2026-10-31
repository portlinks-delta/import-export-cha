import { test, expect, type Page } from "@playwright/test";

async function section(page: Page, name: string) {
  await page.getByRole("navigation", { name: "Job creation steps" }).getByRole("button", { name }).click();
}

for (const type of ["Import", "Export"]) {
  test(`${type} dates use native calendars throughout forms and dialogs`, async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: new RegExp(`Create ${type} Job`) }).click();
    const jobDate = page.getByLabel("Job Date", { exact: true });
    await expect(jobDate).toHaveAttribute("type", "date");
    await expect(jobDate).toHaveValue("2026-09-09");
    await jobDate.fill("2026-10-31");
    await expect(page.locator(".summary-card").first()).toContainText("31-Oct-2026");

    const screen = page.locator(".screen-content");
    const groups = type === "Import" ? [
      ["1 Job Details", ["BL Date", "HB/L Date"]],
      ["2 Vessel & Voyage", ["ETA (at POD)", "ETD (from POL)", "ATA (at POD)", "ATD (from POL)"]],
      ["5 Customs & Clearance", ["BE Date", "Assessment Date", "Examination Date", "OOC Date", "Gate Out Date", "Delivery Date"]],
      ["6 Operations", ["Examination Date"]],
      ["7 Income & Expense", ["Expected Payment Date"]],
    ] as const : [
      ["1 Job Details", ["Booking Date", "SB Date", "BL Date", "Shipping Instruction (SI) Date", "VGM Cut-off", "SI Cut-off", "Gate-in Cut-off", "ETD (from POL)", "ETA (at POD)"]],
      ["2 Vessel & Voyage", ["ETD (from POL)", "ATD (from POL)", "ETA (at POD)", "ATA (at POD)", "Shipping Instruction (SI) Cut-off", "VGM Cut-off", "Gate-in Cut-off", "Port Cut-off", "Customs Cut-off (SB Filing)", "Cargo Closing"]],
      ["5 Customs & Clearance", ["Shipping Bill Date", "IGM Date", "CUS Date", "Assessment Date", "Examination Date", "LEO Date", "LEO Valid Till"]],
      ["6 Operations", ["Empty Pickup Date", "Stuffing Date", "Gate-in Date", "Loaded on Vessel Date", "Vessel Sailed Date", "BL Date", "Operation Date"]],
    ] as const;
    for (const [step, labels] of groups) {
      await section(page, step);
      for (const label of labels) {
        await expect(screen.getByLabel(label, { exact: true }).first(), `${type}: ${label}`).toHaveAttribute("type", "date");
      }
    }

    await section(page, "3 Cargo Details");
    await page.getByRole("button", { name: "Edit container MEDU1234567", exact: true }).click();
    const dialog = page.getByRole("dialog");
    for (const label of ["Empty Pickup Date", "Stuffing Date", "Gate-in Date"]) {
      await expect(dialog.getByLabel(label, { exact: true })).toHaveAttribute("type", "date");
      await dialog.getByLabel(label, { exact: true }).fill("2026-11-02");
    }
    await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
    await page.getByRole("button", { name: "Edit container MEDU1234567", exact: true }).click();
    await expect(dialog.getByLabel("Stuffing Date", { exact: true })).toHaveValue("2026-11-02");
    await dialog.getByLabel("Gate-in Date", { exact: true }).fill("");
    await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();

    if (type === "Import") {
      await section(page, "5 Customs & Clearance");
      const duties = page.locator(".panel").filter({ has: page.getByRole("heading", { name: "Duty & Payment Details", exact: true }) });
      await duties.getByRole("button", { name: "Edit row", exact: true }).first().click();
      for (const label of ["Challan Date", "Payment Date"]) {
        await expect(dialog.getByLabel(label, { exact: true })).toHaveAttribute("type", "date");
        await expect(dialog.getByLabel(label, { exact: true })).toHaveValue("2026-09-09");
      }
      await dialog.getByLabel("Payment Date", { exact: true }).fill("2026-11-03");
      await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
      await expect(duties).toContainText("03-Nov-2026");
      await section(page, "6 Operations");
      const gates = page.getByRole("table", { name: "Gate in and gate out records" });
      await gates.getByRole("button", { name: "Edit row", exact: true }).first().click();
      await expect(dialog.getByLabel("Date & Time", { exact: true })).toHaveAttribute("type", "datetime-local");
      await expect(dialog.getByLabel("Date & Time", { exact: true })).toHaveValue("2026-09-09T08:30");
      await dialog.getByLabel("Date & Time", { exact: true }).fill("2026-10-31T23:45");
      await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
      await expect(gates).toContainText("31-Oct-2026 23:45");
      await gates.getByRole("button", { name: "Edit row", exact: true }).first().click();
      await expect(dialog.getByLabel("Date & Time", { exact: true })).toHaveValue("2026-10-31T23:45");
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    }

    await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
    await page.reload();
    await page.getByRole("button", { name: new RegExp(`Create ${type} Job`) }).click();
    await expect(jobDate).toHaveValue("2026-10-31");
    await section(page, "8 Review & Save");
    await expect(screen).toContainText("31-Oct-2026");
  });
}
