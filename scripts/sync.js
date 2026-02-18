#!/usr/bin/env node
/**
 * Sync bookmarks from Raindrop.io
 */
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

async function fetchBookmarks() {
  const script = '/Users/kenefe/clawd/skills/raindrop/scripts/raindrop.sh';
  const perpage = 50;
  let page = 0;
  let all = [];
  while (true) {
    const result = execSync(`${script} GET '/raindrops/0?perpage=${perpage}&page=${page}&sort=-created'`, {
      encoding: 'utf-8',
      env: { ...process.env, RAINDROP_TOKEN: process.env.RAINDROP_TOKEN || execSync(`grep -o '"RAINDROP_TOKEN"[[:space:]]*:[[:space:]]*"[^"]*"' "$HOME/.openclaw/openclaw.json" | head -1 | sed 's/.*"RAINDROP_TOKEN"[[:space:]]*:[[:space:]]*"//;s/"$//'`, { encoding: 'utf-8' }).trim() }
    });
    const data = JSON.parse(result);
    const items = data.items || [];
    all.push(...items);
    console.log(`Fetched page ${page}: ${items.length} items (total: ${all.length})`);
    if (items.length < perpage) break;
    page++;
  }
  return { items: all, count: all.length };
}

function inferRelations(items) {
  // Inverted index: tag -> item indices
  const tagIndex = {};
  items.forEach((item, idx) => {
    (item.tags || []).forEach(tag => {
      if (!tagIndex[tag]) tagIndex[tag] = [];
      tagIndex[tag].push(idx);
    });
  });

  // Build relations via shared tags (avoids O(n²) full scan)
  const pairMap = new Map(); // "i:j" -> { strength, reasons }
  for (const [tag, indices] of Object.entries(tagIndex)) {
    // Skip huge groups to avoid explosion
    if (indices.length > 200) continue;
    for (let x = 0; x < indices.length; x++) {
      for (let y = x + 1; y < indices.length; y++) {
        const i = indices[x], j = indices[y];
        const key = `${i}:${j}`;
        if (!pairMap.has(key)) pairMap.set(key, { i, j, strength: 0, reasons: [] });
        const p = pairMap.get(key);
        p.strength++;
        if (p.reasons.length < 3) p.reasons.push(tag);
      }
    }
  }

  // Only keep relations with strength >= 2 (shared 2+ tags), cap at 5000 total
  const relations = Array.from(pairMap.values())
    .filter(p => p.strength >= 2)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5000)
    .map(p => ({
      source: items[p.i]._id,
      target: items[p.j]._id,
      strength: p.strength,
      reason: p.reasons.join(', ')
    }));

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

// Tag 中文名映射
const TAG_NAMES = {
  'Design': '设计', 'Develop': '开发', 'Article': '文章',
  'App': '应用', 'Render': '渲染', 'AI': 'AI', 'ai': 'AI',
  'OS': '操作系统', 'os': '操作系统',
  'Tutorial': '教程', 'Internet': '互联网',
  'Apple': 'Apple', 'Note': '笔记', 'Indie': '独立开发',
  'Android': 'Android', 'twitter': 'Twitter', 'agent': 'Agent'
};

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#14b8a6', '#f97316', '#ef4444', '#3b82f6', '#84cc16'
];

function normalizeTag(t) {
  const lower = t.toLowerCase();
  if (lower === 'ai') return 'AI';
  if (lower === 'os') return 'OS';
  return t;
}

