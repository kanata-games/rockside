// Renders every BGM track (one seamless loop each) to 16-bit mono WAV with the game's own synth code
// (OfflineAudioContext in headless Chromium).  node tools/render_bgm.js [outDir]   (build first)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SERVE = require('./serve.js');
(async () => {
  const out = path.resolve(process.argv[2] || path.join(__dirname, '..', 'bgm_out')); fs.mkdirSync(out, { recursive: true });
  const srv = await SERVE.start(path.resolve(__dirname, '..')); const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(srv.url + 'index.html'); await p.waitForFunction(() => window.ROCKSIDE && ROCKSIDE.MUSIC_LIST);
  const list = await p.evaluate(() => ROCKSIDE.MUSIC_LIST.map(id => ({ id, no: ROCKSIDE.MUSIC_SONGS[id].no, variant: !!ROCKSIDE.MUSIC_SONGS[id].variant, name: ROCKSIDE.MUSIC_SONGS[id].name })));
  for (const t of list) {
    const r = await p.evaluate(id => ROCKSIDE.musicRenderWav(id, 44100, 0.8), t.id);
    const fn = (t.variant ? '10b' : String(t.no).padStart(2, '0')) + '_' + t.id + '.wav';
    fs.writeFileSync(path.join(out, fn), Buffer.from(r.b64, 'base64'));
    console.log(fn.padEnd(22), r.dur.toFixed(1) + 's', 'peak ' + r.peak.toFixed(2), t.name);
  }
  console.log('errors:', errs.length ? errs : 'none'); await b.close(); srv.close();
})();
