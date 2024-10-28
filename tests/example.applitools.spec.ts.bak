import URL from "url";
import { test, expect, type Page } from "@playwright/test";
import { APP_URL, Selector } from "@/constants";
import {
  BatchInfo,
  Configuration,
  EyesRunner,
  VisualGridRunner,
  BrowserType,
  DeviceName,
  ScreenOrientation,
  Eyes,
  Target,
} from "@applitools/eyes-playwright";

export let Batch: BatchInfo;
export let Config: Configuration;
export let Runner: EyesRunner;

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
  const start = [100, 100];
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

test.beforeAll(async () => {
  // Configure Applitools SDK to run on the Ultrafast Grid
  Runner = new VisualGridRunner({ testConcurrency: 1 });
  Batch = new BatchInfo({ name: `Note login and drawing` });

  Config = new Configuration();
  Config.setBatch(Batch);
  Config.addBrowsers({ name: BrowserType.CHROME, width: 1280, height: 1024 });
});

test.afterAll(async () => {
  // Wait for Ultrast Grid Renders to finish and gather results
  const results = await Runner.getAllTestResults();
  console.log("Visual test results", results);
});

test.describe("Draw ink and type text", () => {
  let eyes: Eyes;
  test.beforeEach(async ({ page }) => {
    eyes = new Eyes(Runner, Config);
    await eyes.open(page, "Notes", `Note drawing`, {
      width: 1200,
      height: 1000,
    });
  });

  test.afterEach(async () => {
    await eyes.close();
  });

  test("should log in and add a note", async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 1000 });
    await page.goto(APP_URL);
    await eyes.check("Login page", Target.window().fully());
    await page.getByText("Log in").click();
    await eyes.check("Login form", Target.window().fully());
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

    await addText(page, "lorem ipsum", { x: 200, y: 200 });
    await drawInk(page);
    const imgPath = `screenshots/chromium/note-renderer-${Date.now()}.png`;
    await page.locator(Selector.NOTE_RENDERER).screenshot({
      path: imgPath,
    });
    // eyes.setApiKey("y5mFVUYc04G6Ib6L0MgdpchRZkyKy5KeEkqO3Ba4bjM110");
    // await eyes.checkImage(
    //   `/Users/ryancruz/src/playwright-example/${imgPath}`,
    //   "Note renderer"
    // );

    await eyes.checkRegion(
      URL.pathToFileURL(`../${imgPath}`),
      {
        x: 0,
        y: 0,
        width: 1280,
        height: 1000,
      },
      "Note renderer"
      // Target.path(path.resolve(__dirname, "..", imgPath))
    );
    // const renderer = await page.$(Selector.NOTE_RENDERER);
    // await eyes.checkElement(renderer, 500, "Note renderer");
  });
});
