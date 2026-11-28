import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

// Load the actual TypeScript data without the browser or a second data fixture.
const modules = new Map();
async function load(relative) {
  if (modules.has(relative)) return modules.get(relative);
  let code = stripTypeScriptTypes(readFileSync(new URL(`../src/${relative}.ts`, import.meta.url), 'utf8'));
  for (const match of [...code.matchAll(/from "(\.\.?\/[^\"]+)"/g)]) {
    const dependency = new URL(match[1], `file:///${relative}`).pathname.slice(1);
    const { url } = await load(dependency);
    code = code.replaceAll(`from "${match[1]}"`, `from "${url}"`);
  }
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  const result = { url, exports: await import(url) };
  modules.set(relative, result);
  return result;
}
const { articles } = (await load('data/articles')).exports;
const { enrichArticle, missingArticleEnrichments } = (await load('data/articleEnrichment')).exports;
const { exampleAnalyses } = (await load('data/exampleAnalyses')).exports;
const { exercisesForArticle } = (await load('lib/course')).exports;
assert.equal(articles.length, 89);
assert.equal(new Set(articles.map(a => a.id)).size, 89);
assert.deepEqual(articles.map(a => a.order), Array.from({ length: 89 }, (_, i) => i + 1));
assert.deepEqual(missingArticleEnrichments(articles), []);
const keys = new Set(articles.flatMap(a => a.examples.map(e => `${a.id}|${e.chinese}`)));
assert.equal(keys.size, 301);
assert.deepEqual(Object.keys(exampleAnalyses).filter(key => !keys.has(key)), []);
let questions = 0;
for (const article of articles) {
  assert.ok(article.examples.every(e => e.chinese && e.pinyin && e.dutch && e.analysis?.trim()), article.id);
  if (article.order <= 32) assert.ok(article.exercises.length >= 2, `Concept questions lost: ${article.id}`);
  const exercises = exercisesForArticle(article);
  assert.ok(exercises.length > 0 && exercises.length <= 5, article.id);
  assert.equal(new Set(exercises.map(e => e.question)).size, exercises.length);
  for (const e of exercises) {
    assert.ok(e.options[e.answer] && Number.isInteger(e.answer));
    assert.equal(new Set(e.options).size, e.options.length);
    assert.ok(!e.options.some(o => /Geen van deze/i.test(o)));
    questions++;
  }
}
const original = articles.find(a => a.id === 'pinyin-tekst');
const reversed = enrichArticle({ ...original, examples: [...original.examples].reverse().map(({ analysis, ...e }) => e) });
for (const e of reversed.examples) assert.equal(e.analysis, exampleAnalyses[`${original.id}|${e.chinese}`]);
assert.equal(enrichArticle({ ...original, examples: [{ chinese: '完全不同的句子。', pinyin: '', dutch: '' }] }).examples[0].analysis, undefined);
assert.equal(enrichArticle({ ...original, examples: [{ ...original.examples[0], analysis: 'Eigen analyse' }] }).examples[0].analysis, 'Eigen analyse');
const invalid = { question: 'Foute vraag', options: ['zelfde', 'zelfde'], answer: 0, explanation: '' };
assert.ok(!exercisesForArticle({ ...original, exercises: [invalid] }).some(e => e.question === invalid.question));
const incomplete = { ...original, exercises: [], examples: original.examples.slice(0, 1) };
assert.deepEqual(exercisesForArticle(incomplete), []);
console.log(`Theorie: 89 onderwerpen, 301 exacte voorbeeldkoppelingen en ${questions} oefenvragen gecontroleerd; begripsvragen en veilige terugval behouden.`);
