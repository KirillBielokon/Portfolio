import { chromium } from "@playwright/test";

const origin = process.env.PREVIEW_ORIGIN || "http://127.0.0.1:5280";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(origin, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1400);
await page.mouse.move(0, 0);
await page.screenshot({ path: "docs/anteprima-desktop.png" });
await page.getByRole("button", { name: "Metti in pausa l’animazione" }).click();
const art = await page
  .locator(".playground-canvas")
  .evaluate((c) => c.toDataURL());
const brand = await page.locator(".logo svg").evaluate((svg) => svg.outerHTML);
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(origin, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await page.screenshot({ path: "docs/anteprima-mobile.png" });
// The linear tablet layout shows all three studies in the static full-page image.
await page.setViewportSize({ width: 900, height: 1000 });
await page.goto(origin, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 80));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1300);
await page.screenshot({ path: "docs/anteprima-completa.png", fullPage: true });
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto(origin, { waitUntil: "networkidle" });
await page.evaluate(
  ({ art, brand }) => {
    document.body.innerHTML = `<div id="share-card"><div class="share-top"><strong>${brand}</strong><span>KIRILL BIELOKON</span><p>WEB DESIGN + SOCIAL MEDIA</p></div><div class="share-copy"><h1>FATTI<br/><span>NOTARE.</span></h1><p>Siti web e social. Una voce propria.</p></div><div class="share-art"><span>UN’IDEA. LA FORMA GIUSTA.</span><img src="${art}"/><b>DESIGN / CODICE / CONTENUTI</b></div><div class="share-bottom">kirillbielokon.com <span>IL LABORATORIO DI KIRILL BIELOKON</span></div></div>`;
    const style = document.createElement("style");
    style.textContent = `body{margin:0!important;overflow:hidden}#share-card{width:1200px;height:630px;background:#141713;color:#f0f0e9;padding:30px 44px;font-family:'DM Sans Variable';position:relative;overflow:hidden}.share-top{display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid #ffffff35}.share-top>strong{display:block;width:30px;height:30px;color:#d6ff62}.share-top>strong>svg{display:block;width:30px;height:30px}.share-top>span{font-family:'IBM Plex Mono';font-size:9px;letter-spacing:1px}.share-top>p{margin-left:auto;font-family:'IBM Plex Mono';font-size:8px;letter-spacing:1px}.share-copy{position:absolute;top:125px;left:44px;z-index:2}.share-copy h1{font-family:Anton;font-size:167px;font-weight:400;line-height:.96;letter-spacing:-3px}.share-copy h1>span{color:#d6ff62}.share-copy>p{font-size:15px;margin-top:25px;color:#c2cbb7}.share-art{position:absolute;top:140px;right:44px;width:435px;height:385px;transform:rotate(4deg);background:#20251c;border:1px solid #63704a}.share-art>span{display:block;padding:16px;border-bottom:1px solid #63704a;font-family:'IBM Plex Mono';font-size:7px;letter-spacing:1px}.share-art>img{width:100%;height:290px;object-fit:contain}.share-art>b{display:block;padding:13px 16px;border-top:1px solid #63704a;font-family:'IBM Plex Mono';font-size:6px;color:#d6ff62;font-weight:400;letter-spacing:1px}.share-bottom{position:absolute;bottom:30px;left:44px;right:44px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ffffff35;padding-top:20px;font-family:'IBM Plex Mono';font-size:8px;color:#c2cbb7}.share-bottom>span{font-size:6px;letter-spacing:1px}`;
    document.head.appendChild(style);
  },
  { art, brand },
);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/social-preview.png" });
await browser.close();
