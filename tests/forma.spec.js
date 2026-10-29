import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const entry = "/demo/forma/";
async function open(page, route = "/") {
  await page.goto(`${entry}#${route}`);
  await page.evaluate(() => document.fonts.ready);
}
const desktopNav = (page) =>
  page.getByRole("navigation", { name: "Navigazione principale della demo" });

test("the standalone demo has real page navigation, browser history and refreshable project URLs", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("requestfailed", (request) => failures.push(request.url()));
  await open(page);
  await expect(
    page.getByText("Progetto personale dimostrativo", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Spazi da abitare.",
  );
  await expect(
    page.getByRole("link", { name: "Torna al portfolio", exact: true }),
  ).toHaveAttribute("href", "/");
  await desktopNav(page)
    .getByRole("link", { name: "Progetti", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/progetti$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Ogni spazio,",
  );
  await desktopNav(page)
    .getByRole("link", { name: "Lo studio", exact: true })
    .click();
  await expect(page).toHaveURL(/#\/studio$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "La forma segue",
  );
  await desktopNav(page)
    .getByRole("link", { name: "Contatti", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Ogni spazio parte",
  );
  await page.goBack();
  await expect(page).toHaveURL(/#\/studio$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "La forma segue",
  );
  await page.goForward();
  await expect(page).toHaveURL(/#\/contatti$/);
  await expect(
    page.getByRole("textbox", { name: "Nome *", exact: true }),
  ).toBeVisible();
  await page.goto(`${entry}#/progetti/loft-luce`);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Loft Luce.",
  );
  await expect(page).toHaveTitle(/Loft Luce — Forma Studio/);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
  }
  expect(failures).toEqual([]);
});

test("project filters lead to complete case studies, a usable image viewer and the next project", async ({
  page,
}) => {
  await open(page, "/progetti");
  const projects = page.locator(".forma-project-grid");
  const filters = page.getByRole("group", {
    name: "Filtra i progetti per tipologia",
  });
  await expect(projects.getByRole("article")).toHaveCount(3);
  await filters.getByRole("button", { name: "Interni", exact: true }).click();
  await expect(
    filters.getByRole("button", { name: "Interni", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(projects.getByRole("article")).toHaveCount(1);
  await expect(
    projects.getByRole("link", { name: "Esplora Loft Luce", exact: true }),
  ).toBeVisible();
  await expect(
    projects.getByRole("link", { name: "Esplora Villa Silenzio", exact: true }),
  ).toHaveCount(0);
  await projects
    .getByRole("link", { name: "Esplora Loft Luce", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Loft Luce.",
  );
  await expect(page.locator("main")).toContainText(
    "Studio personale, non realizzato",
  );
  const zoom = page.getByRole("button", {
    name: "Ingrandisci la visualizzazione di Loft Luce",
  });
  await zoom.click();
  const dialog = page.getByRole("dialog", { name: "Loft Luce" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveJSProperty("complete", true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(zoom).toBeFocused();
  await page.locator(".forma-next-project").getByRole("link").click();
  await expect(page).toHaveURL(/#\/progetti\/padiglione-comune$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Padiglione Comune.",
  );
  await page
    .getByRole("link", { name: "Tutti i progetti", exact: true })
    .click();
  await expect(projects.getByRole("article")).toHaveCount(3);
});

test("the contact journey validates input and prepares a complete local summary without sending it", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/progetti/villa-silenzio");
  await page
    .getByRole("link", { name: "Partiamo da questa idea", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", {
      name: "Un concept ti ha ispirato?",
      exact: true,
    }),
  ).toHaveValue("villa-silenzio");
  await expect(page.locator("main")).toContainText(
    "Non vengono inviati, salvati sul server o registrati.",
  );
  const prepare = page.getByRole("button", {
    name: "Prepara il riepilogo",
    exact: true,
  });
  await prepare.click();
  await expect(page.getByRole("heading", { name: /La tua idea,/ })).toHaveCount(
    0,
  );
  expect(
    await page
      .getByRole("textbox", { name: "Nome *", exact: true })
      .evaluate((el) => el.validity.valueMissing),
  ).toBe(true);
  await page
    .getByRole("textbox", { name: "Nome *", exact: true })
    .fill("Giulia Test");
  await page
    .getByRole("textbox", { name: "Email *", exact: true })
    .fill("indirizzo-invalido");
  const idea =
    "Vorrei uno spazio luminoso con materiali naturali e un collegamento diretto al giardino.";
  await page
    .getByRole("textbox", { name: "La tua idea *", exact: true })
    .fill(idea);
  await prepare.click();
  expect(
    await page
      .getByRole("textbox", { name: "Email *", exact: true })
      .evaluate((el) => el.validity.typeMismatch),
  ).toBe(true);
  await expect(prepare).toBeVisible();
  await page
    .getByRole("textbox", { name: "Email *", exact: true })
    .fill("giulia@example.com");
  await page
    .getByRole("combobox", { name: "Tipo di spazio", exact: true })
    .selectOption("Interni");
  const submissions = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method()))
      submissions.push(request.url());
  });
  await prepare.click();
  const summaryHeading = page.getByRole("heading", {
    level: 2,
    name: /La tua idea,/,
  });
  await expect(summaryHeading).toBeVisible();
  await expect(summaryHeading).toBeFocused();
  await expect(page.locator("main")).toContainText(
    "nessun messaggio è stato inviato",
  );
  const summary = page.locator(".forma-summary pre");
  for (const value of [
    "Giulia Test",
    "giulia@example.com",
    "Interni",
    "Villa Silenzio",
    idea,
  ])
    await expect(summary).toContainText(value);
  await page
    .getByRole("button", { name: "Copia il riepilogo", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Riepilogo copiato.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    idea,
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Scarica il riepilogo", exact: true })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("forma-progetto-demo.txt");
  const text = await readFile(await file.path(), "utf8");
  expect(text).toContain(idea);
  expect(text).toContain("Villa Silenzio");
  expect(text).toContain("Nessun messaggio è stato inviato");
  await page
    .getByRole("button", { name: "Torna al modulo", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Nome *", exact: true }),
  ).toHaveValue("Giulia Test");
  await expect(
    page.getByRole("textbox", { name: "La tua idea *", exact: true }),
  ).toHaveValue(idea);
  expect(submissions).toEqual([]);
});

test("the phone menu supports keyboard, Escape, page navigation and desktop resizing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const skip = page.getByRole("link", {
    name: "Vai al contenuto",
    exact: true,
  });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).not.toHaveURL(/#forma-main$/);
  const toggle = page.getByRole("button", {
    name: "Apri menu Forma",
    exact: true,
  });
  await toggle.click();
  const menu = page.getByRole("navigation", {
    name: "Navigazione mobile della demo",
  });
  await expect(menu).toBeVisible();
  await expect(page.locator("main")).toHaveJSProperty("inert", true);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => !!document.activeElement.closest("header")),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(page.locator("main")).toHaveJSProperty("inert", false);
  await toggle.click();
  await menu.getByRole("link", { name: /Progetti/ }).click();
  await expect(page).toHaveURL(/#\/progetti$/);
  await expect(menu).toBeHidden();
  await expect(page.locator("main")).toHaveJSProperty("inert", false);
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(menu).toBeHidden();
  await expect(page.locator("main")).toHaveJSProperty("inert", false);
});

for (const width of [320, 390, 768, 1440]) {
  test(`the complete Forma experience is readable without overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    for (const route of ["/", "/progetti", "/studio", "/contatti"]) {
      await page.goto(`${entry}#${route}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page
          .getByText("Progetto personale dimostrativo", { exact: true })
          .first(),
      ).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
    await page
      .getByRole("textbox", { name: "Nome *", exact: true })
      .fill("Test Demo");
    await page
      .getByRole("textbox", { name: "Email *", exact: true })
      .fill("test@example.com");
    await page
      .getByRole("textbox", { name: "La tua idea *", exact: true })
      .fill(
        "Una richiesta dimostrativa per verificare il modulo anche su telefono.",
      );
    await page
      .getByRole("button", { name: "Prepara il riepilogo", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Scarica il riepilogo", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}

test("the demo pause and runtime reduced-motion preference stop actual continuous movement", async ({
  page,
}) => {
  await open(page);
  const orbit = page.locator(".forma-quote-orbit");
  await page.locator(".forma-home-quote").scrollIntoViewIfNeeded();
  const first = await orbit.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => orbit.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(first);
  await page
    .getByRole("button", { name: "Pausa animazioni della demo", exact: true })
    .click();
  await expect(page.locator(".forma-app")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  await expect(orbit).toHaveCSS("animation-play-state", "paused");
  const stopped = await orbit.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(160);
  expect(await orbit.evaluate((el) => getComputedStyle(el).transform)).toBe(
    stopped,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", {
      name: "Riprendi animazioni della demo",
      exact: true,
    })
    .click();
  await expect(page.locator(".forma-app")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  await expect(orbit).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".forma-app")).toHaveAttribute(
    "data-motion",
    "running",
  );
  const resumed = await orbit.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => orbit.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(resumed);
});
