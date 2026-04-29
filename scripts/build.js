#!/usr/bin/env node
/**
 * Build static site from bookmark data
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const distDir = join(__dirname, '..', 'dist');

// Valid themes (lowercase). All others get mapped.
const VALID_THEMES = new Set(['ai','develop','article','design','app','tool','internet','note','render']);
const THEME_MAP = {
  'os':'develop','tutorial':'article','apple':'app','indie':'app','figma':'design',
  'miui':'app','video':'article','research':'article','render/cloud':'render',
  'render/shadow':'render','ios':'develop','dev':'develop','paper':'article',
  'thinking':'article','hardware':'develop','insight':'article','math':'develop',
  'product':'app','ui':'design','talk':'article','swiftui':'develop',
  'claudecode':'develop','infrastructure':'develop','tts':'tool','llm':'ai',
  'security':'develop','portfolio':'design','people':'article','messaging':'app',
  'threejs':'develop','demo':'design','future':'article','interview':'article',
  'agent':'ai','openai':'ai','sdk':'develop','font':'design','opinion':'article',
  'podcast':'article','iot':'develop','essay':'article','philosophy':'article',
  'visualization':'design','openclaw':'develop','3d':'render','engineering':'develop',
  'career':'article','transcript':'article','animation':'design','cloudflare':'develop',
  'networking':'develop','reverseengineering':'develop','skill':'tool','codingagent':'ai',
  'prompt':'ai','prototyping':'design','swift':'develop','webview':'develop',
  'idea':'article','audio':'article','discussion':'article','news':'article',
  'frontend':'develop','macos':'develop','reference':'article','blog':'article',
  'gesture':'design','life':'article','javascript':'develop','opensource':'develop',
  'android':'develop',
};
const THEME_NAMES = {
  'ai':'AI','develop':'开发','article':'文章','design':'设计','app':'应用',
  'tool':'Tool','internet':'互联网','note':'笔记','render':'渲染'
};

function normalizeThemes(themes) {
  const result = new Set();
  for (const t of themes) {
    const lower = t.toLowerCase();
    if (VALID_THEMES.has(lower)) { result.add(lower); }
    else if (THEME_MAP[lower]) { result.add(THEME_MAP[lower]); }
    else {
      // fuzzy fallback
      if (lower.includes('render')) result.add('render');
      else if (lower.includes('design')||lower.includes('ui')) result.add('design');
      else if (lower.includes('dev')||lower.includes('code')) result.add('develop');
      else if (lower.includes('ai')||lower.includes('llm')) result.add('ai');
      else result.add('article');
    }
  }
  return [...result];
}

function normalizeTags(tags) {
  const VALID_TAGS = new Set(['AI','Develop','Article','Design','App','Tool','Internet','Note','Render']);
  const TAG_MAP = {};
  for (const [k,v] of Object.entries(THEME_MAP)) {
    TAG_MAP[k.toLowerCase()] = v.charAt(0).toUpperCase() + v.slice(1);
  }
  const result = new Set();
  for (const t of tags) {
    if (VALID_TAGS.has(t)) { result.add(t); }
    else if (TAG_MAP[t.toLowerCase()]) { result.add(TAG_MAP[t.toLowerCase()]); }
    else result.add('Article');
  }
  return [...result];
}

function build() {
  console.log('Building mind palace...');
  
  const data = JSON.parse(readFileSync(join(dataDir, 'bookmarks.json'), 'utf-8'));
  
  // Normalize tags and themes on every build
  let fixedThemes = 0, fixedTags = 0;
  if (data.items) {
    for (const item of data.items) {
      if (item.themes) {
        const before = JSON.stringify(item.themes);
        item.themes = normalizeThemes(item.themes);
        if (JSON.stringify(item.themes) !== before) fixedThemes++;
      }
      if (item.tags) {
        const before = JSON.stringify(item.tags);
        item.tags = normalizeTags(item.tags);
        if (JSON.stringify(item.tags) !== before) fixedTags++;
      }
    }
  }
  if (fixedThemes || fixedTags) {
    console.log(`Normalized: ${fixedThemes} themes, ${fixedTags} tags`);
  }
  
  // Rebuild top-level themes from items
  const themeSet = new Set();
  for (const item of (data.items || [])) {
    for (const t of (item.themes || [])) themeSet.add(t);
  }
  data.themes = [...themeSet].sort().map(id => ({ id, name: THEME_NAMES[id] || id }));
  
  // Sort items by created date descending (newest first)
  if (data.items) {
    data.items.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
  }
  
  // Embed data into HTML
  const html = readFileSync(join(__dirname, '..', 'src', 'index.html'), 'utf-8');
  const output = html.replace('__DATA__', JSON.stringify(data));
  
  writeFileSync(join(distDir, 'index.html'), output);
  copyFileSync(join(__dirname, '..', 'src', 'favicon.svg'), join(distDir, 'favicon.svg'));
  console.log('Built dist/index.html');
}

build();
