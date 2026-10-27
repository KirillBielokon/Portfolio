import { test, expect } from "@playwright/test";

test("loads the portfolio with local assets and no browser errors", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("requestfailed", (request) => failures.push(request.url()));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Il digitale,con carattere.",
  );
  await expect(page.locator(".project")).toHaveCount(3);
  await expect(page.locator(".hero-art img")).toHaveJSProperty(
    "complete",
    true,
  );
  expect(
    await page.locator(".hero-art img").evaluate((img) => img.naturalWidth),
  ).toBeGreaterThan(0);
  expect(await page.locator("html").getAttribute("lang")).toBe("it");
  expect(failures).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`has no horizontal document overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const actualWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(actualWidth).toBeLessThanOrEqual(width);
    await expect(page.locator(".hero-actions a")).toBeVisible();
  });
}

test("all three case studies open, disclose concept status, and close with Escape", async ({
  page,
}) => {
  await page.goto("/");
  for (const name of ["Forma Studio", "Aether", "Campo"]) {
    const trigger = page.getByRole("button", {
      name: `Esplora ${name}, studio di design`,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
      `${name}.`,
    );
    await expect(dialog.locator(".concept-note")).toContainText(
      "brand immaginario",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});

test("services and FAQ show the selected answer and update accessibility state", async ({
  page,
}) => {
  await page.goto("/");
  const service = page.getByRole("button", {
    name: /Social con una direzione/,
  });
  await service.click();
  await expect(service).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#service-1")).toContainText("piano editoriale");
  await expect(page.locator("#service-0")).toBeHidden();
  const question = page.getByRole("button", {
    name: "Puoi seguire sia il sito sia i social?",
  });
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator(`#${await question.getAttribute("aria-controls")}`),
  ).toContainText("percorso coordinato");
  await question.click();
  await expect(question).toHaveAttribute("aria-expanded", "false");
});

test("WhatsApp uses the confirmed number and the brief preserves the visitor’s message", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Parliamone", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const direct = dialog.getByRole("link", { name: "Scrivimi su WhatsApp" });
  expect(new URL(await direct.getAttribute("href")).pathname).toBe(
    "/393896322180",
  );
  await dialog.getByLabel("Come ti chiami?").fill("Mario Rossi");
  // Email intentionally omitted: it must remain optional for a WhatsApp contact.
  await dialog.getByLabel("Gestione social", { exact: true }).check();
  const message =
    "Vorrei un piano social e un sito per la mia torrefazione. Budget e tempi da definire.";
  await dialog.getByLabel("Raccontami qualcosa").fill(message);
  await dialog.getByRole("button", { name: "Prepara il messaggio" }).click();
  await expect(dialog.getByRole("heading", { level: 2 })).toBeFocused();
  const preparedUrl = new URL(
    await dialog
      .getByRole("link", { name: "Apri WhatsApp" })
      .getAttribute("href"),
  );
  expect(preparedUrl.origin).toBe("https://wa.me");
  expect(preparedUrl.pathname).toBe("/393896322180");
  expect(preparedUrl.searchParams.get("text")).toContain(message);
  expect(preparedUrl.searchParams.get("text")).toContain("Gestione social");
  expect(preparedUrl.searchParams.get("text")).toContain("Mario Rossi");
  await dialog.getByRole("button", { name: "Modifica il messaggio" }).click();
  await expect(dialog.getByLabel("Raccontami qualcosa")).toHaveValue(message);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("mobile menu contains keyboard focus and restores background interaction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Apri menu" }).click();
  await expect(page.locator("main")).toHaveJSProperty("inert", true);
  const navigation = page.getByRole("navigation", {
    name: "Navigazione mobile",
  });
  await expect(navigation).toBeVisible();
  for (let i = 0; i < 14; i += 1) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement.closest("header")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(page.getByRole("button", { name: "Apri menu" })).toBeFocused();
  await expect(page.locator("main")).toHaveJSProperty("inert", false);
});

test("reduced motion disables ambient animation and leaves content visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-ready/);
  expect(
    await page
      .locator(".marquee-track")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await expect(page.locator("#work-title")).toHaveCSS("opacity", "1");
});
