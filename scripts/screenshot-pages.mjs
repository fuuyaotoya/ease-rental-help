/**
 * Screenshot all manual pages from test environment.
 * Usage: node scripts/screenshot-pages.mjs
 */
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG_DIR = join(__dirname, '..', 'public', 'images');
const BASE = 'https://ease-rental-frontend-v4-test.onrender.com';

const PAGES = [
  { path: '/', dir: 'overview', name: 'dashboard' },
  { path: '/booking-compact', dir: 'booking-compact', name: 'main' },
  { path: '/slip-search', dir: 'slip-search', name: 'main' },
  { path: '/product-reservation-inquiry', dir: 'product-reservation-inquiry', name: 'main' },
  { path: '/picking-delivery', dir: 'picking-delivery', name: 'main' },
  { path: '/delivery-list', dir: 'delivery-list', name: 'main' },
  { path: '/bookings-shipping-fee', dir: 'bookings-shipping-fee', name: 'main' },
  { path: '/invoices-list', dir: 'invoices-list', name: 'main' },
  { path: '/invoice/create-new', dir: 'invoice-create-new', name: 'main' },
  { path: '/payment-management', dir: 'payment-management', name: 'main' },
  { path: '/bulk-invoices', dir: 'bulk-invoices', name: 'main' },
  { path: '/refund', dir: 'refund', name: 'main' },
  { path: '/customer-management', dir: 'customer-management', name: 'main' },
  { path: '/products', dir: 'products', name: 'main' },
  { path: '/master-data', dir: 'master-data', name: 'main' },
  { path: '/dashboard', dir: 'dashboard', name: 'main' },
  { path: '/aggregate-report', dir: 'aggregate-report', name: 'main' },
  { path: '/webhook-receiving', dir: 'webhook-receiving', name: 'main' },
  { path: '/shopify-data', dir: 'shopify-data', name: 'main' },
  { path: '/my-page', dir: 'my-page', name: 'main' },
  { path: '/bookings-return', dir: 'bookings-return', name: 'overview' },
];

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log(`Taking ${PAGES.length} screenshots...\n`);

  for (const { path, dir, name } of PAGES) {
    const outDir = join(IMG_DIR, dir);
    await mkdir(outDir, { recursive: true });
    const filePath = join(outDir, `${name}.png`);
    const url = `${BASE}${path}`;

    console.log(`[${PAGES.indexOf(arguments) + 1}] ${dir}/${name}.png ← ${path}`);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Hide sidebar
      await page.addStyleTag({
        content: `
          nav, [class*="sidebar"], [class*="Sidebar"] { display: none !important; }
          main { margin: 0 !important; }
        `,
      });
      await new Promise(r => setTimeout(r, 500));

      await page.screenshot({ path: filePath, fullPage: false });
      await page.close();
      console.log(`  ✓ ${filePath}`);
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
    }
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
