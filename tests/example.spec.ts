import { test, expect, type Page } from "@playwright/test";
import { APP_URL, Selector } from "@/util/constants";
import { mockGraphqlApiCall, setAllowLogin } from "@/util/api";

async function addText(
  page: Page,
  text: string,
  position: { x: number; y: number }
) {
  await page.locator(Selector.TOOLBOX_TEXT_BUTTON).click();
  const noteRenderer = page.locator(Selector.NOTE_RENDERER);
  expect(noteRenderer).toHaveCount(1);
  await noteRenderer.click({ position });
  const textBlockEditor = page
    .locator(Selector.LEXICAL_CONTENT_EDITABLE)
    .last();
  await textBlockEditor.click();
  await textBlockEditor.fill(text);
  await textBlockEditor.press("Enter");
  await textBlockEditor.blur();
}

async function drawInk(page: Page) {
  const start = [175, 175];
  const end = [350, 400];
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

test.describe("Draw ink and type text", () => {
  test("should log in and add a note", async ({ page }) => {
    await mockGraphqlApiCall(page);
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto(APP_URL);
    await page.locator(Selector.LOGIN_BUTTON).click();
    await page
      .locator("#nav-email-input")
      .fill(process.env.NOTABILITY_USERNAME);
    await page
      .locator("#nav-password-input")
      .fill(process.env.NOTABILITY_PASSWORD);

    setAllowLogin(true);

    await page.locator(Selector.LOGIN_SUBMIT_BUTTON).click();
    await page.waitForTimeout(45000);

    // await page.locator(Selector.NEW_NOTE_BUTTON).click();
    // await page.waitForTimeout(30000);
    // await addText(page, "lorem ipsum", { x: 350, y: 350 });
    // await drawInk(page);
    // await page.locator(Selector.NOTE_RENDERER).screenshot({
    //   path: `screenshots/chromium/note-renderer.png`,
    // });
  });
});
