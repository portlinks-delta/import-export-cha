import { test, expect, type Page, type Locator } from "@playwright/test";
import { initialJob } from "../../app/model";

async function start(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /Create Export Job/ }).click();
}
async function section(page: Page, name: string) {
  await page.getByRole("navigation", { name: "Job creation steps" }).getByRole("button", { name }).click();
}
async function aligned(table: Locator) {
  const widths = await table.locator("tr").evaluateAll((rows) => rows.map((row) =>
    Array.from(row.children).reduce((sum, cell) => sum + (cell as HTMLTableCellElement).colSpan, 0)));
  expect(new Set(widths).size).toBe(1);
}

test("Export changes stay with related features and survive a draft reload", async ({ page }, testInfo) => {
  await start(page);
  const cutoff = page.getByLabel("Doc Handover Cutoff", { exact: true });
  await expect(cutoff).toHaveAttribute("type", "date");
  await expect(cutoff).toHaveValue("");
  await cutoff.fill("2026-11-02");
  await expect(page.locator(".documents")).toHaveCount(1);
  await page.getByLabel("Shipment Type", { exact: true }).selectOption("Hazardous Cargo");
  await section(page, "3 Cargo Details");
  await expect(page.locator(".documents")).toHaveCount(0);
  for (const [row, transporter, vehicle] of [[1, "First Transport", "GJ12AB1234"], [2, "Second Transport", "MH01CD5678"]] as const) {
    await page.getByLabel(`Transporter row ${row}`, { exact: true }).fill(transporter);
    await page.getByLabel(`Vehicle number row ${row}`, { exact: true }).fill(vehicle);
  }
  expect(await page.locator("#container-transporters option").evaluateAll((items) => items.map((item) => (item as HTMLOptionElement).value))).toContain("Kutch Transport Co.");
  await section(page, "4 Parties");
  await expect(page.getByRole("heading", { name: "Notify Party", exact: true })).toBeVisible();
  const billing = page.locator(".party-card").filter({ has: page.getByRole("heading", { name: "Billing Party", exact: true }) });
  await billing.getByRole("button", { name: "Edit", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Company Name", { exact: true }).fill("Export Billing Company");
  await dialog.getByLabel("Address", { exact: true }).fill("Billing Address");
  await dialog.getByLabel("GSTIN / Tax No.", { exact: true }).fill("TEST-GST");
  await dialog.getByLabel("Contact Number", { exact: true }).fill("9876543210");
  await dialog.getByLabel("Email", { exact: true }).fill("billing@example.com");
  await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page.getByLabel("Billing Party", { exact: true })).toHaveValue("Export Billing Company");
  await section(page, "5 Customs & Clearance");
  await expect(page.locator(".documents")).toHaveCount(1);
  await expect(page.getByLabel("IGM No.", { exact: true })).toHaveCount(0);
  await page.getByLabel("EGM Number", { exact: true }).fill("EGM-2026-123");
  await page.getByLabel("EGM Date", { exact: true }).fill("2026-11-03");
  await page.getByLabel("EGM Remarks", { exact: true }).fill("Export manifest remarks");
  await page.getByLabel("CUS No.", { exact: true }).fill("CUS-456");
  await section(page, "7 Income & Expense");
  for (const [name, date] of [["Income", "2026-11-02"], ["Expense", "2026-11-03"]]) {
    const panel = page.locator(".panel").filter({ has: page.getByRole("heading", { name: `${name} Details`, exact: true }) });
    await panel.getByRole("button", { name: "Edit row", exact: true }).first().click();
    await dialog.getByLabel("Date", { exact: true }).fill(date);
    await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
  }
  await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
  await page.reload();
  await page.getByRole("button", { name: /Create Export Job/ }).click();
  await expect(cutoff).toHaveValue("2026-11-02");
  await expect(page.getByLabel("Shipment Type", { exact: true })).toHaveValue("Hazardous Cargo");
  await section(page, "3 Cargo Details");
  await expect(page.getByLabel("Transporter row 1", { exact: true })).toHaveValue("First Transport");
  await expect(page.getByLabel("Vehicle number row 2", { exact: true })).toHaveValue("MH01CD5678");
  await page.screenshot({ path: testInfo.outputPath("export-transport-desktop.png"), fullPage: true });
  await section(page, "8 Review & Save");
  for (const value of ["Hazardous Cargo", "02-Nov-2026", "03-Nov-2026", "EGM-2026-123", "CUS-456", "First Transport", "MH01CD5678", "Export Billing Company"]) {
    await expect(page.locator(".screen-content")).toContainText(value);
  }
  await expect(page.locator(".column-picker")).toHaveCount(0);
  await expect(page.locator(".review-finance")).toContainText("31,860");
});

test("all Export table menus preserve column alignment, totals, reset, and preferences", async ({ page }) => {
  await start(page);
  const cases = [
    ["3 Cargo Details", "Cargo", "VGM (KG)"],
    ["3 Cargo Details", "Container details", "Stuffing Date"],
    ["1 Job Details", "Documents", "Type"],
    ["6 Operations", "Container operations", "VGM (KG)"],
    ["7 Income & Expense", "Income", "GST Amount"],
    ["7 Income & Expense", "Expenses", "Rate (INR)"],
  ];
  for (const [step, name, column] of cases) {
    await section(page, step);
    const picker = page.locator(".column-picker").filter({ has: page.getByLabel(`${name} columns`, { exact: true }) });
    const table = picker.locator("xpath=following-sibling::table");
    const original = await table.locator("thead").innerText();
    await page.getByLabel(`${name} columns`, { exact: true }).click();
    await picker.getByLabel(column, { exact: true }).uncheck();
    await aligned(table);
    await picker.getByRole("button", { name: "Reset Columns", exact: true }).click();
    expect(await table.locator("thead").innerText()).toBe(original);
    await aligned(table);
    await picker.getByLabel(column, { exact: true }).uncheck();
  }
  await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
  await page.reload();
  await page.getByRole("button", { name: /Create Export Job/ }).click();
  for (const [step, name, column] of cases) {
    await section(page, step);
    const picker = page.locator(".column-picker").filter({ has: page.getByLabel(`${name} columns`, { exact: true }) });
    const table = picker.locator("xpath=following-sibling::table");
    await expect(table.getByRole("columnheader", { name: column, exact: true })).toHaveCount(0);
    if (name === "Income") await expect(table.locator("tfoot")).toContainText("31,860");
    if (name === "Expenses") await expect(table.locator("tfoot")).toContainText("32,391");
    await aligned(table);
  }
});

test("Export documents support real viewing, downloading, deletion, and missing-file explanations", async ({ page, context }) => {
  await start(page);
  await page.getByRole("button", { name: "Download Proforma Invoice.pdf", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("sample document");
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
  await page.locator('input[type="file"]').setInputFiles({ name: "export-proof.png", mimeType: "image/png", buffer: png });
  const popupPromise = context.waitForEvent("page");
  await page.getByRole("button", { name: "View export-proof.png", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup.locator("img")).toBeVisible();
  expect(popup.url()).toMatch(/^blob:/);
  await popup.close();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download export-proof.png", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("export-proof.png");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  expect(Buffer.concat(chunks)).toEqual(png);
  await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
  await page.reload();
  await page.getByRole("button", { name: /Create Export Job/ }).click();
  await section(page, "1 Job Details");
  await page.getByRole("button", { name: "View export-proof.png", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("earlier session");
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await page.getByRole("button", { name: "Remove export-proof.png", exact: true }).click();
  await expect(page.getByRole("button", { name: "View export-proof.png", exact: true })).toHaveCount(0);
  await section(page, "8 Review & Save");
  await expect(page.getByText("export-proof.png", { exact: true })).toHaveCount(0);
});

test("Export legacy fields migrate and mobile transport/date entry stays usable", async ({ page }, testInfo) => {
  const legacy = initialJob("Export");
  for (const key of ["EGM Number", "EGM Date", "EGM Remarks"]) delete legacy.fields[key];
  legacy.fields["IGM No."] = "OLD-EGM-123";
  legacy.fields["IGM Date"] = "09-Sep-2026";
  legacy.fields["IGM Remarks"] = "Existing manifest";
  legacy.parties = legacy.parties.filter((party) => party.role !== "Billing Party");
  await page.addInitScript((job) => {
    if (!localStorage.getItem("portlinks-draft-Export")) localStorage.setItem("portlinks-draft-Export", JSON.stringify(job));
  }, legacy);
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await page.getByLabel("Doc Handover Cutoff", { exact: true }).fill("2026-11-02");
  await page.getByLabel("Doc Handover Cutoff", { exact: true }).fill("");
  await section(page, "5 Customs & Clearance");
  await expect(page.getByLabel("EGM Number", { exact: true })).toHaveValue("OLD-EGM-123");
  await expect(page.getByLabel("EGM Date", { exact: true })).toHaveValue("2026-09-09");
  await section(page, "3 Cargo Details");
  await page.getByLabel("Transporter row 1", { exact: true }).fill("Mobile Transport");
  await page.getByLabel("Vehicle number row 1", { exact: true }).fill("GJ12AA1234");
  await page.getByLabel("Cargo columns", { exact: true }).click();
  await page.getByRole("group", { name: "Cargo column visibility" }).getByLabel("Vehicle Number", { exact: true }).uncheck();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("export-transport-mobile.png"), fullPage: true });
  await section(page, "7 Income & Expense");
  for (const name of ["Income", "Expense"]) {
    await page.getByRole("button", { name: `Add ${name}`, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Particulars", { exact: true }).fill(`New ${name}`);
    await dialog.getByLabel("Rate (INR)", { exact: true }).fill("250");
    await dialog.getByLabel("Date", { exact: true }).fill("2026-11-02");
    await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
    const row = page.getByRole("row").filter({ has: page.getByRole("cell", { name: `New ${name}`, exact: true }) });
    await expect(row).toContainText("02-Nov-2026");
    await expect(row).toContainText("295");
    await row.getByRole("button", { name: "Edit row", exact: true }).click();
    await dialog.getByLabel("Date", { exact: true }).fill("");
    await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
    await expect(row.getByRole("cell").nth(2)).toHaveText("–");
  }
  await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
  await page.reload();
  await page.getByRole("button", { name: /Create Export Job/ }).click();
  await expect(page.getByLabel("Doc Handover Cutoff", { exact: true })).toHaveValue("");
  await section(page, "7 Income & Expense");
  for (const name of ["Income", "Expense"]) {
    const row = page.getByRole("row").filter({ has: page.getByRole("cell", { name: `New ${name}`, exact: true }) });
    await expect(row.getByRole("cell").nth(2)).toHaveText("–");
  }
});
