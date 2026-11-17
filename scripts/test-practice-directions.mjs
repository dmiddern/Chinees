import assert from 'node:assert/strict';
import { registerHooks, stripTypeScriptTypes } from 'node:module';

import { readFileSync } from 'node:fs';
registerHooks({
 resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts') && !specifier.endsWith('.ts')) specifier += '.ts';
  return next(specifier, context);
 },
 load(url, context, next) {
  if (url.endsWith('.ts')) return { format: 'module', shortCircuit: true, source: stripTypeScriptTypes(readFileSync(new URL(url),'utf8')) };
  return next(url,context);
 }
});
const { normalizePinyin: n, directions, matchingPromptWords, checkPinyinAnswer } = await import('../src/lib/practiceDirections.ts');
const { createLearningSession, loadLearningSession, saveLearningSession } = await import('../src/lib/learningSession.ts');
const { updateSkill, emptyWordProgress, saveProgress, loadProgress } = await import('../src/lib/progress.ts');
const storage = new Map();
globalThis.localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) };
for (const [a,b] of [['nǐ hǎo','ni3hao3'],['nǐhǎo','ni3 hao3'],['lǜ','lv4'],['nǚ','nu:3'],['māma','ma1 ma5'],['ma0','ma5'],["xī’ān","xi1 an1"],['NǏ HǍO','ni3 hao3']]) assert.equal(n(a),n(b),a);
assert.notEqual(n('nu3'),n('nǚ'));
assert.notEqual(n('ni hao'),n('nǐ hǎo'));
assert.equal(n('ni9'), '');
assert.equal(n('nǐ4'), '');
const word = { id:1, hanzi:'是', pinyin:'shì', meaningNl:'zijn' };
const other = { id:2, hanzi:'事', pinyin:'shì', meaningNl:'zaak' };
const alternative = { id:3, hanzi:'在', pinyin:'zài', meaningNl:'zijn' };
assert.equal(matchingPromptWords(word,'pinyin-zh',[word,other,alternative]).length,2);
assert.equal(checkPinyinAnswer('zai4',word,'nl-pinyin',[word,other,alternative]),true);
assert.equal(checkPinyinAnswer('shi2',word,'nl-pinyin',[word,other]),false);
for (const direction of directions) {
 const session = createLearningSession('test',[1,2],'Test',direction);
 assert.equal(session.queue.length,2);
 assert.ok(session.queue.every(e => e.direction === direction));
 saveLearningSession(session); assert.deepEqual(loadLearningSession(), session);
}
let progress = { 1: emptyWordProgress() };
progress = updateSkill(progress,1,'meaning',true,'zh-nl');
progress = updateSkill(progress,1,'meaning',false,'pinyin-nl');
assert.equal(progress[1].directions['zh-nl'].correct,1);
assert.equal(progress[1].directions['pinyin-nl'].incorrect,1);
assert.equal(progress[1].meaning.correct,1);
assert.equal(progress[1].meaning.incorrect,1);
saveProgress(progress); assert.deepEqual(loadProgress(),progress);
console.log('Practice directions: normalization, ambiguity, six sessions, legacy progress and persistence passed.');


const { applyPinyinTone: tone } = await import('../src/lib/pinyinInput.ts');
for (const [input, cursor, selectedTone, expected] of [
 ['hao',3,3,'hǎo'], ['ni hao',2,3,'nǐ hao'], ['ni hao',6,3,'ni hǎo'],
 ['nihao',5,3,'nihǎo'], ['liu',3,2,'liú'], ['gui',3,4,'guì'], ['shui',4,3,'shuǐ'],
 ['ou',2,1,'ōu'], ['nǚ',2,4,'nǜ'], ['lv',2,4,'lǜ'], ['nu:',3,3,'nǚ'],
 ['hao3',4,4,'hào'], ['hǎo',3,5,'hao'], ['HAO',3,3,'HǍO'], ['',0,1,''],
 ['ni ',3,3,'nǐ '], ['nihao',2,3,'nǐhao'],
]) assert.equal(tone(input,cursor,cursor,selectedTone).value,expected,input);
assert.deepEqual(tone('ni hao',3,6,3), {value:'ni hǎo',cursor:6});
console.log('Tone editing: caret, selection, placement, replacement, neutral tone and keyboard aliases passed.');

const { pinyinFeedback: feedback } = await import('../src/lib/practiceDirections.ts');
assert.deepEqual(feedback('ni2 hao3',['nǐ hǎo']).details, ['Lettergreep 1 (ni): toon 2 → toon 3.']);
assert.match(feedback('liang2',['líng']).details[0], /spelling.*liang.*ling/);
assert.equal(feedback('ni hao',['nǐ hǎo']).details.length,2);
assert.match(feedback('ni3',['nǐ hǎo']).details[0], /1 lettergrepen.*2/);
assert.match(feedback('???',['nǐ']).details[0], /geen herkenbare pinyin/);
assert.equal(feedback('zai2',['shì','zài']).expected,'zài');
assert.equal(feedback('ma1',['mā']).details.length,0);
console.log('Specific feedback: tone, spelling, missing tones, syllable count and alternatives passed.');

const { applyPinyinUmlaut: umlaut } = await import('../src/lib/pinyinInput.ts');
assert.equal(umlaut('lu',2,2).value,'lü');
assert.equal(umlaut('lǔ',2,2).value,'lǚ');
assert.equal(umlaut('nu3',3,3).value,'nü3');
assert.equal(umlaut('',0,0).value,'ü');
console.log('Trema application passed.');
