import { test, expect } from '@playwright/test';

async function open(page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}

const whatsapp = href => {
  const url = new URL(href);
  expect(url.origin).toBe('https://wa.me');
  expect(url.pathname).toBe('/393896322180');
  expect(url.searchParams.get('text')).toBeTruthy();
  return url;
};

async function useSvgFallback(page) {
  // Exercise the real fallback on devices without a usable WebGL GPU.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl2' || type === 'webgl' ? null : original.call(this, type, ...args);
    };
  });
}

test('loads the immersive portfolio and complete project images without browser errors', async ({ page }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('requestfailed', request => failures.push(request.url()));
  await open(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('La tua attività,in un’altradimensione.');
  await expect(page.locator('.project-card')).toHaveCount(3);
  await expect(page.locator('.hero-scene')).toBeVisible();
  await expect(page.locator('.hscene-fallback')).toBeAttached();
  for (const image of await page.locator('.project-image img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  expect(failures).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`has no horizontal overflow and working contact URLs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const heroContact = page.getByRole('link', { name: 'Parliamo della tua idea' });
    await expect(heroContact).toBeVisible();
    whatsapp(await heroContact.getAttribute('href'));
    const finalContact = page.locator('#contatti').getByRole('link', { name: 'Scrivimi su WhatsApp' });
    await finalContact.scrollIntoViewIfNeeded();
    await expect(finalContact).toBeVisible();
    whatsapp(await finalContact.getAttribute('href'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('the animated sculpture has a complete fallback and the global pause actually stops ambient motion', async ({ page }) => {
  await useSvgFallback(page);
  await open(page);
  const sculpture = page.locator('.hscene-fallback');
  await expect(sculpture).toBeVisible();
  expect(await sculpture.locator('path').count()).toBeGreaterThan(2);
  const running = await sculpture.evaluate(el => getComputedStyle(el).transform);
  await expect.poll(() => sculpture.evaluate(el => getComputedStyle(el).transform)).not.toBe(running);
  await page.getByRole('button', { name: 'Pausa animazioni', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await expect(page.getByRole('button', { name: 'Riprendi animazioni' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.hero-scene')).toHaveAttribute('data-running', 'false');
  const stopped = await sculpture.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(180);
  expect(await sculpture.evaluate(el => getComputedStyle(el).transform)).toBe(stopped);
  for (const item of ['.floating-tag', '.rail-track', '.ambient-orb']) {
    await expect(page.locator(item).first()).toHaveCSS('animation-play-state', 'paused');
  }
  await page.getByRole('button', { name: 'Riprendi animazioni' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'running');
  await expect.poll(() => sculpture.evaluate(el => getComputedStyle(el).transform)).not.toBe(stopped);
});

test('the lab changes brand, adapts its layout, opens social content and preserves contact access', async ({ page }) => {
  await open(page);
  const lab = page.locator('#competenze');
  await lab.getByRole('button', { name: 'Beauty', exact: true }).click();
  await expect(lab.getByRole('button', { name: 'Beauty', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(lab.locator('.proof-mini-site')).toContainText('mora');
  const desktopWidth = await lab.locator('.proof-mini-site').evaluate(el => el.clientWidth);
  await lab.getByRole('button', { name: 'Anteprima mobile', exact: true }).click();
  await expect(lab.getByRole('button', { name: 'Anteprima mobile', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => lab.locator('.proof-mini-site').evaluate(el => el.clientWidth)).toBeLessThan(desktopWidth);
  await lab.getByRole('button', { name: 'Apri menu dell’anteprima' }).click();
  await expect(lab.getByRole('navigation', { name: 'Navigazione del concept mora' })).toBeVisible();
  await lab.getByRole('button', { name: 'La direzione visiva' }).click();
  await expect(lab.locator('.proof-site-note')).toContainText('skincare');
  await lab.getByRole('button', { name: 'Social', exact: true }).click();
  await expect(lab.locator('.proof-post')).toHaveCount(3);
  const firstCaption = await lab.locator('.proof-caption').innerText();
  await lab.getByRole('button', { name: /^Post 2:/ }).click();
  await expect(lab.getByRole('button', { name: /^Post 2:/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(lab.locator('.proof-caption')).not.toHaveText(firstCaption);
  await lab.getByRole('button', { name: 'Insieme', exact: true }).click();
  await expect(lab.locator('.proof-mini-site')).toBeVisible();
  await expect(lab.locator('.proof-post')).toHaveCount(3);
  await lab.getByRole('button', { name: 'Studio', exact: true }).click();
  await expect(lab.locator('.proof-mini-site')).toContainText('linea');
  await lab.getByRole('button', { name: 'Un sito così, per te' }).click();
  await expect(page.getByRole('dialog', { name: /Parliamo/ })).toBeVisible();
});

test('the interactive lab remains usable on a narrow phone without overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await open(page);
  const lab = page.locator('#competenze');
  await lab.getByRole('button', { name: 'Insieme', exact: true }).click();
  await lab.getByRole('button', { name: 'Studio', exact: true }).click();
  await expect(lab.locator('.proof-mini-site')).toBeVisible();
  await expect(lab.getByRole('button', { name: /^Post 3:/ })).toBeVisible();
  await lab.getByRole('button', { name: /^Post 3:/ }).click();
  await expect(lab.getByRole('button', { name: /^Post 3:/ })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

for (const width of [390, 1440]) {
  test(`all project dialogs disclose concept status and restore focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    for (const name of ['Forma Studio', 'Aether', 'Campo']) {
      const trigger = page.getByRole('button', { name: `Esplora ${name}, studio di design` });
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(`${name}.`);
      await expect(dialog.locator('.concept-note')).toContainText('brand immaginario');
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });
}

test('service contact and FAQ controls open the right content with accessible state', async ({ page }) => {
  await open(page);
  const question = page.getByRole('button', { name: 'Puoi seguire sia il sito sia i social?' });
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  const answer = page.locator(`#${await question.getAttribute('aria-controls')}`);
  await expect(answer).toHaveJSProperty('inert', false);
  await expect(answer).toContainText('tono di voce coordinati');
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'false');
  await expect(answer).toHaveJSProperty('inert', true);
  await page.locator('.service-card').nth(1).getByRole('button', { name: 'Parliamo del progetto' }).click();
  await expect(page.getByRole('dialog', { name: /Parliamo/ })).toBeVisible();
  await expect(page.getByRole('dialog').getByLabel('Gestione social', { exact: true })).toBeChecked();
});

test('WhatsApp preserves the complete brief, optional email and visitor control over sending', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Parliamone', exact: true }).click();
  const dialog = page.getByRole('dialog');
  whatsapp(await dialog.getByRole('link', { name: 'Scrivimi su WhatsApp' }).getAttribute('href'));
  await dialog.getByLabel('Come ti chiami?').fill('Mario Rossi');
  // Intentionally omit email: it is optional for a WhatsApp conversation.
  await dialog.getByLabel('Gestione social', { exact: true }).check();
  const message = 'Vorrei un piano social e un sito per la mia torrefazione. Budget e tempi da definire.';
  await dialog.getByLabel('Raccontami qualcosa').fill(message);
  await dialog.getByRole('button', { name: 'Prepara il messaggio' }).click();
  await expect(dialog.getByRole('heading', { level: 2 })).toBeFocused();
  const url = whatsapp(await dialog.getByRole('link', { name: 'Apri WhatsApp' }).getAttribute('href'));
  expect(url.searchParams.get('text')).toContain(message);
  expect(url.searchParams.get('text')).toContain('Gestione social');
  expect(url.searchParams.get('text')).toContain('Mario Rossi');
  const download = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Scarica' }).click();
  expect((await download).suggestedFilename()).toBe('il-mio-progetto-per-kirill.txt');
  await dialog.getByRole('button', { name: 'Modifica il messaggio' }).click();
  await expect(dialog.getByLabel('Raccontami qualcosa')).toHaveValue(message);
  await expect(dialog.getByRole('heading', { level: 2 })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('mobile menu contains focus, closes with Escape and resets at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.getByRole('button', { name: 'Apri menu', exact: true }).click();
  await expect(page.locator('main')).toHaveJSProperty('inert', true);
  const navigation = page.getByRole('navigation', { name: 'Navigazione mobile' });
  await expect(navigation).toBeVisible();
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement.closest('header'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('button', { name: 'Apri menu', exact: true })).toBeFocused();
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
  await page.getByRole('button', { name: 'Apri menu', exact: true }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(navigation).toBeHidden();
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
});

test('reduced motion leaves a static complete sculpture and all content usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const sculpture = page.locator('.hscene-fallback');
  await expect(sculpture).toBeVisible();
  const initial = await sculpture.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(180);
  expect(await sculpture.evaluate(el => getComputedStyle(el).transform)).toBe(initial);
  await page.getByRole('button', { name: 'Beauty', exact: true }).click();
  await expect(page.locator('.proof-mini-site')).toContainText('mora');
  await page.locator('#work-title').scrollIntoViewIfNeeded();
  await expect(page.locator('#work-title')).toBeVisible();
  await expect(page.locator('#work-title')).toHaveCSS('opacity', '1');
});