function inferThemes(items) {
  // 基于 tags 动态聚类
  const tagMap = {};
  
  items.forEach((item, idx) => {
    let tags = (item.tags || []).map(normalizeTag);
    if (tags.length === 0) tags = ['其他'];
    
    tags.forEach(tag => {
      const parts = tag.split('/');
      const root = normalizeTag(parts[0]);
      const sub = parts.length > 1 ? parts.slice(1).join('/') : null;
      
      if (!tagMap[root]) {
        tagMap[root] = { indices: new Set(), children: {} };
      }
      tagMap[root].indices.add(idx);
      
      if (sub) {
        if (!tagMap[root].children[sub]) {
          tagMap[root].children[sub] = new Set();
        }
        tagMap[root].children[sub].add(idx);
      }
    });
    
    // 提取看点
    item.highlights_text = extractHighlights(item.note);
    // 设置 themes
    item.themes = tags.map(t => normalizeTag(t.split('/')[0]).toLowerCase());
  });
  
  // 构建主题树，按数量排序
  const themes = [];
  let colorIdx = 0;
  
  const sorted = Object.entries(tagMap)
    .sort((a, b) => b[1].indices.size - a[1].indices.size);
  
  for (const [tag, data] of sorted) {
    const theme = {
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      name: TAG_NAMES[tag] || tag,
      color: COLORS[colorIdx++ % COLORS.length],
      count: data.indices.size,
      items: [...data.indices].map(i => items[i]._id)
    };
    
    // 添加子分类
    const childEntries = Object.entries(data.children);
    if (childEntries.length > 0) {
      theme.children = childEntries
        .sort((a, b) => b[1].size - a[1].size)
        .map(([subTag, subIndices], i) => ({
          id: `${theme.id}-${subTag.toLowerCase()}`,
          name: TAG_NAMES[subTag] || subTag,
          color: COLORS[(colorIdx + i) % COLORS.length],
          count: subIndices.size,
          items: [...subIndices].map(j => items[j]._id)
        }));
    }
    
    themes.push(theme);
  }
  
  return themes;
}

// 话题星系聚类：基于关键词语义相似度
function inferGalaxies(items) {
  const COLORS = ['#C4785A', '#7A8B6E', '#5A6B7A', '#8B6E7A', '#B8A060', '#6B8B8B', '#9C7A5A', '#7A6B8B', '#8B7A6E', '#5A7A6B', '#8B8B5A', '#5A8B7A'];
  const galaxies = [];
  const assigned = new Set();
  let gIdx = 0;

  // 1. Related clusters: group items connected via related.json
  const relAdj = new Map();
  items.forEach((a, i) => {
    if (!a.related) return;
    a.related.forEach(r => {
      const j = items.findIndex(b => b.link === r.url);
      if (j >= 0 && j !== i) {
        if (!relAdj.has(i)) relAdj.set(i, new Set());
        if (!relAdj.has(j)) relAdj.set(j, new Set());
        relAdj.get(i).add(j);
        relAdj.get(j).add(i);
      }
    });
  });

  // BFS to find connected components from related links
  const visited = new Set();
  for (let start = 0; start < items.length; start++) {
    if (visited.has(start) || !relAdj.has(start)) continue;
    const queue = [start];
    const component = [];
    visited.add(start);
    while (queue.length) {
      const cur = queue.shift();
      component.push(cur);
      if (relAdj.has(cur)) {
        for (const nb of relAdj.get(cur)) {
          if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
        }
      }
    }
    if (component.length >= 2) {
      const name = autoName(component, items);
      component.forEach(i => assigned.add(i));
      galaxies.push({
        id: `galaxy-${gIdx}`, name, color: COLORS[gIdx % COLORS.length],
        members: component.map(i => items[i]._id), count: component.length
      });
      gIdx++;
    }
  }

  // 2. Domain clusters for unassigned (same domain, ≥2 items)
  const domGroups = {};
  items.forEach((item, i) => {
    if (assigned.has(i) || !item.domain || item.domain === 'github.com' || item.domain === 'x.com') return;
    (domGroups[item.domain] = domGroups[item.domain] || []).push(i);
  });
  Object.entries(domGroups).forEach(([dom, members]) => {
    if (members.length < 2) return;
    const name = autoName(members, items);
    members.forEach(i => assigned.add(i));
    galaxies.push({
      id: `galaxy-${gIdx}`, name, color: COLORS[gIdx % COLORS.length],
      members: members.map(i => items[i]._id), count: members.length
    });
    gIdx++;
  });

  // 3. Tag-pair clusters for remaining unassigned
  const tagPairs = {};
  items.forEach((item, i) => {
    if (assigned.has(i)) return;
    const tags = item.tags.sort();
    for (let a = 0; a < tags.length; a++) {
      for (let b = a + 1; b < tags.length; b++) {
        const key = tags[a] + '+' + tags[b];
        (tagPairs[key] = tagPairs[key] || []).push(i);
      }
    }
  });
  // Greedily assign to largest tag-pair group
  Object.entries(tagPairs)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([pair, members]) => {
      const unassignedMembers = members.filter(i => !assigned.has(i));
      if (unassignedMembers.length < 2) return;
      const name = pair.replace('+', ' · ');
      unassignedMembers.forEach(i => assigned.add(i));
      galaxies.push({
        id: `galaxy-${gIdx}`, name, color: COLORS[gIdx % COLORS.length],
        members: unassignedMembers.map(i => items[i]._id), count: unassignedMembers.length
      });
      gIdx++;
    });

  // 4. Remaining → 散星
  const unassigned = items.map((_, i) => i).filter(i => !assigned.has(i));
  if (unassigned.length > 0) {
    galaxies.push({
      id: 'galaxy-explore', name: '散星', color: '#9C948A',
      members: unassigned.map(i => items[i]._id), count: unassigned.length
    });
  }

  // Bridges
  const bridges = [];
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      const shared = galaxies[i].members.filter(id => galaxies[j].members.includes(id));
      if (shared.length > 0) bridges.push({ source: galaxies[i].id, target: galaxies[j].id, strength: shared.length, shared });
    }
  }

  return { galaxies, bridges };
}

