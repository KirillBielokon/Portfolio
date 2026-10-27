import { test, expect } from '@playwright/test';

async function open(page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}

const canvasImage = page => page.locator('.playground-canvas').evaluate(canvas => canvas.toDataURL());

test('loads the new portfolio, rendered illustration and local project assets without browser errors', async ({ page }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('requestfailed', request => failures.push(request.url()));
  await open(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('FATTINOTARE.');
  await expect(page.locator('.project')).toHaveCount(3);
  await expect(page.locator('.playground-canvas')).toBeVisible();
  await expect.poll(() => page.locator('.playground-canvas').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) painted++;
    return painted;
  })).toBeGreaterThan(1000);
  for (const image of await page.locator('.project img').all()) {
    await expect(image).toHaveJSProperty('complete', true);
    expect(await image.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  expect(failures).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`has no horizontal overflow and a reachable contact at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.getByRole('link', { name: 'Parliamone su WhatsApp' })).toBeVisible();
    const contact = new URL(await page.getByRole('link', { name: 'Parliamone su WhatsApp' }).getAttribute('href'));
    expect(contact.origin).toBe('https://wa.me');
    expect(contact.pathname).toBe('/393896322180');
  });
}

test('the live illustration changes visibly between signature, web and social and can be paused', async ({ page }) => {
  await open(page);
  const pause = page.getByRole('button', { name: 'Metti in pausa l’animazione' });
  await pause.click();
  await expect(page.getByRole('button', { name: 'Riprendi l’animazione' })).toHaveAttribute('aria-pressed', 'true');
  const signature = await canvasImage(page);
  await page.waitForTimeout(150);
  expect(await canvasImage(page)).toBe(signature);
  await page.getByRole('button', { name: '02 Web', exact: true }).click();
  await expect(page.getByRole('button', { name: '02 Web', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => canvasImage(page)).not.toBe(signature);
  const web = await canvasImage(page);
  await page.getByRole('button', { name: '03 Social', exact: true }).click();
  await expect(page.getByRole('button', { name: '03 Social', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => canvasImage(page)).not.toBe(web);
  await expect(page.locator('.playground-caption')).toContainText('voce');
});

test('desktop project index selects each case study and dialogs disclose concept status', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page);
  for (const name of ['Forma Studio', 'Aether', 'Campo']) {
    const index = page.getByRole('button', { name: `Mostra ${name}`, exact: true });
    await index.click();
    await expect(index).toHaveAttribute('aria-pressed', 'true');
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

test('mobile projects remain a complete vertical sequence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await expect(page.locator('.mobile-projects .project')).toHaveCount(3);
  for (const name of ['Forma Studio', 'Aether', 'Campo']) {
    await page.getByRole('button', { name: `Esplora ${name}, studio di design` }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(`${name}.`);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  }
});

test('service and FAQ controls show the selected content and update accessibility state', async ({ page }) => {
  await open(page);
  const service = page.getByRole('button', { name: /02 Social media\./ });
  await service.click();
  await expect(service).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#service-1')).toBeVisible();
  await expect(page.locator('#service-0')).toBeHidden();
  const question = page.getByRole('button', { name: 'Puoi seguire sia il sito sia i social?' });
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(`#${await question.getAttribute('aria-controls')}`)).toBeVisible();
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'false');
});

test('WhatsApp preserves the complete brief, optional email and visitor control over sending', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Parliamone', exact: true }).click();
  const dialog = page.getByRole('dialog');
  expect(new URL(await dialog.getByRole('link', { name: 'Scrivimi su WhatsApp' }).getAttribute('href')).pathname).toBe('/393896322180');
  await dialog.getByLabel('Come ti chiami?').fill('Mario Rossi');
  // Intentionally omit email: it is optional for a WhatsApp conversation.
  await dialog.getByLabel('Gestione social', { exact: true }).check();
  const message = 'Vorrei un piano social e un sito per la mia torrefazione. Budget e tempi da definire.';
  await dialog.getByLabel('Raccontami qualcosa').fill(message);
  await dialog.getByRole('button', { name: 'Prepara il messaggio' }).click();
  await expect(dialog.getByRole('heading', { level: 2 })).toBeFocused();
  const url = new URL(await dialog.getByRole('link', { name: 'Apri WhatsApp' }).getAttribute('href'));
  expect(url.origin).toBe('https://wa.me');
  expect(url.pathname).toBe('/393896322180');
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
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await expect(page.locator('main')).toHaveJSProperty('inert', true);
  const navigation = page.getByRole('navigation', { name: 'Navigazione mobile' });
  await expect(navigation).toBeVisible();
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement.closest('header'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(page.getByRole('button', { name: 'Apri menu' })).toBeFocused();
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(navigation).toBeHidden();
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
});

test('reduced motion leaves a static complete illustration and visible content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  expect(await page.locator('.marquee-track').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  const initial = await canvasImage(page);
  await page.waitForTimeout(150);
  expect(await canvasImage(page)).toBe(initial);
  await page.getByRole('button', { name: '02 Web', exact: true }).click();
  await expect.poll(() => canvasImage(page)).not.toBe(initial);
  const web = await canvasImage(page);
  await page.waitForTimeout(150);
  expect(await canvasImage(page)).toBe(web);
  await expect(page.locator('#work-title')).toHaveCSS('opacity', '1');
});
