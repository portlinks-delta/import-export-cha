import { test, expect, type Page, type Locator } from "@playwright/test";
import { initialJob } from "../../app/model";

async function start(page: Page, type = "Import") {
  await page.goto("/");
  await page.getByRole("button", { name: new RegExp(`Create ${type} Job`) }).click();
}
async function section(page: Page, name: string) {
  await page.getByRole("navigation", { name: "Job creation steps" }).getByRole("button", { name }).click();
}
async function aligned(table: Locator) {
  const widths = await table.locator("tr").evaluateAll((rows) => rows.map((row) =>
    Array.from(row.children).reduce((sum, cell) => sum + (cell as HTMLTableCellElement).colSpan, 0)));
  expect(new Set(widths).size).toBe(1);
}

test("Import transport, dates, column preferences, and review survive draft reload", async ({ page }, testInfo) => {
  await start(page);
  await page.getByLabel("Shipment Type", { exact: true }).selectOption("Project Cargo");
  await page.getByLabel("Job Date", { exact: true }).fill("2026-10-31");
  await expect(page.locator(".summary-card").first()).toContainText("31-Oct-2026");
  await section(page, "3 Cargo Details");
  await page.getByLabel("Transporter row 1", { exact: true }).fill("First Transport");
  await page.getByLabel("Vehicle number row 1", { exact: true }).fill("GJ01AB1234");
  await page.getByLabel("Transporter row 2", { exact: true }).fill("Second Transport");
  await page.getByLabel("Vehicle number row 2", { exact: true }).fill("MH01CD5678");
  await page.getByRole("button", { name: "Edit container MEDU1234567", exact: true }).click();
  await expect(page.getByRole("dialog").getByLabel("Transporter", { exact: true })).toHaveValue("First Transport");
  await page.getByRole("dialog").getByLabel("Vehicle Number", { exact: true }).fill("GJ01AB4321");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await page.getByLabel("Cargo columns", { exact: true }).click();
  const cargoOptions = page.getByRole("group", { name: "Cargo column visibility" });
  await expect(cargoOptions.getByLabel("Container No.", { exact: true })).toBeDisabled();
  await cargoOptions.getByLabel("Seal No.", { exact: true }).uncheck();
  await cargoOptions.getByLabel("Size/Type", { exact: true }).uncheck();
  const cargo = page.getByRole("table", { name: "Cargo container details" });
  await expect(cargo.getByRole("columnheader", { name: "Seal No." })).toHaveCount(0);
  await expect(cargo.locator("tfoot")).toContainText("62,000");
  await aligned(cargo);
  await page.getByLabel("Cargo columns", { exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath("import-cargo-desktop.png"), fullPage: true });
  await section(page, "4 Parties");
  await expect(page.getByRole("heading", { name: "Billing To Party", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Notify Party", exact: true })).toHaveCount(0);
  await section(page, "7 Income & Expense");
  for (const [name, date] of [["Income", "2026-10-31"], ["Expense", "2026-11-01"]]) {
    const panel = page.locator(".panel").filter({ has: page.getByRole("heading", { name: `${name} Details`, exact: true }) });
    await panel.getByRole("button", { name: "Edit row", exact: true }).first().click();
    await page.getByRole("dialog").getByLabel("Date", { exact: true }).fill(date);
    await page.getByRole("button", { name: "Save Changes" }).click();
    await expect(panel.getByRole("table")).toContainText(name === "Income" ? "31-Oct-2026" : "01-Nov-2026");
  }
  await page.getByLabel("Income columns", { exact: true }).click();
  await page.getByRole("group", { name: "Income column visibility" }).getByLabel("Remarks", { exact: true }).uncheck();
  await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
  await page.reload();
  await page.getByRole("button", { name: /Create Import Job/ }).click();
  await expect(page.getByLabel("Shipment Type", { exact: true })).toHaveValue("Project Cargo");
  await expect(page.getByLabel("Job Date", { exact: true })).toHaveValue("2026-10-31");
  await section(page, "3 Cargo Details");
  await expect(page.getByLabel("Vehicle number row 1", { exact: true })).toHaveValue("GJ01AB4321");
  await expect(page.getByLabel("Transporter row 2", { exact: true })).toHaveValue("Second Transport");
  await expect(cargo.getByRole("columnheader", { name: "Seal No." })).toHaveCount(0);
  await section(page, "8 Review & Save");
  await expect(page.locator(".screen-content")).toContainText("First Transport");
  await expect(page.locator(".screen-content")).toContainText("MH01CD5678");
  await expect(page.locator(".screen-content")).toContainText("31-Oct-2026");
  await expect(page.locator(".screen-content")).toContainText("01-Nov-2026");
  await expect(page.locator(".column-picker")).toHaveCount(0);
  await expect(page.getByRole("table", { name: "Container summary" }).getByRole("columnheader", { name: "Seal No." })).toBeVisible();
});

test("all Import column menus preserve alignment, totals, and reset independently", async ({ page }) => {
  await start(page);
  const cases = [
    ["2 Vessel & Voyage", "Voyages", "IMO No."],
    ["3 Cargo Details", "Cargo", "Gross Weight"],
    ["5 Customs & Clearance", "Duties", "Amount (INR)"],
    ["5 Customs & Clearance", "Documents", "Type"],
    ["6 Operations", "Gate records", "Activity"],
    ["7 Income & Expense", "Income", "Rate (INR)"],
    ["7 Income & Expense", "Expenses", "Amount (INR)"],
  ];
  for (const [step, name, column] of cases) {
    await section(page, step);
    const picker = page.locator(".column-picker").filter({ has: page.getByLabel(`${name} columns`, { exact: true }) });
    const table = picker.locator("xpath=following-sibling::table");
    const original = await table.locator("thead").innerText();
    await page.getByLabel(`${name} columns`, { exact: true }).click();
    await picker.getByLabel(column, { exact: true }).uncheck();
    await aligned(table);
    await picker.getByRole("button", { name: "Reset Columns" }).click();
    expect(await table.locator("thead").innerText()).toBe(original);
    await aligned(table);
  }
});

test("Import progress and legacy completion stay consistent", async ({ page }) => {
  const legacy = initialJob("Import");
  delete legacy.importVersion;
  legacy.activity = 9;
  legacy.parties[3].role = "Notify Party";
  await page.addInitScript((job) => {
    if (!localStorage.getItem("portlinks-draft-Import")) localStorage.setItem("portlinks-draft-Import", JSON.stringify(job));
  }, legacy);
  await start(page);
  await section(page, "6 Operations");
  await expect(page.locator(".timeline button").last()).toHaveClass(/done/);
  await page.locator(".timeline").getByRole("button", { name: /Delivery/ }).click();
  await page.getByRole("button", { name: "Mark as Completed", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Current Activity - Empty Container Return", exact: true })).toBeVisible();
  await section(page, "5 Customs & Clearance");
  const progress = page.locator(".summary-card").filter({ has: page.getByRole("heading", { name: "Customs Progress", exact: true }) });
  await expect(progress.locator("button").filter({ hasText: "Delivery" })).toHaveClass("done");
  await expect(progress.locator("button").filter({ hasText: "Empty Container Return" })).toHaveClass("active");
  await section(page, "6 Operations");
  await page.getByRole("button", { name: "Mark as Completed", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Current Activity - Job Completed", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mark as Completed", exact: true }).click();
  await expect(page.locator(".timeline button").last()).toHaveClass(/done/);
  await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
  await page.reload();
  await page.getByRole("button", { name: /Create Import Job/ }).click();
  await section(page, "6 Operations");
  await expect(page.locator(".timeline button").last()).toHaveClass(/done/);
});

test("new income and expense dates can be added, cleared, and saved", async ({ page }) => {
  await start(page);
  await section(page, "7 Income & Expense");
  for (const name of ["Income", "Expense"]) {
    await page.getByRole("button", { name: `Add ${name}`, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Particulars", { exact: true }).fill(`New ${name}`);
    await dialog.getByLabel("Rate (INR)", { exact: true }).fill("125");
    await dialog.getByLabel("Date", { exact: true }).fill("2026-10-31");
    await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
    const row = page.getByRole("row").filter({ has: page.getByRole("cell", { name: `New ${name}`, exact: true }) });
    await expect(row).toContainText("31-Oct-2026");
    await row.getByRole("button", { name: "Edit row", exact: true }).click();
    await dialog.getByLabel("Date", { exact: true }).fill("");
    await dialog.getByRole("button", { name: "Save Changes", exact: true }).click();
    await expect(row.getByRole("cell").nth(2)).toHaveText("–");
  }
  await page.getByRole("button", { name: "Save Draft", exact: true }).first().click();
  await page.reload();
  await page.getByRole("button", { name: /Create Import Job/ }).click();
  await section(page, "7 Income & Expense");
  for (const name of ["Income", "Expense"]) {
    const row = page.getByRole("row").filter({ has: page.getByRole("cell", { name: `New ${name}`, exact: true }) });
    await expect(row.getByRole("cell").nth(2)).toHaveText("–");
    await expect(row).toContainText("125");
  }
});

test("mobile Import controls fit and Export keeps its existing fields", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await section(page, "3 Cargo Details");
  await page.getByLabel("Cargo columns", { exact: true }).click();
  await page.getByRole("group", { name: "Cargo column visibility" }).getByLabel("Seal No.", { exact: true }).uncheck();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("import-cargo-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await section(page, "3 Cargo Details");
  await expect(page.locator(".column-picker")).toHaveCount(0);
  await expect(page.getByLabel("Transporter row 1", { exact: true })).toHaveCount(0);
  await section(page, "4 Parties");
  await expect(page.getByRole("heading", { name: "Notify Party", exact: true })).toBeVisible();
  await section(page, "5 Customs & Clearance");
  await expect(page.getByRole("heading", { name: "IGM / CUS Details (Optional)", exact: true })).toBeVisible();
  await expect(page.getByText("Empty Container Return", { exact: true })).toHaveCount(0);
  await section(page, "7 Income & Expense");
  await expect(page.locator(".column-picker")).toHaveCount(0);
  await page.getByRole("button", { name: "Add Income", exact: true }).click();
  await expect(page.getByRole("dialog").getByLabel("Date", { exact: true })).toHaveCount(0);
});
