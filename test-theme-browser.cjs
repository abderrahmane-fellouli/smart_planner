const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: 'C:\\Users\\abder\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const allLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') { errors.push(text); }
    if (text.includes('THEME DEBUG')) { console.log(`  [CONSOLE] ${text}`); }
  });
  page.on('pageerror', err => { errors.push(err.message); console.log(`  [PAGE ERROR] ${err.message}`); });

  // Step 1: Login
  console.log('\n=== STEP 1: Login ===');
  await page.goto('http://127.0.0.1:8000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const emailSel = 'input[type="email"], input[name="email"], input[id="email"]';
  await page.waitForSelector(emailSel, { timeout: 10000 });
  await page.fill(emailSel, 'demo@smartplanner.test');
  await page.fill('input[type="password"], input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('  Logged in OK');

  // Step 2: Navigate to Preferences
  console.log('\n=== STEP 2: Navigate to Preferences ===');
  await page.click('a[href="/preferences"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Step 3: Read all theme card states
  console.log('\n=== STEP 3: Initial theme card states ===');
  const themeLabels = ['Classique', 'Douceur Rose', 'Bleu Serein', 'Lavande Turquoise', 'Vert Nature', 'Rose Rouge'];
  
  async function readThemeCards(label) {
    const card = await page.$(`button:has-text("${label}")`);
    if (!card) return { label, found: false };
    return card.evaluate(el => {
      return {
        label: el.textContent,
        border: el.style.border,
        bg: el.style.background,
        isActive: el.style.border.includes('2px solid'),
        fullText: el.textContent.trim(),
      };
    });
  }

  for (const label of themeLabels) {
    const info = await readThemeCards(label);
    console.log(`  ${label}: border="${info.border}" bg="${info.bg}" active=${info.isActive}`);
  }

  const currentAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-accent').trim());
  const currentBody = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-body').trim());
  console.log(`  CSS: --sp-accent=${currentAccent} --sp-body=${currentBody}`);

  // Step 4: Click Lavender Teal
  console.log('\n=== STEP 4: Click Lavender Teal ===');
  await page.click('button:has-text("Lavande Turquoise")');
  await page.waitForTimeout(1000);

  // Step 5: Verify IMMEDIATE change
  console.log('\n=== STEP 5: After clicking Lavender Teal (no navigation) ===');
  const accent2 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-accent').trim());
  const body2 = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-body').trim());
  console.log(`  CSS: --sp-accent=${accent2} --sp-body=${body2}`);
  console.log(`  Accent changed? ${currentAccent !== accent2} (${currentAccent} -> ${accent2})`);
  console.log(`  Body changed? ${currentBody !== body2} (${currentBody} -> ${body2})`);

  // Also check inline style directly
  const inlineAccent = await page.evaluate(() => document.documentElement.style.getPropertyValue('--sp-accent'));
  console.log(`  Inline style --sp-accent: "${inlineAccent}"`);
  const dataThemeName = await page.evaluate(() => document.documentElement.getAttribute('data-theme-name'));
  console.log(`  data-theme-name attr: "${dataThemeName}"`);

  for (const label of themeLabels) {
    const info = await readThemeCards(label);
    console.log(`  ${label}: active=${info.isActive} border="${info.border}"`);
  }

  // Step 6: Navigate to Sleep
  console.log('\n=== STEP 6: Navigate to Sleep ===');
  await page.click('a[href="/sleep-schedule"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const sleepAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-accent').trim());
  const sleepBody = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-body').trim());
  const sleepThemeName = await page.evaluate(() => document.documentElement.getAttribute('data-theme-name'));
  console.log(`  CSS: --sp-accent=${sleepAccent} --sp-body=${sleepBody}`);
  console.log(`  data-theme-name: ${sleepThemeName}`);
  console.log(`  Is Lavender Teal accent? ${sleepAccent === '#3E828E'}`);

  // Check page-body inline tk token (Sleep page title color) reflects lavenderTeal
  const sleepTitleColor = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? getComputedStyle(h1).color : null;
  });
  console.log(`  Sleep page h1 computed color: ${sleepTitleColor}`);
  console.log(`  h1 NOT default-theme text (#111827)? ${sleepTitleColor !== 'rgb(17, 24, 39)'}`);

  // Step 7: Navigate to Daily Tasks
  console.log('\n=== STEP 7: Navigate to Daily Tasks ===');
  await page.click('a[href="/todos"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const todosAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-accent').trim());
  const todosBody = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-body').trim());
  console.log(`  CSS: --sp-accent=${todosAccent} --sp-body=${todosBody}`);
  console.log(`  Is Lavender Teal accent? ${todosAccent === '#3E828E'}`);

  // Step 8: Return to Preferences
  console.log('\n=== STEP 8: Return to Preferences ===');
  await page.click('a[href="/preferences"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const retAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-accent').trim());
  const retThemeName = await page.evaluate(() => document.documentElement.getAttribute('data-theme-name'));
  console.log(`  CSS: --sp-accent=${retAccent}`);
  console.log(`  data-theme-name: ${retThemeName}`);

  for (const label of themeLabels) {
    const info = await readThemeCards(label);
    console.log(`  ${label}: active=${info.isActive}`);
  }

  // Step 9: Click Default
  console.log('\n=== STEP 9: Click Default (Classique) ===');
  await page.click('button:has-text("Classique")');
  await page.waitForTimeout(1000);
  const defAccent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sp-accent').trim());
  const defThemeName = await page.evaluate(() => document.documentElement.getAttribute('data-theme-name'));
  console.log(`  CSS: --sp-accent=${defAccent}`);
  console.log(`  data-theme-name: ${defThemeName}`);
  console.log(`  Is Default accent? ${defAccent === '#4F46E5'}`);

  for (const label of themeLabels) {
    const info = await readThemeCards(label);
    console.log(`  ${label}: active=${info.isActive}`);
  }

  // Step 10: localStorage
  console.log('\n=== STEP 10: localStorage ===');
  const stored = await page.evaluate(() => localStorage.getItem('smartplanner_theme'));
  console.log(`  smartplanner_theme: ${stored}`);

  // Screenshot
  await page.screenshot({ path: 'C:\\Users\\abder\\Desktop\\spacework\\D27\\projects\\smart_planner\\test-theme-final.png', fullPage: true });
  console.log('\n  Screenshot saved');

  // Dump all THEME DEBUG logs
  console.log('\n=== ALL THEME DEBUG LOGS ===');
  const themeLogs = allLogs.filter(l => l.includes('THEME DEBUG'));
  themeLogs.forEach(l => console.log(`  ${l}`));
  if (themeLogs.length === 0) console.log('  (none found)');

  // Summary
  console.log('\n=== ERRORS CAPTURED ===');
  if (errors.length === 0) console.log('  None');
  else errors.forEach(e => console.log(`  - ${e}`));

  console.log('\n=== DONE ===');
  await browser.close();
})().catch(err => {
  console.error('TEST FAILED:', err.message);
  process.exit(1);
});
