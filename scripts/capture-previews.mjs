import { chromium } from "@playwright/test";

const origin = process.env.PREVIEW_ORIGIN || "http://127.0.0.1:5280";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

async function openPreview(width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1600);
  await page.mouse.move(0, 0);
}

async function freezeMotion() {
  const pause = page.getByRole("button", { name: "Pausa animazioni", exact: true });
  // Avoid Playwright scrolling the off-screen pause control into view on mobile.
  if (await pause.count()) await pause.evaluate((button) => button.click());
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      const timing = animation.effect?.getComputedTiming();
      if (timing?.iterations !== Infinity) {
        try { animation.finish(); } catch { animation.pause(); }
      } else {
        animation.pause();
      }
    }
  });
}

try {
  await openPreview(1440, 1000);
  await freezeMotion();
  await page.screenshot({ path: "docs/anteprima-desktop.png" });
  const sculpture = await page.locator(".hscene-fallback").evaluate((svg) => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.removeAttribute("class");
    clone.querySelectorAll("[class]").forEach((element) => element.removeAttribute("class"));
    return new XMLSerializer().serializeToString(clone);
  });
  const brand = await page.locator(".logo svg").first().evaluate((svg) => svg.outerHTML);

  await openPreview(390, 844);
  await freezeMotion();
  await page.screenshot({ path: "docs/anteprima-mobile.png" });

  await openPreview(900, 1000);
  // Visit the complete page so observers, lazy images and scene fallbacks settle.
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
  });
  await page.locator(".project-card img").evaluateAll((images) =>
    Promise.all(images.map((image) => image.decode())),
  );
  await page.waitForTimeout(1100);
  await freezeMotion();
  await page.screenshot({ path: "docs/anteprima-completa.png", fullPage: true });

  await openPreview(1200, 630);
  await page.evaluate(({ sculpture, brand }) => {
    document.body.innerHTML = `<div id="share-card"><header class="share-top"><strong>${brand}</strong><span>kirill<br/>bielokon.</span><p>WEB DESIGN & SOCIAL MEDIA</p></header><div class="share-copy"><span class="share-eyebrow">DESIGN CHE SI VEDE. CURA CHE SI RICONOSCE.</span><h1>La tua attività,<br/>in un’altra<br/><em>dimensione.</em></h1><p>Siti web e contenuti social, con una direzione.</p></div><div class="share-art">${sculpture}</div><footer class="share-bottom"><b>kirillbielokon.com</b><span>DESIGN · CODICE · CONTENUTI</span></footer></div>`;
    const style = document.createElement("style");
    style.textContent = `html,body{margin:0!important;width:1200px;height:630px;overflow:hidden!important}#share-card{width:1200px;height:630px;padding:30px 44px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 82% 36%,#3a2a743c,transparent 48%),radial-gradient(ellipse at 40% 100%,#29418a24,transparent 60%),#080c18;color:#edf2ff;font-family:'DM Sans Variable',sans-serif;isolation:isolate}#share-card *{box-sizing:border-box}.share-top{display:flex;align-items:center;gap:12px;padding-bottom:24px;border-bottom:1px solid #a1b3ec26}.share-top>strong{display:grid;place-items:center;width:37px;height:40px;border-radius:10px;background:linear-gradient(140deg,#5376ff3d,#9659ff22);border:1px solid #9db2ff55}.share-top>strong>svg{display:block;width:20px;height:25px;fill:#c8d7ff}.share-top>span{font-family:'Sora Variable',sans-serif;font-size:11px;font-weight:600;line-height:1.5;letter-spacing:-.3px}.share-top>p{margin-left:auto;color:#a9b9e0;font-size:10px;font-weight:550;letter-spacing:1.5px}.share-copy{position:absolute;top:145px;left:44px;z-index:2}.share-eyebrow{display:flex;align-items:center;gap:9px;font-size:8px;letter-spacing:1.3px;color:#a8b9e1}.share-eyebrow:before{content:'';width:5px;height:5px;border-radius:50%;background:#9cb7ff;box-shadow:0 0 14px #5475ff}.share-copy h1{font-family:'Sora Variable',sans-serif;font-size:72px;font-weight:550;line-height:1.16;letter-spacing:-4.5px;margin:25px 0 23px}.share-copy h1 em{font-style:normal;background:linear-gradient(110deg,#b7d7ff,#8aa7ff 45%,#c49bff);background-clip:text;-webkit-background-clip:text;color:transparent}.share-copy>p{font-size:13px;color:#a9b8d6;margin:0}.share-art{position:absolute;top:101px;right:-7px;width:568px;height:463px;filter:drop-shadow(0 25px 30px #20134955);z-index:1}.share-art>svg{display:block;width:100%;height:100%;overflow:visible}.share-bottom{position:absolute;bottom:29px;left:44px;right:44px;border-top:1px solid #a1b3ec26;padding-top:22px;display:flex;justify-content:space-between;align-items:center;color:#a5b7df;font-size:10px}.share-bottom>b{font-weight:500;letter-spacing:.3px}.share-bottom>span{font-size:8px;letter-spacing:1.8px}`;
    document.head.appendChild(style);
  }, { sculpture, brand });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/social-preview.png" });
} finally {
  await browser.close();
}
