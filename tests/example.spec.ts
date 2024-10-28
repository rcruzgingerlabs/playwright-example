import { chromium, test, expect, type Page } from "@playwright/test";
import { APP_URL, Selector } from "@/constants";
import percySnapshot from "@percy/playwright";

async function addText(
  page: Page,
  text: string,
  position: { x: number; y: number }
) {
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

async function drawInk(page: Page) {
  const start = [75, 75];
  const end = [250, 300];
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

async function connectToLambdaTest() {
  const capabilities = {
    browserName: "Chrome", // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
    browserVersion: "latest",
    "LT:Options": {
      platform: "Windows 10",
      build: "Playwright Sample Build",
      name: "Playwright Sample Test",
      user: process.env.LT_USERNAME,
      accessKey: process.env.LT_ACCESS_KEY,
      network: true,
      video: true,
      console: true,
      tunnel: true,
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

  // const browser = await chromium.connect({
  //   wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
  //     JSON.stringify(capabilities)
  //   )}`,
  // });
  // return browser;
}

test.describe("Draw ink and type text", () => {
  test("should log in and add a note", async ({ page }) => {
    // const browser = await connectToLambdaTest();
    // const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto(APP_URL);
    await page.getByText("Log in").click();
    await page
      .locator("#nav-email-input")
      .fill(process.env.NOTABILITY_USERNAME);
    await page
      .locator("#nav-password-input")
      .fill(process.env.NOTABILITY_PASSWORD);
    await page.locator('[data-testid="login-submit-button"]').click();
    await page.waitForTimeout(3000);

    await page.locator('[data-testid="new-note"]').click();
    await page.waitForTimeout(1000);

    await addText(page, "lorem ipsum", { x: 250, y: 250 });
    await drawInk(page);
    await page.locator(Selector.NOTE_RENDERER).screenshot({
      path: `screenshots/chromium/note-renderer.png`,
    });
    // await page.evaluate(
    //   (_) => {},
    //   `lambdatest_action: ${JSON.stringify({
    //     action: "smartui.takeScreenshot",
    //     arguments: {
    //       fullPage: true,
    //       screenshotName: `note-renderer-${Date.now()}`,
    //     },
    //   })}`
    // );
    // await browser.close();
    // await page.waitForTimeout(5000);
    await percySnapshot(page, "Renderer", { scope: "canvas" });
    // await page.evaluate(async () => {
    //   const canvas = document.querySelector("canvas");
    //   const img = new Image();
    //   img.src = canvas.toDataURL();
    //   img.id = "percy-renderer-img";
    //   document.body.appendChild(img);
    //   await percySnapshot(page, "Renderer", { scope: "#percy-renderer-img" });
    // });
  });
});

// test('has title', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
// });

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
