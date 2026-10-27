import { test, expect } from "@playwright/test";
test("all seventeen reference screens render and both jobs can be created", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Every shipment." }),
  ).toBeVisible();
  for (const type of ["Import", "Export"]) {
    await page
      .getByRole("button", { name: new RegExp(`Create ${type} Job`) })
      .click();
    await page
      .getByLabel("Job Reference", { exact: true })
      .fill(`${type}-TEST`);
    await page
      .getByRole("button", { name: "Save Draft", exact: true })
      .first()
      .click();
    await expect(page.getByRole("status")).toContainText("draft saved");
    for (const [i, step] of [
      "Job Details",
      "Vessel & Voyage",
      "Cargo Details",
      "Parties",
      "Customs & Clearance",
      "Operations",
      "Income & Expense",
      "Review & Save",
    ].entries()) {
      await page
        .getByRole("navigation", { name: "Job creation steps" })
        .getByRole("button", { name: new RegExp(step.replaceAll("&", "&")) })
        .click();
      await expect(page.locator(".screen-heading h2")).toContainText(
        `${i + 1}.`,
      );
      await expect(page.locator(".screen-content")).toBeVisible();
      if (i === 1 && type === "Import") {
        await page
          .getByPlaceholder("Type vessel name, voyage no. or IMO no...")
          .pressSequentially("ONE");
        await expect(page.getByRole("radio")).toHaveCount(1);
        await page
          .getByPlaceholder("Type vessel name, voyage no. or IMO no...")
          .fill("");
        await page
          .getByRole("button", { name: "2 Enter New Voyage", exact: true })
          .click();
        await expect(
          page
            .locator(".panel-title h3")
            .filter({ hasText: "Enter New Voyage" }),
        ).toBeVisible();
        await page.screenshot({
          path: `test-results/${type}-voyage-new.png`,
          fullPage: true,
        });
        await page
          .getByRole("button", {
            name: "1 Search Existing Voyage",
            exact: true,
          })
          .click();
      }
      await page.screenshot({
        path: `test-results/${type}-${i + 1}.png`,
        fullPage: true,
      });
    }
    await expect(page.locator(".review-grid")).toContainText(`${type}-TEST`);
    await page
      .locator(".bottom-bar")
      .getByRole("button", {
        name: type === "Export" ? "Create Export Job" : "Save & Create Job",
        exact: true,
      })
      .click();
    await expect(page.getByRole("dialog")).toContainText(
      "Job created successfully",
    );
    await page.getByRole("button", { name: "Got it", exact: true }).click();
    await page
      .getByRole("button", { name: "Portlinks home", exact: true })
      .click();
  }
  expect(errors).toEqual([]);
});
test("container and finance edits recalculate and drafts survive reload", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Create Export Job/ }).click();
  const steps = page.getByRole("navigation", { name: "Job creation steps" });
  await steps.getByRole("button", { name: /Cargo Details/ }).click();
  await page
    .getByRole("button", { name: "Add Container", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Container No.", { exact: true }).fill("TEST123");
  await dialog.getByLabel("Size / Type", { exact: true }).fill("40 HC");
  await dialog.getByLabel("Packages", { exact: true }).fill("10");
  await dialog.getByLabel("Gross Weight (KG)", { exact: true }).fill("1000");
  await dialog.getByLabel("VGM (KG)", { exact: true }).fill("1100");
  await dialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.locator(".cargo-stats.side")).toContainText("310");
  await steps.getByRole("button", { name: /Income & Expense/ }).click();
  await page.getByRole("button", { name: "Add Income", exact: true }).click();
  await dialog.getByLabel("Particulars", { exact: true }).fill("Test income");
  await dialog.getByLabel("Rate (INR)", { exact: true }).fill("1000");
  await dialog.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.locator(".income-panel")).toContainText("33,040");
  await page
    .getByRole("button", { name: "Save Draft", exact: true })
    .first()
    .click();
  await page.reload();
  await page.getByRole("button", { name: /Create Export Job/ }).click();
  await steps.getByRole("button", { name: /Income & Expense/ }).click();
  await expect(page.locator(".income-panel")).toContainText("Test income");
  await page
    .getByRole("row")
    .filter({ hasText: "Test income" })
    .getByRole("button", { name: "Delete row" })
    .click();
  await expect(page.locator(".income-panel")).not.toContainText("Test income");
});
test("required fields block continuation and mobile has no page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Create Import Job/ }).click();
  await page.getByLabel("BL No.", { exact: true }).fill("");
  await page
    .locator(".bottom-bar")
    .getByRole("button", { name: "Save & Continue", exact: true })
    .click();
  await expect(page.locator(".validation")).toContainText("BL No.");
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true);
  await page
    .getByRole("navigation", { name: "Job creation steps" })
    .getByRole("button", { name: /Cargo Details/ })
    .click();
  expect(
    await page.evaluate(() => document.body.scrollWidth <= innerWidth),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-cargo.png",
    fullPage: true,
  });
});
test("compact cargo table supports inline edits, dropdowns and bulk removal", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Create Import Job/ }).click();
  await page
    .getByRole("navigation", { name: "Job creation steps" })
    .getByRole("button", { name: /Cargo Details/ })
    .click();
  const table = page.getByRole("table", { name: "Cargo container details" });
  await table.getByLabel("Packages row 1", { exact: true }).fill("150");
  await table.getByLabel("Packages row 1", { exact: true }).press("Tab");
  await expect(table.locator("tfoot")).toContainText("420");
  await table.getByLabel("Gross weight row 1", { exact: true }).fill("20000");
  await table.getByLabel("Gross weight row 1", { exact: true }).press("Tab");
  await expect(table.locator("tfoot")).toContainText("63,500");
  await table
    .getByLabel("Container number row 1", { exact: true })
    .press("End");
  await table
    .getByLabel("Container number row 1", { exact: true })
    .pressSequentially("XYZ");
  await expect(
    table.getByLabel("Container number row 1", { exact: true }),
  ).toHaveValue("MEDU1234567XYZ");
  await table
    .getByLabel("Size/type row 1", { exact: true })
    .selectOption("20 GP");
  await table.getByLabel("IMDG row 1", { exact: true }).selectOption("Yes");
  await table
    .getByRole("checkbox", { name: "Select all containers", exact: true })
    .check();
  await expect(page.locator(".selection-bar")).toContainText(
    "4 of 4 rows selected",
  );
  await page
    .getByRole("button", { name: "Delete selected", exact: true })
    .click();
  await expect(
    page.getByText("No containers added", { exact: true }),
  ).toBeVisible();
});
