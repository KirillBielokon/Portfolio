import { test, expect } from "@playwright/test";

async function open(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  return errors;
}

async function loadAllImages(page) {
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach((img) => (img.loading = "eager"));
    await Promise.all(
      [...document.images].map((img) =>
        img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true }) || img.addEventListener("error", r, { once: true })),
      ),
    );
  });
}

test("content is in the HTML for search engines, without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Siti che portano");
  await expect(page.getByRole("heading", { name: "Studio", exact: true })).toBeVisible();
  // Reveal animations must not hide content when JS is off.
  await expect(page.locator(".case__lead").first()).toHaveCSS("opacity", "1");
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld["@graph"][0]["@type"]).toBe("ProfessionalService");
  await ctx.close();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`layout at ${width}px: no horizontal scroll, images load, no errors`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = await open(page);
    await loadAllImages(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    const broken = await page.evaluate(() =>
      [...document.images].filter((i) => !i.naturalWidth).map((i) => i.currentSrc || i.src),
    );
    expect(broken).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("navigation links reach every section", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page);
  for (const id of ["lavori", "servizi", "metodo", "faq"]) {
    await page.locator(`.nav__links a[href="#${id}"]`).click();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await page.locator(".nav__cta").click();
  await expect(page.locator("#contatti")).toBeInViewport();
});

test("mobile menu opens, navigates, closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const toggle = page.locator("[data-menu-toggle]");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.locator("#menu a[href='#servizi']").click();
  await expect(page.locator("#menu")).toBeHidden();
  await expect(page.locator("#servizi")).toBeInViewport();
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu")).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("FAQ keeps one answer open at a time", async ({ page }) => {
  await open(page);
  const items = page.locator(".qa");
  await items.nth(0).locator("summary").click();
  await items.nth(1).locator("summary").click();
  await expect(items.nth(0)).not.toHaveAttribute("open", "");
  await expect(items.nth(1)).toHaveAttribute("open", "");
});

test("brief asks for a name, then prepares the WhatsApp message", async ({ page, context }) => {
  await open(page);
  await page.locator("#contatti").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Invia su WhatsApp/ }).click();
  await expect(page.locator("[data-brief-error]")).toBeVisible();
  await expect(page.locator("#b-nome")).toBeFocused();

  await page.fill("#b-nome", "Marta, Pasticceria Rossi");
  await page.locator('input[name="tipo"][value="Sito web"]').check();
  await page.locator('input[name="budget"][value="1.000–3.000 €"]').check();
  await page.fill("#b-msg", "Vorrei ricevere ordini per le torte.");

  // Capture the URL instead of opening a real WhatsApp tab.
  await page.evaluate(() => {
    window.__opened = null;
    window.open = (url) => ((window.__opened = url), null);
  });
  await page.getByRole("button", { name: /Invia su WhatsApp/ }).click();
  const url = new URL(await page.evaluate(() => window.__opened));
  expect(url.origin + url.pathname).toBe("https://wa.me/393896322180");
  const text = url.searchParams.get("text");
  expect(text).toContain("sono Marta, Pasticceria Rossi");
  expect(text).toContain("Mi serve: Sito web");
  expect(text).toContain("Budget indicativo: 1.000–3.000 €");
  expect(text).toContain("ordini per le torte");
  await expect(page.locator("[data-brief-error]")).toBeHidden();
});

test("reduced motion shows everything immediately", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator(".svc").first()).toHaveCSS("opacity", "1");
  await ctx.close();
});

test("Forma demo is linked from the studies", async ({ page }) => {
  await open(page);
  await expect(page.locator('a.study[href="/demo/forma/"]')).toBeVisible();
});