function autoName(indices, items) {
  const words = {};
  const STOP = new Set(['the','a','an','and','or','for','to','of','in','on','is','with','from','by','that','this','it','as','at','be','are','was','has','have','how','what','your','you','i','my','we','our','can','will','about','into','using','via','more','new','just','all','not','but','its','than','been','one','use','get','like','also','most','when','they','their','do','if','no','so','up','out','now','here','even','only','over','after','then','some','other','any','each','every','both','few','many','much','very','too','own','same','such','back','way','well','still','first','last','long','great','little','right','old','big','high','different','small','large','next','early','young','important','public','bad','real','best','better','sure','free','full','open','source','code','ai','tool','design','develop','article','model','context','protocol','mcp','allows','claude','desktop','other','tools','github','copilot','cursor','etc','interact','directly']);
  indices.forEach(i => {
    const text = ((items[i].title || '') + ' ' + (items[i].note || '')).toLowerCase();
    text.split(/[\s,.:;!?()[\]{}|/\\<>"'`~@#$%^&*+=]+/).forEach(w => {
      if (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)) words[w] = (words[w] || 0) + 1;
    });
  });
  return Object.entries(words).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]).join(' + ') || '未命名';
}

async function main() {
  console.log('Fetching bookmarks from Raindrop...');
  const data = await fetchBookmarks();
  
  if (!data.items || data.items.length === 0) {
    console.error('Failed to fetch bookmarks');
    process.exit(1);
  }
  
  const items = data.items;
  console.log(`Fetched ${items.length} bookmarks`);
  
  // Merge related recommendations
  const relatedPath = join(dataDir, 'related.json');
  if (existsSync(relatedPath)) {
    const relatedMap = JSON.parse(readFileSync(relatedPath, 'utf-8'));
    items.forEach(item => {
      if (relatedMap[item.link]) {
        item.related = relatedMap[item.link];
      }
    });
    console.log('Merged related recommendations');
  }

  console.log('Inferring themes...');
  const themes = inferThemes(items);
  
  console.log('Inferring galaxies...');
  const { galaxies, bridges } = inferGalaxies(items);
  console.log(`Found ${galaxies.length} galaxies, ${bridges.length} bridges`);
  
  console.log('Inferring relations...');
  const relations = inferRelations(items);
  console.log(`Found ${relations.length} relations`);
  
  const output = {
    meta: {
      syncedAt: new Date().toISOString(),
      count: items.length
    },
    themes,
    galaxies,
    bridges,
    items,
    relations
  };
  
  writeFileSync(join(dataDir, 'bookmarks.json'), JSON.stringify(output, null, 2));
  console.log('Saved to data/bookmarks.json');
}

main().catch(console.error);
