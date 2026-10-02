/* SPDX-License-Identifier: MIT */
// Browser checks for the UI prototype; not the planned C01–C16 conformance suite.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const output = path.resolve('qa-output');
const checks = [];
const server = spawn('python3', ['-m', 'http.server', '8766', '--directory', 'docs', '--bind', '127.0.0.1'], { stdio: 'ignore' });
const base = 'http://127.0.0.1:8766/';
let browser, page;
const pass = message => { checks.push(message); console.log(`PASS: ${message}`); };
const current = () => page.evaluate(() => window.VLISDemo.getState());
const click = action => page.locator(`[data-action="${action}"]:visible`).first().click();
const view = name => page.locator(`[data-view="${name}"]`).click();
const areaNumber = text => Number(text.replace(/m²/g, '').trim().replace(/\./g, '').replace(',', '.'));

(async () => {
  await fs.mkdir(output, { recursive: true });
  for (let attempt = 0; attempt < 50; attempt++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    if (attempt === 49) throw new Error('Preview server did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(base);
  await page.waitForFunction(() => !!window.VLISDemo);
  assert.equal(await page.locator('#blocks-layer polygon').count(), 20);
  assert.equal((await current()).blocks.length, 20);
  pass('20 synthetic regions loaded without external runtime dependencies');

  for (const id of ['K001', 'K007', 'K017']) {
    await page.locator('#block-search').fill(id);
    await page.locator(`#attribute-content tr[data-block="${id}"]`).click();
    const data = await current(), block = data.blocks.find(b => b.id === id);
    assert.equal(data.selected, id);
    assert.equal(await page.locator('#blocks-layer .selected').getAttribute('data-block'), id);
    assert.equal(await page.locator('.block-index h1').textContent(), id);
    const displayed = areaNumber(await page.locator('#selected-area').textContent());
    const tableArea = areaNumber(await page.locator(`#attribute-content tr[data-block="${id}"] td`).nth(3).textContent());
    assert.equal(displayed, tableArea);
    if (id !== 'K017') assert.equal(displayed, block.declaredArea);
    else assert.equal(block.declaredArea - displayed, 150);
  }
  await page.locator('#block-search').fill('không có khoanh này');
  assert.equal(await page.locator('#attribute-content tbody tr').count(), 0);
  await page.locator('#block-search').fill('');
  await page.locator('#blocks-layer [data-block="K007"]').press('Enter');
  assert.equal((await current()).selected, 'K007');
  assert.match(await page.locator('.combined-card').textContent(), /1\.250,0/);
  pass('Map, table and inspector agree; search, empty result and keyboard selection work');

  await page.locator('[data-layer="labels"]').uncheck();
  assert.equal(await page.locator('#labels-layer').isVisible(), false);
  await page.locator('[data-layer="labels"]').check();
  await page.locator('#map-theme').selectOption('quality');
  assert.match(await page.locator('.layer-legend .section-label').textContent(), /KIỂM TRA/);
  await page.locator('#map-theme').selectOption('landuse');
  const oldBox = await page.locator('#land-map').getAttribute('viewBox');
  await click('zoom-in');
  assert.notEqual(await page.locator('#land-map').getAttribute('viewBox'), oldBox);
  await click('fit');
  assert.equal(await page.locator('#land-map').getAttribute('viewBox'), oldBox);
  pass('Layer visibility, theme legend and zoom controls work');

  await click('validate');
  await page.waitForFunction(() => window.VLISDemo.getState().checked);
  let data = await current();
  assert.equal(data.issues.filter(i => i.severity === 'error').length, 2);
  assert.equal(data.issues.filter(i => i.severity === 'warning').length, 1);
  await click('aggregate');
  assert.equal((await current()).report, null);
  await click('fix-all');
  await page.waitForFunction(() => window.VLISDemo.getState().checked && !window.VLISDemo.getState().issues.some(i => i.severity === 'error'));
  data = await current();
  assert.equal(data.issues.length, 1);
  assert.equal(data.issues[0].code, 'HISTORY_MISSING');
  await click('aggregate');
  data = await current();
  assert.equal(data.workflow, 'ready');
  assert.equal(data.report.totalAreaM2, data.totalAreaM2);
  assert.equal(Object.values(data.report.totals).reduce((sum, v) => sum + v.area, 0), data.totalAreaM2);
  assert.equal(Object.values(data.report.totals).reduce((sum, v) => sum + v.count, 0), 20);
  assert.equal(data.blocks.find(b => b.id === 'K007').combinedUse.area, 1250);
  pass('Sample errors block aggregation; repairs preserve warning and avoid double counting combined land');

  await view('dossier');
  await click('submit');
  const snapshot = (await current()).snapshot;
  assert.equal((await current()).workflow, 'uploaded');
  assert.equal(await page.locator('#ribbon-aggregate').isEnabled(), false);
  await click('request-review');
  assert.equal((await current()).workflow, 'pending');
  await click('approve');
  assert.equal((await current()).workflow, 'approved');
  assert.deepEqual((await current()).snapshot, snapshot);
  await click('return');
  data = await current();
  assert.equal(data.workflow, 'returned');
  assert.equal(data.report, null);
  assert.equal(data.checked, false);
  assert.deepEqual(data.snapshot, snapshot);
  const jsonPromise = page.waitForEvent('download');
  await click('export');
  const jsonDownload = await jsonPromise;
  await jsonDownload.saveAs(path.join(output, 'sample-export.json'));
  const exported = JSON.parse(await fs.readFile(path.join(output, 'sample-export.json'), 'utf8'));
  assert.equal(exported.syntheticData, true);
  assert.equal(exported.coordinateSystem.kind, 'synthetic_local_metric');
  assert.equal(exported.report, null);
  assert.deepEqual(exported.previousSubmittedSnapshot, snapshot);
  await view('stats');
  const csvPromise = page.waitForEvent('download');
  await click('csv');
  await (await csvPromise).saveAs(path.join(output, 'sample-export.csv'));
  assert.equal((await fs.readFile(path.join(output, 'sample-export.csv'), 'utf8')).trim().split('\r\n').length, 7);
  pass('Send, review, approve, return and JSON/CSV exports preserve the submitted snapshot');

  await click('sample');
  await page.screenshot({ path: path.join(output, 'desktop.png') });
  for (const [width, height] of [[1920, 1080], [1366, 768], [1024, 768], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Body overflows at ${width}px`);
    assert.equal(await page.locator('#land-map').isVisible(), true);
    const mapBox = await page.locator('#land-map').boundingBox();
    assert.ok(mapBox.height >= 120 && mapBox.width >= 280, `Map is too small at ${width}px`);
    if (width < 850) {
      await click('open-layers');
      await page.locator('#info-dialog [data-layer="labels"]').uncheck();
      await page.locator('#info-dialog [data-action="close-dialog"]').first().click();
      assert.equal(await page.locator('#labels-layer').isVisible(), false);
      await click('open-inspector');
      assert.match(await page.locator('#dialog-title').textContent(), /K009/);
      await page.locator('#info-dialog [data-action="close-dialog"]').first().click();
      await page.screenshot({ path: path.join(output, `mobile-${width}.png`), fullPage: true });
    }
  }
  pass('Desktop, tablet and mobile widths remain usable; mobile layer and inspector dialogs work');
  assert.deepEqual(errors, []);
  pass('No browser script errors or failed resource requests');
  await fs.writeFile(path.join(output, 'result.json'), JSON.stringify({ status: 'passed', checks, conformanceSuite: 'not_run', totalAreaM2: data.totalAreaM2 }, null, 2));
})().catch(async error => {
  console.error(error);
  if (page) await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true }).catch(() => {});
  await fs.writeFile(path.join(output, 'result.json'), JSON.stringify({ status: 'failed', checks, error: error.message, conformanceSuite: 'not_run' }, null, 2));
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
  server.kill();
});
