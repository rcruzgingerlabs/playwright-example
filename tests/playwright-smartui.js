const { chromium } = require("playwright");
const { expect } = require("@playwright/test");

const APP_URL = "http://localhost:3003/app";

const Selector = {
  TOOLBOX_PEN_BUTTON: '[data-testid="toolbox-pen"] > div',
  NOTE_RENDERER: '[data-testid="note-renderer"]',
};

async function addText(page, text, position) {
  await page.locator('[data-testid="toolbox-text"]').click();
  const noteRenderer = page.locator(Selector.NOTE_RENDERER);
  expect(noteRenderer).toHaveCount(1);
  await noteRenderer.click({ position });
  const textBlockEditor = page
    .locator('[data-testid="text-block-editor"]')
    .last();
  await textBlockEditor.click();
  await textBlockEditor.fill(text);
  await textBlockEditor.press("Enter");
  await textBlockEditor.blur();
}

async function drawInk(page) {
  const start = [125, 125];
  const end = [300, 300];
  const toolboxPenLocator = page.locator(Selector.TOOLBOX_PEN_BUTTON);
  await expect(toolboxPenLocator).toHaveCount(1);
  await page.locator(Selector.TOOLBOX_PEN_BUTTON).click();
  const pathExpanded = [];
  const interval = 5;
  for (let i = start[0]; i <= end[0]; i += interval) {
    pathExpanded.push([i, i]);
  }

  const noteRenderer = await page.$(Selector.NOTE_RENDERER);
  const box = await noteRenderer.boundingBox();
  const startX = box.x + start[0];
  const startY = box.y + start[1];
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 0; i < pathExpanded.length; i++) {
    const point = pathExpanded[i];
    await page.mouse.move(box.x + point[0], box.y + point[1]);
  }
  await page.mouse.up();
}

(async function connectToLambdaTest() {
  const capabilities = {
    browserName: "Chrome", // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
    browserVersion: "latest",
    "LT:Options": {
      platform: "Windows 10",
      build: "Note renderer local - playwright-smartui.js",
      name: "Note render, ink and text",
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      network: true,
      video: true,
      console: true,
      tunnel: true,
      tunnel_name: "rcruz-mbp-m3-max.local-2vru3mzhz0x",
      smartUIProjectName: "Notes",
    },
  };

  // const capabilities = {
  //   browserName: "Chrome",
  //   browserVersion: "129.0",
  //   "LT:Options": {
  //     video: true,
  //     platform: "Windows 10",
  //     tunnel: true,
  //     console: true,
  //     smartUIProjectName: "Notes",
  //   },
  // };

  const browser = await chromium.connect({
    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
      JSON.stringify(capabilities)
    )}`,
  });
  // return browser;

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1024 });
  await page.goto(APP_URL);
  await page.getByText("Log in").click();
  await page.locator("#nav-email-input").fill("");
  await page.locator("#nav-password-input").fill("");
  await page.locator('[data-testid="login-submit-button"]').click();
  await page.waitForTimeout(3000);

  await page.locator('[data-testid="new-note"]').click();
  await page.waitForTimeout(1000);

  await addText(page, "lorem ipsum", { x: 300, y: 350 });
  await drawInk(page);
  await page.locator(Selector.NOTE_RENDERER).screenshot({
    path: `screenshots/chromium/note-renderer-${Date.now()}.png`,
  });
  await page.evaluate(
    (_) => {},
    `lambdatest_action: ${JSON.stringify({
      action: "smartui.takeScreenshot",
      arguments: {
        fullPage: true,
        screenshotName: `note-renderer-ink-text`,
      },
    })}`
  );
  await browser.close();
})();

// test.describe("Draw ink and type text", () => {
//   test("should log in and add a note", async ({
//     /*page*/
//   }) => {
//     const browser = await connectToLambdaTest();
//     const page = await browser.newPage();
//     await page.setViewportSize({ width: 1280, height: 1024 });
//     await page.goto(APP_URL);
//     await page.getByText("Log in").click();
//     await page
//       .locator("#nav-email-input")
//       .fill(process.env.NOTABILITY_USERNAME);
//     await page
//       .locator("#nav-password-input")
//       .fill(process.env.NOTABILITY_PASSWORD);
//     await page.locator('[data-testid="login-submit-button"]').click();
//     await page.waitForTimeout(3000);

//     await page.locator('[data-testid="new-note"]').click();
//     await page.waitForTimeout(1000);

//     await addText(page, "lorem ipsum", { x: 200, y: 200 });
//     await drawInk(page);
//     await page.locator(Selector.NOTE_RENDERER).screenshot({
//       path: `screenshots/chromium/note-renderer-${Date.now()}.png`,
//     });
//     await page.evaluate(
//       (_) => {},
//       `lambdatest_action: ${JSON.stringify({
//         action: "smartui.takeScreenshot",
//         arguments: {
//           fullPage: true,
//           screenshotName: `note-renderer-${Date.now()}`,
//         },
//       })}`
//     );
//     await browser.close();
//   });
// });
