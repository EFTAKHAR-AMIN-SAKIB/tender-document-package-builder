import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'screenshots');

async function run() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 960 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // 1. Initial State Screenshot
  console.log('Capturing Screenshot 1: Requirements Loader...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_requirements_loader.png'), fullPage: false });

  // 2. Click Sample 1 Requirements button
  console.log('Loading Sample 1 Tender requirements...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Standard IT Equipment Tender')) {
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1000));

  // 3. Generate Sample PDFs
  console.log('Generating Sample PDFs in browser...');
  const samplePdfButtons = await page.$$('button');
  for (const b of samplePdfButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Generate Sample PDFs')) {
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 2000));

  // 4. Click Smart Auto-Match
  console.log('Executing Smart Auto-Match...');
  const autoMatchButtons = await page.$$('button');
  for (const b of autoMatchButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Smart Auto-Match')) {
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 1000));

  // Screenshot 2: Document Statuses in English
  console.log('Capturing Screenshot 2: Document Statuses in English...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_document_statuses_english.png'), fullPage: false });

  // 5. Switch to Bangla
  console.log('Switching UI to Bangla...');
  const langButtons = await page.$$('button');
  for (const b of langButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.trim() === 'বাংলা') {
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 3: Document Statuses in Bangla
  console.log('Capturing Screenshot 3: Document Statuses in Bangla...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_document_statuses_bangla.png'), fullPage: false });

  // Switch back to English to finalize package
  for (const b of langButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.trim() === 'English') {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 500));

  // Enter valid expiry dates via native value setter
  console.log('Filling valid expiry dates...');
  await page.evaluate(() => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach((input) => {
      nativeSetter?.call(input, '2026-12-31');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  await new Promise((r) => setTimeout(r, 1200));

  // Click Generate Package button
  console.log('Clicking Generate Package button...');
  const generateButtons = await page.$$('button');
  for (const b of generateButtons) {
    const text = await page.evaluate((el) => el.textContent, b);
    if (text && text.includes('Generate Tender Package')) {
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 4: Package Success Modal
  console.log('Capturing Screenshot 4: Package Compiled Modal...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_package_generated_modal.png'), fullPage: false });

  await browser.close();
  console.log('All screenshots captured successfully in screenshots/ directory!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
