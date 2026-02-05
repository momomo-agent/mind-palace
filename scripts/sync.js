#!/usr/bin/env node
/**
 * Sync bookmarks from Raindrop.io
 */
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

async function fetchBookmarks() {
  const script = '/Users/kenefe/clawd/skills/raindrop/scripts/raindrop.sh'; // path unchanged, skill still in clawd
  const result = execSync(`${script} GET '/raindrops/0?perpage=100&sort=-created'`, {
    encoding: 'utf-8'
  });
  return JSON.parse(result);
}

function inferRelations(items) {
  const relations = [];
  const clusters = {};
  
  // Group by domain/topic
  items.forEach(item => {
    const domain = item.domain;
    if (!clusters[domain]) clusters[domain] = [];
    clusters[domain].push(item._id);
  });

  // Infer relations based on tags, domain, time proximity
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const sharedTags = a.tags.filter(t => b.tags.includes(t));
      
      if (sharedTags.length > 0) {
        relations.push({
          source: a._id,
          target: b._id,
          strength: sharedTags.length,
          reason: sharedTags.join(', ')
        });
      }
      
      // Same domain = related
      if (a.domain === b.domain && a._id !== b._id) {
        const exists = relations.find(r => 
          (r.source === a._id && r.target === b._id) ||
          (r.source === b._id && r.target === a._id)
        );
        if (!exists) {
          relations.push({
            source: a._id,
            target: b._id,
            strength: 1,
            reason: `same domain: ${a.domain}`
          });
        }
      }
    }
  }
  
  return relations;
}

function extractHighlights(note) {
  if (!note) return [];
  const highlights = [];
  
  // 提取关键短语（用破折号、分号、句号分隔的要点）
  const patterns = [
    /——([^。；]+)/g,  // 中文破折号后的内容
    /：([^。；，]{10,40})/g,  // 冒号后的短句
    /「([^」]+)」/g,  // 引号内容
    /"([^"]+)"/g,  // 英文引号
  ];
  
  patterns.forEach(p => {
    let m;
    while ((m = p.exec(note)) !== null) {
      const h = m[1].trim();
      if (h.length > 5 && h.length < 50) {
        highlights.push(h);
      }
    }
  });
  
  // 如果没提取到，取前 50 字作为摘要
  if (highlights.length === 0 && note.length > 10) {
    const first = note.slice(0, 60).replace(/[。；].*$/, '');
    if (first) highlights.push(first);
  }
  
  return highlights.slice(0, 3);
}

function inferThemes(items) {
  // Identify major themes from your bookmarks
  const themes = [
    {
      id: 'moltbot-ecosystem',
      name: 'Moltbot/Clawdbot 生态',
      keywords: ['moltbot', 'clawdbot', 'steipete', 'peter steinberger'],
      color: '#6366f1'
    },
    {
      id: 'ai-agent-tools',
      name: 'AI Agent 工具链',
      keywords: ['agent', 'skill', 'browser', 'cli', 'automation'],
      color: '#10b981'
    },
    {
      id: 'ai-reflection',
      name: 'AI 时代反思',
      keywords: ['thinking', 'vibe coding', 'builder', 'thinker'],
      color: '#f59e0b'
    },
    {
      id: 'ai-products',
      name: 'AI 产品/应用',
      keywords: ['app', 'product', 'variant'],
      color: '#ec4899'
    }
  ];
  
  // Assign items to themes
  items.forEach(item => {
    const text = `${item.title} ${item.note} ${item.tags.join(' ')}`.toLowerCase();
    item.themes = [];
    themes.forEach(theme => {
      if (theme.keywords.some(kw => text.includes(kw))) {
        item.themes.push(theme.id);
      }
    });
    // Default to AI if has AI tag but no specific theme
    if (item.themes.length === 0 && item.tags.includes('AI')) {
      item.themes.push('ai-products');
    }
    // Extract highlights
    item.highlights_text = extractHighlights(item.note);
  });
  
  return themes;
}

async function main() {
  console.log('Fetching bookmarks from Raindrop...');
  const data = await fetchBookmarks();
  
  if (!data.result || !data.items) {
    console.error('Failed to fetch bookmarks');
    process.exit(1);
  }
  
  const items = data.items;
  console.log(`Fetched ${items.length} bookmarks`);
  
  console.log('Inferring themes...');
  const themes = inferThemes(items);
  
  console.log('Inferring relations...');
  const relations = inferRelations(items);
  console.log(`Found ${relations.length} relations`);
  
  const output = {
    meta: {
      syncedAt: new Date().toISOString(),
      count: items.length
    },
    themes,
    items,
    relations
  };
  
  writeFileSync(join(dataDir, 'bookmarks.json'), JSON.stringify(output, null, 2));
  console.log('Saved to data/bookmarks.json');
}

main().catch(console.error);
