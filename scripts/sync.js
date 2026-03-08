#!/usr/bin/env node
/**
 * Sync bookmarks from Raindrop.io — 增量模式
 * 默认只拉最新的，与本地合并。用 --full 强制全量。
 */
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const fullMode = process.argv.includes('--full');

function getToken() {
  if (process.env.RAINDROP_TOKEN) return process.env.RAINDROP_TOKEN;
  try {
    return execSync(`python3 -c "import json; print(json.load(open('$HOME/.openclaw/openclaw.json')).get('skills',{}).get('entries',{}).get('raindrop',{}).get('apiKey',''))"`, { encoding: 'utf-8' }).trim();
  } catch { return ''; }
}

function fetchPage(script, token, page, perpage = 50) {
  const result = execSync(`${script} GET '/raindrops/0?perpage=${perpage}&page=${page}&sort=-created'`, {
    encoding: 'utf-8',
    env: { ...process.env, RAINDROP_TOKEN: token }
  });
  return JSON.parse(result);
}

async function fetchBookmarks() {
  const script = '/Users/kenefe/clawd/skills/raindrop/scripts/raindrop.sh';
  const token = getToken();
  const perpage = 50;
  const bookmarksPath = join(dataDir, 'bookmarks.json');

  // 增量模式：读取本地已有数据
  let existingItems = [];
  let existingIds = new Set();
  if (!fullMode && existsSync(bookmarksPath)) {
    try {
      const local = JSON.parse(readFileSync(bookmarksPath, 'utf-8'));
      existingItems = local.items || [];
      existingIds = new Set(existingItems.map(i => i._id));
      console.log(`本地已有 ${existingItems.length} 条`);
    } catch (e) {
      console.log('本地数据损坏，改用全量模式');
    }
  }

  if (fullMode || existingItems.length === 0) {
    // 全量模式
    console.log('全量拉取...');
    let page = 0, all = [];
    while (true) {
      const data = fetchPage(script, token, page, perpage);
      const items = data.items || [];
      all.push(...items);
      console.log(`Fetched page ${page}: ${items.length} items (total: ${all.length})`);
      if (items.length < perpage) break;
      page++;
    }
    return { items: all, count: all.length };
  }

  // 增量模式：只拉到遇到已有的为止
  console.log('增量拉取...');
  let page = 0, newItems = [];
  let done = false;
  while (!done) {
    const data = fetchPage(script, token, page, perpage);
    const items = data.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      if (existingIds.has(item._id)) {
        done = true;
        break;
      }
      newItems.push(item);
    }
    console.log(`Fetched page ${page}: ${items.length} items (${newItems.length} new)`);
    if (items.length < perpage) break;
    page++;
  }

  if (newItems.length === 0) {
    console.log('没有新收藏');
    return { items: existingItems, count: existingItems.length, incremental: true };
  }

  // 合并：新的在前，旧的在后（按创建时间降序）
  const merged = [...newItems, ...existingItems];
  console.log(`新增 ${newItems.length} 条，合并后 ${merged.length} 条`);
  return { items: merged, count: merged.length, incremental: true };
}

function inferRelations(items) {
  const tagIndex = {};
  items.forEach((item, idx) => {
    (item.tags || []).forEach(tag => {
      if (!tagIndex[tag]) tagIndex[tag] = [];
      tagIndex[tag].push(idx);
    });
  });

  const pairMap = new Map();
  for (const [tag, indices] of Object.entries(tagIndex)) {
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

  return Array.from(pairMap.values())
    .filter(p => p.strength >= 2)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5000)
    .map(p => ({
      source: items[p.i]._id,
      target: items[p.j]._id,
      strength: p.strength,
      reason: p.reasons.join(', ')
    }));
}

