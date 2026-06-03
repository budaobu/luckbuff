import { test, expect, chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = '/Users/clawkid/WorkBuddy/luckbuff/e2e/screenshots';

function ss(name: string) {
  return path.join(SCREENSHOT_DIR, `${name}.png`);
}

test('vedic-astro page test', async () => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  const consoleLogs: string[] = [];
  const networkErrors: string[] = [];
  const apiResponses: { url: string; status: number; body?: string }[] = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    console.log(text);
  });

  page.on('pageerror', err => {
    const text = `[PAGE ERROR] ${err.message}`;
    consoleLogs.push(text);
    console.error(text);
  });

  page.on('response', async resp => {
    if (resp.url().includes('/api/')) {
      const entry = { url: resp.url(), status: resp.status() };
      try {
        const body = await resp.text();
        entry.body = body.slice(0, 800);
      } catch {}
      apiResponses.push(entry);
      if (!resp.ok()) {
        networkErrors.push(`[HTTP ${resp.status()}] ${resp.url()} body: ${entry.body || 'n/a'}`);
      }
    }
  });

  // 1. Navigate to page
  console.log('--- Navigating to /tools/vedic-astro ---');
  await page.goto('http://localhost:3001/tools/vedic-astro', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: ss('01-initial'), fullPage: true });
  console.log('Screenshot: 01-initial');

  // 2. Verify form elements are visible
  console.log('--- Verifying form elements ---');
  const formVisible = await page.locator('form').first().isVisible();
  const dateBtnVisible = await page.locator('button', { hasText: /出生日期/ }).first().isVisible();
  const timeBtnVisible = await page.locator('button', { hasText: /出生时间/ }).first().isVisible();
  const cityInputVisible = await page.locator('input').first().isVisible();
  const submitBtnVisible = await page.locator('button[type="submit"]').first().isVisible();

  console.log('Form visible:', formVisible);
  console.log('Date button visible:', dateBtnVisible);
  console.log('Time button visible:', timeBtnVisible);
  console.log('City input visible:', cityInputVisible);
  console.log('Submit button visible:', submitBtnVisible);

  // 3. Test API directly from browser context
  console.log('--- Testing API directly ---');
  const apiResult = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/vedic/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: '1990-06-15',
          birthTime: '12:00',
          city: '北京',
          gender: 'male',
        }),
      });
      const data = await response.json();
      return {
        status: response.status,
        hasAscendant: !!data.ascendant,
        hasPlanets: Array.isArray(data.planets) && data.planets.length > 0,
        ascendantSign: data.ascendant?.signName,
        planetCount: data.planets?.length,
      };
    } catch (err: any) {
      return { error: err.message };
    }
  });

  console.log('API result:', apiResult);

  // 4. Test the analyze endpoint (will likely fail on AI part but chart should work)
  console.log('--- Testing analyze endpoint ---');
  const analyzeResult = await page.evaluate(async () => {
    try {
      const response = await fetch('/api/vedic/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: '1990-06-15',
          birthTime: '12:00',
          city: '北京',
          gender: 'male',
          dimensions: ['core'],
          locale: 'zh-CN',
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chartReceived = false;
      let errorReceived = false;
      let errorMessage = '';

      if (reader) {
        const startTime = Date.now();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const evt = JSON.parse(payload);
              if (evt.type === 'chart') chartReceived = true;
              if (evt.type === 'error') {
                errorReceived = true;
                errorMessage = evt.message;
              }
            } catch {}
          }

          // Stop reading after we get the chart or after 5 seconds
          if (chartReceived || Date.now() - startTime > 5000) {
            reader.cancel();
            break;
          }
        }
      }

      return { status: response.status, chartReceived, errorReceived, errorMessage };
    } catch (err: any) {
      return { error: err.message };
    }
  });

  console.log('Analyze result:', analyzeResult);

  // 5. Try to fill form and submit (best effort)
  console.log('--- Attempting form submission ---');

  // Click date button to open calendar popover
  const dateBtn = page.locator('form button').first();
  await dateBtn.click();
  await page.waitForTimeout(800);

  // The AppCalendar has two native <select> elements for year/month.
  // Use Playwright's selectOption which properly triggers all events.
  const yearSelect = page.locator('select').first();
  await yearSelect.selectOption('1990');
  await page.waitForTimeout(300);

  const monthSelect = page.locator('select').nth(1);
  await monthSelect.selectOption('6');
  await page.waitForTimeout(500);

  // Click day 15
  const day15 = page.locator('[role="gridcell"]').filter({ hasText: /^15$/ }).first();
  await day15.click();
  await page.waitForTimeout(500);

  // Fill city
  const cityInput = page.locator('input[placeholder*="北京"], input[placeholder*="Beijing"], input[placeholder*="城市"], input[placeholder*="City"]').first();
  await cityInput.fill('北京');
  await page.waitForTimeout(300);

  // Select dimension
  const dimBtn = page.locator('button', { hasText: /性格结构|核心命盘|Core/ }).first();
  await dimBtn.click();
  await page.waitForTimeout(300);

  // Screenshot of partially filled form
  await page.screenshot({ path: ss('02-form-partial'), fullPage: true });
  console.log('Screenshot: 02-form-partial');

  // Set birth time by opening the time popover and using keyboard navigation
  const timeBtn = page.locator('form button').nth(1);
  await timeBtn.click();
  await page.waitForTimeout(800);

  // The time popover has two USelect triggers. Use Tab to focus the first one (hour),
  // then Space to open it, ArrowDown to navigate to 12, and Enter to select.
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);

  // Arrow down 12 times to reach hour 12 (starts at 0)
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
  }
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  // Tab to minute select, Space to open, Enter to select 00 (first option)
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  // Close popover
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Click submit
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(1000);

  // Screenshot after submit attempt
  await page.screenshot({ path: ss('03-after-submit'), fullPage: true });
  console.log('Screenshot: 03-after-submit');

  // Wait a bit to see if loading state appears
  await page.waitForTimeout(2000);
  await page.screenshot({ path: ss('04-loading-or-result'), fullPage: true });
  console.log('Screenshot: 04-loading-or-result');

  // Report
  console.log('\n========== TEST REPORT ==========');
  console.log('Page URL:', page.url());
  console.log('Page title:', await page.title());
  console.log('Form visible:', formVisible);
  console.log('API chart result:', apiResult);
  console.log('API analyze result:', analyzeResult);

  if (consoleLogs.length > 0) {
    console.log('\n--- Console logs ---');
    consoleLogs.forEach(l => console.log(l));
  }

  if (networkErrors.length > 0) {
    console.log('\n--- Network errors ---');
    networkErrors.forEach(e => console.log(e));
  }

  console.log('\n--- All API responses ---');
  apiResponses.forEach(r => {
    console.log(`[${r.status}] ${r.url}`);
    if (r.body) console.log('  body:', r.body.slice(0, 200));
  });

  console.log('\nScreenshots saved to:', SCREENSHOT_DIR);
  console.log('=================================\n');

  await browser.close();
});
