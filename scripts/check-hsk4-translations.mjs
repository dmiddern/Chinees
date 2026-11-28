import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const words = JSON.parse(readFileSync(new URL('../src/data/words-hsk4.json', import.meta.url), 'utf8'));
assert.equal(words.length, 1000, 'HSK 4 moet 1000 woorden bevatten');
assert.deepEqual(words.map(w => w.id), Array.from({length: 1000}, (_, i) => 1001 + i), 'Woordnummers moeten stabiel blijven');
for (const w of words) {
  assert.equal(w.level, 4, `Niveau bij ${w.hanzi}`);
  assert.equal(w.meaningLanguage, 'nl', `Nederlandse betekenis ontbreekt bij ${w.hanzi}`);
  assert.ok(w.meaningNl.trim() && w.hanzi && w.pinyin, `Onvolledig woord ${w.id}`);
  assert.ok(!/\b(?:to |the |measure word|according to|something|someone|adjective|noun|verb|number|suffix)\b/i.test(w.meaningNl + ' ' + w.wordType), `Engelse tekst bij ${w.hanzi}`);
}
console.log('HSK 4: 1000 Nederlandse betekenissen, Nederlandse woordsoorten en stabiele woordnummers gecontroleerd.');