function extractHighlights(note) {
  if (!note) return [];
  const highlights = [];
  const patterns = [
    /——([^。；]+)/g,
    /：([^。；，]{10,40})/g,
    /「([^」]+)」/g,
    /"([^"]+)"/g,
  ];
  patterns.forEach(p => {
    let m;
    while ((m = p.exec(note)) !== null) {
      const h = m[1].trim();
      if (h.length > 5 && h.length < 50) highlights.push(h);
    }
  });
  if (highlights.length === 0 && note.length > 10) {
    const first = note.slice(0, 60).replace(/[。；].*$/, '');
    if (first) highlights.push(first);
  }
  return highlights.slice(0, 3);
}

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
  const tagMap = {};
  items.forEach((item, idx) => {
    let tags = (item.tags || []).map(normalizeTag);
    if (tags.length === 0) tags = ['其他'];
    tags.forEach(tag => {
      const parts = tag.split('/');
      const root = normalizeTag(parts[0]);
      const sub = parts.length > 1 ? parts.slice(1).join('/') : null;
      if (!tagMap[root]) tagMap[root] = { indices: new Set(), children: {} };
      tagMap[root].indices.add(idx);
      if (sub) {
        if (!tagMap[root].children[sub]) tagMap[root].children[sub] = new Set();
        tagMap[root].children[sub].add(idx);
      }
    });
    item.highlights_text = extractHighlights(item.note);
    item.themes = tags.map(t => normalizeTag(t.split('/')[0]).toLowerCase());
  });

  const themes = [];
  let colorIdx = 0;
  const sorted = Object.entries(tagMap).sort((a, b) => b[1].indices.size - a[1].indices.size);
  for (const [tag, data] of sorted) {
    const theme = {
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      name: TAG_NAMES[tag] || tag,
      color: COLORS[colorIdx++ % COLORS.length],
      count: data.indices.size,
      items: [...data.indices].map(i => items[i]._id)
    };
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

function inferGalaxies(items) {
  const COLORS = ['#C4785A', '#7A8B6E', '#5A6B7A', '#8B6E7A', '#B8A060', '#6B8B8B', '#9C7A5A', '#7A6B8B', '#8B7A6E', '#5A7A6B', '#8B8B5A', '#5A8B7A'];
  const galaxies = [];
  const assigned = new Set();
  let gIdx = 0;

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

  const unassigned = items.map((_, i) => i).filter(i => !assigned.has(i));
  if (unassigned.length > 0) {
    galaxies.push({
      id: 'galaxy-explore', name: '散星', color: '#9C948A',
      members: unassigned.map(i => items[i]._id), count: unassigned.length
    });
  }

  const bridges = [];
  for (let i = 0; i < galaxies.length; i++) {
    for (let j = i + 1; j < galaxies.length; j++) {
      const shared = galaxies[i].members.filter(id => galaxies[j].members.includes(id));
      const tagsI = galaxies[i].name.split('+').map(s => s.trim());
      const tagsJ = galaxies[j].name.split('+').map(s => s.trim());
      const sharedTags = tagsI.filter(t => tagsJ.includes(t));
      const strength = shared.length + sharedTags.length * 3;
      if (strength > 0) bridges.push({ source: galaxies[i].id, target: galaxies[j].id, strength, shared });
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
  console.log('Syncing bookmarks from Raindrop...');
  const data = await fetchBookmarks();

  if (!data.items || data.items.length === 0) {
    console.error('Failed to fetch bookmarks');
    process.exit(1);
  }

  const items = data.items;

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
    meta: { syncedAt: new Date().toISOString(), count: items.length },
    themes, galaxies, bridges, items, relations
  };

  // 合并 pending summaries（LLM 写的精炼看点）
  const pendingPath = join(dataDir, 'pending-summaries.json');
  if (existsSync(pendingPath)) {
    try {
      const pending = JSON.parse(readFileSync(pendingPath, 'utf-8'));
      let merged = 0;
      for (const item of output.items) {
        if (pending[item.link]) {
          item.summary = pending[item.link];
          delete pending[item.link];
          merged++;
        }
      }
      // 写回剩余的（还没 sync 到的条目）
      if (Object.keys(pending).length > 0) {
        writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
      } else {
        // 全部合并完，删除 pending 文件
        const { unlinkSync } = require('fs');
        unlinkSync(pendingPath);
      }
      if (merged > 0) console.log(`Merged ${merged} pending summaries`);
    } catch (e) {
      console.error(`Warning: pending summaries merge failed: ${e.message}`);
    }
  }

  writeFileSync(join(dataDir, 'bookmarks.json'), JSON.stringify(output, null, 2));
  console.log('Saved to data/bookmarks.json');
}

main().catch(console.error);
